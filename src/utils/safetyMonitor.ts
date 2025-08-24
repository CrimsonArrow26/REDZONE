import { SOSService } from './sosService';

export interface VoiceConfig {
  keywords: string[];
  confidenceThreshold: number;
  voiceLevelThreshold: number;
  enabled: boolean;
}

export interface SafetyParams {
  speedThreshold: number; // km/h
  decelerationThreshold: number; // km/h/s
  accelerationThreshold: number; // km/h/s
  stationaryThreshold: number; // minutes
  voiceConfig: VoiceConfig;
}

export interface VoiceSession {
  id: string;
  recognition: SpeechRecognition;
  isActive: boolean;
  keywords: string[];
  transcript: string;
  lastActivity: number;
}

export class SafetyMonitor {
  private isActive: boolean = false;
  private isInRedZone: boolean = false;
  private lastPosition: GeolocationPosition | null = null;
  private lastSpeed: number = 0;
  private stationaryStartTime: number | null = null;
  private safetyParams: SafetyParams;
  private sosService: SOSService;
  
  // Voice recognition properties
  private voiceSessions: Map<string, VoiceSession> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private voiceLevelCheckInterval: number | null = null;
  private currentVoiceLevel: number = 0;
  
  // Callbacks
  private onSpeedAccident?: (details: any) => void;
  private onStationaryAlert?: (details: any) => void;
  private onVoiceKeyword?: (details: any) => void;
  private onVoiceLevel?: (details: any) => void;
  private onTranscriptUpdate?: (sessionId: string, transcript: string) => void;

  constructor(sosService: SOSService) {
    this.sosService = sosService;
    this.safetyParams = {
      speedThreshold: 80, // km/h
      decelerationThreshold: -20, // km/h/s (sudden braking)
      accelerationThreshold: 15, // km/h/s (rapid acceleration)
      stationaryThreshold: 10, // minutes
      voiceConfig: {
        keywords: ['help', 'emergency', 'assist', 'danger', 'accident'],
        confidenceThreshold: 0.7,
        voiceLevelThreshold: 0.8, // 0-1 scale
        enabled: true
      }
    };
  }

  // Initialize safety monitoring when entering red zone
  async startMonitoring(redZoneId: number, callbacks: {
    onSpeedAccident?: (details: any) => void;
    onStationaryAlert?: (details: any) => void;
    onVoiceKeyword?: (details: any) => void;
    onVoiceLevel?: (details: any) => void;
    onTranscriptUpdate?: (sessionId: string, transcript: string) => void;
  } = {}) {
    if (this.isActive) {
      console.log('SafetyMonitor already active');
      return;
    }

    console.log('🚨 Starting safety monitoring in red zone:', redZoneId);
    this.isActive = true;
    this.isInRedZone = true;
    
    // Set callbacks
    this.onSpeedAccident = callbacks.onSpeedAccident;
    this.onStationaryAlert = callbacks.onStationaryAlert;
    this.onVoiceKeyword = callbacks.onVoiceKeyword;
    this.onVoiceLevel = callbacks.onVoiceLevel;
    this.onTranscriptUpdate = callbacks.onTranscriptUpdate;

    // Request permissions and start monitoring
    await this.requestPermissions();
    this.startLocationMonitoring();
    
    if (this.safetyParams.voiceConfig.enabled) {
      await this.initializeAudioMonitoring();
    }
  }

  // Stop all monitoring when leaving red zone
  stopMonitoring() {
    if (!this.isActive) return;

    console.log('🛑 Stopping safety monitoring');
    this.isActive = false;
    this.isInRedZone = false;

    // Stop location monitoring
    if ('geolocation' in navigator && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    // Stop all voice sessions
    this.stopAllVoiceSessions();

    // Clean up audio context
    this.cleanupAudioMonitoring();

    // Reset state
    this.lastPosition = null;
    this.lastSpeed = 0;
    this.stationaryStartTime = null;
  }

  // Create multiple voice recognition sessions
  async createVoiceSession(sessionId: string, keywords: string[] = this.safetyParams.voiceConfig.keywords): Promise<boolean> {
    if (!this.safetyParams.voiceConfig.enabled) {
      console.log('Voice recognition disabled');
      return false;
    }

    // Check if session already exists
    if (this.voiceSessions.has(sessionId)) {
      console.log(`Voice session ${sessionId} already exists`);
      return true;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;

      const session: VoiceSession = {
        id: sessionId,
        recognition,
        isActive: false,
        keywords: keywords,
        transcript: '',
        lastActivity: Date.now()
      };

      // Set up event handlers
      recognition.onstart = () => {
        console.log(`🎤 Voice session ${sessionId} started - listening for keywords:`, keywords);
        session.isActive = true;
        session.lastActivity = Date.now();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.toLowerCase().trim();
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript + ' ';
          }
        }

        // Update session transcript
        session.transcript = finalTranscript + interimTranscript;
        session.lastActivity = Date.now();

        // Notify UI of transcript update
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(sessionId, session.transcript);
        }

        // Check for keywords in final transcript
        if (finalTranscript) {
          this.checkForKeywords(sessionId, finalTranscript, event.results[event.results.length - 1][0].confidence);
        }
      };

