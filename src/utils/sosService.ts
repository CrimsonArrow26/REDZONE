import { createClient } from '@supabase/supabase-js';

// Supabase setup
const supabaseUrl = 'https://shqfvfjsxtdeknqncjfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AlertDetails {
  type: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  metadata?: any;
}

export interface VoiceKeywordAlert extends AlertDetails {
  sessionId: string;
  keyword: string;
  transcript: string;
  confidence: number;
}

export interface VoiceLevelAlert extends AlertDetails {
  voiceLevel: number;
  threshold: number;
}

export interface SpeedAccidentAlert extends AlertDetails {
  type: 'sudden_deceleration' | 'rapid_acceleration';
  previousSpeed: number;
  currentSpeed: number;
  acceleration: number;
}

export interface StationaryAlert extends AlertDetails {
  duration: number;
}

export class SOSService {
  private pendingAlerts: Set<string> = new Set();
  private alertHistory: Map<string, number> = new Map();
  private readonly ALERT_COOLDOWN = 30000; // 30 seconds cooldown between similar alerts
  
  constructor(private userId?: string) {
    this.getUserId();
  }

  private async getUserId() {
    if (this.userId) return this.userId;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || 'anonymous';
      return this.userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      this.userId = 'anonymous';
      return this.userId;
    }
  }

  // Send voice keyword alert (multiple keywords can trigger)
  async sendVoiceKeywordAlert(details: VoiceKeywordAlert) {
    const alertKey = `voice_keyword_${details.keyword}_${details.sessionId}`;
    
    if (this.shouldSkipAlert(alertKey)) {
      console.log(`Skipping duplicate voice keyword alert for ${details.keyword} in session ${details.sessionId}`);
      return;
    }

    console.log('🚨 Sending voice keyword alert:', details);

    try {
      const userId = await this.getUserId();
      const locationAddress = details.location ? await this.reverseGeocode(details.location.latitude, details.location.longitude) : 'Unknown location';

      const alertData = {
        user_id: userId,
        latitude: details.location?.latitude || null,
        longitude: details.location?.longitude || null,
        location_address: locationAddress,
        alert_type: 'voice_keyword',
        status: 'active',
        user_message: `Emergency keyword "${details.keyword}" detected in voice session ${details.sessionId}. Transcript: "${details.transcript}" (Confidence: ${(details.confidence * 100).toFixed(1)}%)`,
        red_zone_id: await this.getCurrentRedZoneId(),
        metadata: JSON.stringify({
          sessionId: details.sessionId,
          keyword: details.keyword,
          transcript: details.transcript,
          confidence: details.confidence,
          voiceLevel: details.metadata?.voiceLevel || null
        })
      };

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select();

      if (error) {
        console.error('Error sending voice keyword alert:', error);
        throw error;
      }

      console.log('✅ Voice keyword alert sent successfully:', data);
      this.markAlertSent(alertKey);
      
    } catch (error) {
      console.error('Failed to send voice keyword alert:', error);
      throw error;
    }
  }

  // Send voice level alert (high volume detected)
  async sendVoiceLevelAlert(details: VoiceLevelAlert) {
    const alertKey = `voice_level_${Math.floor(details.voiceLevel * 100)}`;
    
    if (this.shouldSkipAlert(alertKey)) {
      console.log(`Skipping duplicate voice level alert`);
      return;
    }

    console.log('🔊 Sending voice level alert:', details);

    try {
      const userId = await this.getUserId();
      const locationAddress = details.location ? await this.reverseGeocode(details.location.latitude, details.location.longitude) : 'Unknown location';

      const alertData = {
        user_id: userId,
        latitude: details.location?.latitude || null,
        longitude: details.location?.longitude || null,
        location_address: locationAddress,
        alert_type: 'voice_level',
        status: 'active',
        user_message: `High voice level detected: ${(details.voiceLevel * 100).toFixed(1)}% (Threshold: ${(details.threshold * 100).toFixed(1)}%). Possible distress situation.`,
        red_zone_id: await this.getCurrentRedZoneId(),
        metadata: JSON.stringify({
          voiceLevel: details.voiceLevel,
          threshold: details.threshold,
          percentage: details.voiceLevel * 100
        })
      };

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select();

      if (error) {
        console.error('Error sending voice level alert:', error);
        throw error;
      }

      console.log('✅ Voice level alert sent successfully:', data);
      this.markAlertSent(alertKey);
      
    } catch (error) {
      console.error('Failed to send voice level alert:', error);
      throw error;
    }
  }

  // Send speed accident alert (sudden deceleration/acceleration)
  async sendSpeedAccidentAlert(details: SpeedAccidentAlert) {
    const alertKey = `speed_${details.type}_${Date.now()}`;
    
    if (this.shouldSkipAlert(`speed_${details.type}`)) {
      console.log(`Skipping duplicate speed alert for ${details.type}`);
      return;
    }

    console.log('⚡ Sending speed accident alert:', details);

    try {
      const userId = await this.getUserId();
      const locationAddress = details.location ? await this.reverseGeocode(details.location.latitude, details.location.longitude) : 'Unknown location';

      let message = '';
      if (details.type === 'sudden_deceleration') {
        message = `Sudden deceleration detected: from ${details.previousSpeed.toFixed(1)} km/h to ${details.currentSpeed.toFixed(1)} km/h (${details.acceleration.toFixed(1)} km/h/s). Possible accident.`;
      } else {
        message = `Rapid acceleration detected: from ${details.previousSpeed.toFixed(1)} km/h to ${details.currentSpeed.toFixed(1)} km/h (${details.acceleration.toFixed(1)} km/h/s). Unusual driving behavior.`;
      }

      const alertData = {
        user_id: userId,
        latitude: details.location?.latitude || null,
        longitude: details.location?.longitude || null,
        location_address: locationAddress,
        alert_type: 'speed_accident',
        status: 'active',
        user_message: message,
        red_zone_id: await this.getCurrentRedZoneId(),
        metadata: JSON.stringify({
          accidentType: details.type,
          previousSpeed: details.previousSpeed,
          currentSpeed: details.currentSpeed,
          acceleration: details.acceleration
        })
      };

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select();

      if (error) {
        console.error('Error sending speed accident alert:', error);
        throw error;
      }

      console.log('✅ Speed accident alert sent successfully:', data);
      this.markAlertSent(`speed_${details.type}`);
      
    } catch (error) {
      console.error('Failed to send speed accident alert:', error);
      throw error;
    }
  }

  // Send stationary user alert
  async sendStationaryAlert(details: StationaryAlert) {
    const alertKey = `stationary_${Math.floor(details.duration)}min`;
    
    if (this.shouldSkipAlert('stationary')) {
      console.log(`Skipping duplicate stationary alert`);
      return;
    }

    console.log('🚶 Sending stationary alert:', details);

    try {
      const userId = await this.getUserId();
      const locationAddress = details.location ? await this.reverseGeocode(details.location.latitude, details.location.longitude) : 'Unknown location';

      const alertData = {
        user_id: userId,
        latitude: details.location?.latitude || null,
        longitude: details.location?.longitude || null,
        location_address: locationAddress,
        alert_type: 'stationary_user',
        status: 'active',
        user_message: `User has been stationary in red zone for ${details.duration.toFixed(1)} minutes. No movement detected.`,
        red_zone_id: await this.getCurrentRedZoneId(),
        stationary_duration_minutes: Math.round(details.duration),
        metadata: JSON.stringify({
          exactDuration: details.duration,
          alertThreshold: 10 // minutes
        })
      };

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select();

      if (error) {
        console.error('Error sending stationary alert:', error);
        throw error;
      }

      console.log('✅ Stationary alert sent successfully:', data);
      this.markAlertSent('stationary');
      
    } catch (error) {
      console.error('Failed to send stationary alert:', error);
      throw error;
    }
  }

  // Send custom alert with multiple parameters
  async sendCustomAlert(alertType: string, message: string, metadata?: any, location?: { latitude: number; longitude: number }) {
    const alertKey = `custom_${alertType}_${Date.now()}`;
    
    console.log('📢 Sending custom alert:', { alertType, message, metadata });

    try {
      const userId = await this.getUserId();
      const locationAddress = location ? await this.reverseGeocode(location.latitude, location.longitude) : 'Unknown location';

      const alertData = {
        user_id: userId,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_address: locationAddress,
        alert_type: alertType,
        status: 'active',
        user_message: message,
        red_zone_id: await this.getCurrentRedZoneId(),
        metadata: metadata ? JSON.stringify(metadata) : null
      };

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select();

      if (error) {
        console.error('Error sending custom alert:', error);
        throw error;
      }

      console.log('✅ Custom alert sent successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Failed to send custom alert:', error);
      throw error;
    }
  }

  // Get all active alerts for current user
  async getUserAlerts() {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user alerts:', error);
      return [];
    }
  }

  // Mark an alert as resolved
  async resolveAlert(alertId: number) {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId)
        .select();

      if (error) {
        console.error('Error resolving alert:', error);
        throw error;
      }

      console.log('✅ Alert resolved:', data);
      return data;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }

  // Helper methods
  private shouldSkipAlert(alertKey: string): boolean {
    const now = Date.now();
    const lastAlert = this.alertHistory.get(alertKey);
    
    if (lastAlert && (now - lastAlert) < this.ALERT_COOLDOWN) {
      return true; // Skip if within cooldown period
    }
    
    return false;
  }

  private markAlertSent(alertKey: string) {
    this.alertHistory.set(alertKey, Date.now());
  }

  private async getCurrentRedZoneId(): Promise<number | null> {
    try {
      // This would typically get the current red zone the user is in
      // For now, return null if not implemented
      return null;
    } catch (error) {
      console.error('Error getting current red zone:', error);
      return null;
    }
  }

  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ClockTower Safety App 1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      } else {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Bulk operations for multiple alerts
  async sendMultipleAlerts(alerts: Array<{
    type: string;
    message: string;
    location?: { latitude: number; longitude: number };
    metadata?: any;
  }>) {
    const results = await Promise.allSettled(
      alerts.map(alert => 
        this.sendCustomAlert(alert.type, alert.message, alert.metadata, alert.location)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📊 Bulk alert results: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };
  }

  // Get alert statistics
  async getAlertStats() {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('alert_type, status, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching alert stats:', error);
        return null;
      }

      const stats = {
        total: data?.length || 0,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        recent: data?.filter(a => new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0
      };

      data?.forEach(alert => {
        stats.byType[alert.alert_type] = (stats.byType[alert.alert_type] || 0) + 1;
        stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get alert stats:', error);
      return null;
    }
  }
}