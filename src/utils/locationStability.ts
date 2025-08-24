// Location Stability Manager
// Buffers GPS readings and only updates location after confirming stability

interface LocationReading {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface StableLocation {
  lat: number;
  lng: number;
  confidence: number;
  lastUpdated: number;
}

export class LocationStabilityManager {
  private readings: LocationReading[] = [];
  private currentStableLocation: StableLocation | null = null;
  private onLocationChange: ((location: StableLocation) => void) | null = null;
  
  // Configuration
  private readonly maxReadings = 5; // Keep last 5 readings
  private readonly stabilityThreshold = 30; // meters - readings must be within this distance
  private readonly confirmationReadings = 2; // require 2 consistent readings
  private readonly maxAge = 30000; // 30 seconds - discard older readings
  private readonly minTimeBetweenUpdates = 5000; // 5 seconds between location updates

  constructor(onLocationChange?: (location: StableLocation) => void) {
    this.onLocationChange = onLocationChange;
  }

  // Haversine distance in meters
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Add a new GPS reading
  public addReading(lat: number, lng: number, accuracy?: number): void {
    const now = Date.now();
    
    // Add new reading
    this.readings.push({
      lat,
      lng,
      timestamp: now,
      accuracy
    });

    // Remove old readings
    this.readings = this.readings.filter(reading => 
      now - reading.timestamp <= this.maxAge
    );

    // Keep only the most recent maxReadings
    if (this.readings.length > this.maxReadings) {
      this.readings = this.readings.slice(-this.maxReadings);
    }

    // Analyze stability
    this.analyzeStability();
  }

  private analyzeStability(): void {
    if (this.readings.length < this.confirmationReadings) {
      console.log('LocationStability: Not enough readings yet:', this.readings.length);
      return;
    }

    const now = Date.now();
    
    // Check if we've updated location too recently
    if (this.currentStableLocation && 
        now - this.currentStableLocation.lastUpdated < this.minTimeBetweenUpdates) {
      return;
    }

    // Get recent readings for analysis
    const recentReadings = this.readings.slice(-this.confirmationReadings);
    
    // Check if recent readings are consistent (within stability threshold)
    let isStable = true;
    const baseReading = recentReadings[0];
    
    for (let i = 1; i < recentReadings.length; i++) {
      const distance = this.calculateDistance(
        baseReading.lat, baseReading.lng,
        recentReadings[i].lat, recentReadings[i].lng
      );
      
      if (distance > this.stabilityThreshold) {
        isStable = false;
        console.log(`LocationStability: Readings not stable. Distance: ${distance.toFixed(2)}m`);
        break;
      }
    }

    if (isStable) {
      // Calculate average position from stable readings
      const avgLat = recentReadings.reduce((sum, r) => sum + r.lat, 0) / recentReadings.length;
      const avgLng = recentReadings.reduce((sum, r) => sum + r.lng, 0) / recentReadings.length;
      
      // Calculate confidence based on accuracy and consistency
      const avgAccuracy = recentReadings.reduce((sum, r) => sum + (r.accuracy || 100), 0) / recentReadings.length;
      const confidence = Math.max(0, 100 - avgAccuracy); // Higher accuracy = higher confidence
      
      const newStableLocation: StableLocation = {
        lat: avgLat,
        lng: avgLng,
        confidence,
        lastUpdated: now
      };

      // Check if this is significantly different from current stable location
      let shouldUpdate = !this.currentStableLocation;
      
      if (this.currentStableLocation) {
        const distanceFromCurrent = this.calculateDistance(
          this.currentStableLocation.lat, this.currentStableLocation.lng,
          avgLat, avgLng
        );
        
        // Only update if moved significantly or if confidence is much higher
        shouldUpdate = distanceFromCurrent > this.stabilityThreshold || 
          (confidence > this.currentStableLocation.confidence + 20);
        
        if (shouldUpdate) {
          console.log(`LocationStability: Updating location. Distance moved: ${distanceFromCurrent.toFixed(2)}m, Confidence: ${confidence.toFixed(1)}`);
        }
      } else {
        console.log(`LocationStability: First stable location established. Confidence: ${confidence.toFixed(1)}`);
      }

      if (shouldUpdate) {
        this.currentStableLocation = newStableLocation;
        
        if (this.onLocationChange) {
          this.onLocationChange(newStableLocation);
        }
      }
    }
  }

  // Get current stable location
  public getCurrentStableLocation(): StableLocation | null {
    return this.currentStableLocation;
  }

  // Set callback for location changes
  public setLocationChangeCallback(callback: (location: StableLocation) => void): void {
    this.onLocationChange = callback;
  }

  // Reset the system (useful for testing)
  public reset(): void {
    this.readings = [];
    this.currentStableLocation = null;
    console.log('LocationStability: System reset');
  }

  // Get debug information
  public getDebugInfo(): any {
    return {
      readings: this.readings,
      currentStableLocation: this.currentStableLocation,
      readingCount: this.readings.length,
      oldestReading: this.readings.length > 0 ? new Date(this.readings[0].timestamp).toLocaleTimeString() : null,
      newestReading: this.readings.length > 0 ? new Date(this.readings[this.readings.length - 1].timestamp).toLocaleTimeString() : null
    };
  }
}

// Singleton instance for global use
export const locationStability = new LocationStabilityManager();