      recognition.onerror = (event: any) => {
        console.error(`Voice session ${sessionId} error:`, event.error);
        if (event.error === 'not-allowed') {
          console.error('Microphone access denied');
        } else if (event.error === 'network') {
          // Restart on network errors
          setTimeout(() => this.restartVoiceSession(sessionId), 1000);
        }
      };

      recognition.onend = () => {
        console.log(`Voice session ${sessionId} ended`);
        session.isActive = false;
        
        // Auto-restart if still in red zone and monitoring is active
        if (this.isActive && this.isInRedZone) {
          setTimeout(() => this.restartVoiceSession(sessionId), 500);
        }
      };

      this.voiceSessions.set(sessionId, session);
      return true;

    } catch (error) {
      console.error(`Failed to create voice session ${sessionId}:`, error);
      return false;
    }
  }

  // Start a specific voice session
  startVoiceSession(sessionId: string): boolean {
    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      console.error(`Voice session ${sessionId} not found`);
      return false;
    }

    if (session.isActive) {
      console.log(`Voice session ${sessionId} already active`);
      return true;
    }

    try {
      session.recognition.start();
      return true;
    } catch (error) {
      console.error(`Failed to start voice session ${sessionId}:`, error);
      return false;
    }
  }

  // Stop a specific voice session
  stopVoiceSession(sessionId: string): boolean {
    const session = this.voiceSessions.get(sessionId);
    if (!session) {
      console.error(`Voice session ${sessionId} not found`);
      return false;
    }

    try {
      session.recognition.stop();
      session.isActive = false;
      return true;
    } catch (error) {
      console.error(`Failed to stop voice session ${sessionId}:`, error);
      return false;
    }
  }

  // Restart a voice session
  private restartVoiceSession(sessionId: string) {
    const session = this.voiceSessions.get(sessionId);
    if (!session || !this.isActive || !this.isInRedZone) return;

    try {
      session.recognition.start();
    } catch (error) {
      console.error(`Failed to restart voice session ${sessionId}:`, error);
    }
  }

  // Stop all voice sessions
  private stopAllVoiceSessions() {
    for (const [sessionId, session] of this.voiceSessions) {
      try {
        session.recognition.stop();
        session.isActive = false;
      } catch (error) {
        console.error(`Error stopping voice session ${sessionId}:`, error);
      }
    }
    this.voiceSessions.clear();
  }

  // Check for emergency keywords in transcript
  private checkForKeywords(sessionId: string, transcript: string, confidence: number) {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return;

    const words = transcript.toLowerCase().split(/\s+/);
    
    for (const keyword of session.keywords) {
      if (words.includes(keyword.toLowerCase()) && confidence >= this.safetyParams.voiceConfig.confidenceThreshold) {
        console.log(`🚨 Emergency keyword "${keyword}" detected in session ${sessionId} with confidence ${confidence}`);
        
        const details = {
          sessionId,
          keyword,
          transcript,
          confidence,
          timestamp: new Date().toISOString(),
          location: this.lastPosition ? {
            latitude: this.lastPosition.coords.latitude,
            longitude: this.lastPosition.coords.longitude
          } : null
        };

        // Trigger keyword callback
        if (this.onVoiceKeyword) {
          this.onVoiceKeyword(details);
        }

        // Send SOS alert
        this.sosService.sendVoiceKeywordAlert(details);
        break;
      }
    }
  }

  // Initialize audio monitoring for voice level detection
  private async initializeAudioMonitoring() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true 
        } 
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      // Start voice level monitoring
      this.startVoiceLevelMonitoring();
      
      console.log('🎤 Audio monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize audio monitoring:', error);
    }
  }

  // Monitor voice level continuously
  private startVoiceLevelMonitoring() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVoiceLevel = () => {
      if (!this.isActive || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      this.currentVoiceLevel = (sum / bufferLength) / 255; // Normalize to 0-1

      // Check if voice level exceeds threshold
      if (this.currentVoiceLevel > this.safetyParams.voiceConfig.voiceLevelThreshold) {
        console.log(`🔊 High voice level detected: ${(this.currentVoiceLevel * 100).toFixed(1)}%`);
        
        const details = {
          voiceLevel: this.currentVoiceLevel,
          threshold: this.safetyParams.voiceConfig.voiceLevelThreshold,
          timestamp: new Date().toISOString(),
          location: this.lastPosition ? {
            latitude: this.lastPosition.coords.latitude,
            longitude: this.lastPosition.coords.longitude
          } : null
        };

        if (this.onVoiceLevel) {
          this.onVoiceLevel(details);
        }

        // Send SOS alert for high voice level
        this.sosService.sendVoiceLevelAlert(details);
      }

      // Continue monitoring
      this.voiceLevelCheckInterval = window.setTimeout(checkVoiceLevel, 100);
    };

    checkVoiceLevel();
  }

  // Clean up audio resources
  private cleanupAudioMonitoring() {
    if (this.voiceLevelCheckInterval) {
      clearTimeout(this.voiceLevelCheckInterval);
      this.voiceLevelCheckInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.microphone = null;
  }

  // Request necessary permissions
  private async requestPermissions() {
    // Request microphone permission
    if (this.safetyParams.voiceConfig.enabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
        console.log('🎤 Microphone permission granted');
      } catch (error) {
        console.error('Microphone permission denied:', error);
      }
    }
  }

  // Location monitoring properties
  private watchId: number | null = null;

  // Start location monitoring for speed and position tracking
  private startLocationMonitoring() {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => console.error('Location error:', error),
      options
    );
  }

  // Handle location updates and speed monitoring
  private handleLocationUpdate(position: GeolocationPosition) {
    if (!this.isActive) return;

    const currentTime = Date.now();
    
    if (this.lastPosition) {
      // Calculate speed and acceleration
      const timeDelta = (currentTime - this.lastPosition.timestamp) / 1000; // seconds
      const distance = this.calculateDistance(
        this.lastPosition.coords.latitude,
        this.lastPosition.coords.longitude,
        position.coords.latitude,
        position.coords.longitude
      );
      
      const currentSpeed = (distance / timeDelta) * 3.6; // Convert m/s to km/h
      const acceleration = (currentSpeed - this.lastSpeed) / timeDelta; // km/h/s

      // Check for speed-related incidents
      this.checkSpeedIncidents(currentSpeed, acceleration, position);

      // Check for stationary behavior
      this.checkStationaryBehavior(currentSpeed, position);

      this.lastSpeed = currentSpeed;
    }

    this.lastPosition = position;
  }

  // Check for speed-related accidents or incidents
  private checkSpeedIncidents(currentSpeed: number, acceleration: number, position: GeolocationPosition) {
    // Check for sudden deceleration (potential crash)
    if (acceleration < this.safetyParams.decelerationThreshold) {
      console.log(`🚨 Sudden deceleration detected: ${acceleration.toFixed(1)} km/h/s`);
      
      const details = {
        type: 'sudden_deceleration',
        previousSpeed: this.lastSpeed,
        currentSpeed: currentSpeed,
        acceleration: acceleration,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        timestamp: new Date().toISOString()
      };

      if (this.onSpeedAccident) {
        this.onSpeedAccident(details);
      }

      this.sosService.sendSpeedAccidentAlert(details);
    }

    // Check for rapid acceleration
    if (acceleration > this.safetyParams.accelerationThreshold) {
      console.log(`⚡ Rapid acceleration detected: ${acceleration.toFixed(1)} km/h/s`);
      
      const details = {
        type: 'rapid_acceleration',
        previousSpeed: this.lastSpeed,
        currentSpeed: currentSpeed,
        acceleration: acceleration,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        timestamp: new Date().toISOString()
      };

      if (this.onSpeedAccident) {
        this.onSpeedAccident(details);
      }

      this.sosService.sendSpeedAccidentAlert(details);
    }
  }

  // Check if user has been stationary for too long
  private checkStationaryBehavior(currentSpeed: number, position: GeolocationPosition) {
    const isStationary = currentSpeed < 1; // Less than 1 km/h considered stationary

    if (isStationary) {
      if (!this.stationaryStartTime) {
        this.stationaryStartTime = Date.now();
      } else {
        const stationaryDuration = (Date.now() - this.stationaryStartTime) / (1000 * 60); // minutes
        
        if (stationaryDuration >= this.safetyParams.stationaryThreshold) {
          console.log(`🚨 User stationary for ${stationaryDuration.toFixed(1)} minutes`);
          
          const details = {
            duration: stationaryDuration,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            timestamp: new Date().toISOString()
          };

          if (this.onStationaryAlert) {
            this.onStationaryAlert(details);
          }

          this.sosService.sendStationaryAlert(details);
          this.stationaryStartTime = Date.now(); // Reset to avoid repeated alerts
        }
      }
    } else {
      this.stationaryStartTime = null; // Reset when moving
    }
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Public methods for testing and debugging
  public getVoiceSessions(): Map<string, VoiceSession> {
    return this.voiceSessions;
  }

  public getCurrentVoiceLevel(): number {
    return this.currentVoiceLevel;
  }

  public getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.voiceSessions.values()) {
      if (session.isActive) count++;
    }
    return count;
  }

  public updateKeywords(sessionId: string, newKeywords: string[]): boolean {
    const session = this.voiceSessions.get(sessionId);
    if (!session) return false;
    
    session.keywords = newKeywords;
    console.log(`Updated keywords for session ${sessionId}:`, newKeywords);
    return true;
  }

  public getSessionTranscript(sessionId: string): string {
    const session = this.voiceSessions.get(sessionId);
    return session ? session.transcript : '';
  }
}