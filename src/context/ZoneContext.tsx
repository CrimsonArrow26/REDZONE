import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SafetyMonitor } from '../utils/safetyMonitor';
import { SOSService } from '../utils/sosService';

// Supabase setup
const supabaseUrl = 'https://shqfvfjsxtdeknqncjfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc';
const supabase = createClient(supabaseUrl, supabaseKey); 

// Haversine formula to compute distance between two geo points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Context type
interface ZoneContextType {
  currentZone: any;
  isSafe: boolean;
  userLocation: { lat: number; lng: number } | null;
  zones: any[];
  safetyMonitor: SafetyMonitor | null;
  sosService: SOSService | null;
  voiceSessions: Map<string, any>;
  activeSessionCount: number;
  currentVoiceLevel: number;
  createVoiceSession: (sessionId: string, keywords?: string[]) => Promise<boolean>;
  startVoiceSession: (sessionId: string) => boolean;
  stopVoiceSession: (sessionId: string) => boolean;
  updateKeywords: (sessionId: string, keywords: string[]) => boolean;
  getSessionTranscript: (sessionId: string) => string;
  safetyCallbacks: {
    onSpeedAccident?: (details: any) => void;
    onStationaryAlert?: (details: any) => void;
    onVoiceKeyword?: (details: any) => void;
    onVoiceLevel?: (details: any) => void;
    onTranscriptUpdate?: (sessionId: string, transcript: string) => void;
  };
  setSafetyCallbacks: (callbacks: any) => void;
}

const ZoneContext = createContext<ZoneContextType>({
  currentZone: null,
  isSafe: true,
  userLocation: null,
  zones: [],
  safetyMonitor: null,
  sosService: null,
  voiceSessions: new Map(),
  activeSessionCount: 0,
  currentVoiceLevel: 0,
  createVoiceSession: async () => false,
  startVoiceSession: () => false,
  stopVoiceSession: () => false,
  updateKeywords: () => false,
  getSessionTranscript: () => '',
  safetyCallbacks: {},
  setSafetyCallbacks: () => {},
});

export const ZoneProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  
  // Safety monitoring state
  const [safetyMonitor, setSafetyMonitor] = useState<SafetyMonitor | null>(null);
  const [sosService, setSosService] = useState<SOSService | null>(null);
  const [voiceSessions, setVoiceSessions] = useState(new Map());
  const [activeSessionCount, setActiveSessionCount] = useState(0);
  const [currentVoiceLevel, setCurrentVoiceLevel] = useState(0);
  const [safetyCallbacks, setSafetyCallbacks] = useState({});

  // Initialize safety monitoring services
  useEffect(() => {
    const sosServiceInstance = new SOSService();
    const safetyMonitorInstance = new SafetyMonitor(sosServiceInstance);
    
    setSosService(sosServiceInstance);
    setSafetyMonitor(safetyMonitorInstance);
    
    console.log('🔧 Safety monitoring services initialized');
    
    return () => {
      // Cleanup on unmount
      if (safetyMonitorInstance) {
        safetyMonitorInstance.stopMonitoring();
      }
    };
  }, []);

  // Fetch red zones from Supabase
  useEffect(() => {
    async function fetchZones() {
      const { data, error } = await supabase.from('red_zones').select('*');
      if (error) {
        console.error('Error fetching zones:', error);
      } else {
        setZones(data || []);
      }
    }
    fetchZones();
  }, []);

  // Track user location in real-time
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Detect if user is inside any red zone
  useEffect(() => {
    if (userLocation && zones.length > 0) {
      const foundZone = zones.find((zone) => {
        const dist = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(zone.latitude),
          parseFloat(zone.longitude)
        );
        return dist < 500; // zone radius threshold
      });

      setCurrentZone(foundZone || null);
    }
  }, [userLocation, zones]);

  // Alert when entering red zone and start safety monitoring
  useEffect(() => {
    if (currentZone && !alertShown) {
      const zoneName = currentZone.name || 'a Red Zone';
      alert(`⚠ Alert: You have entered ${zoneName}. Please stay alert.`);

      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300]);
      }

      // Start safety monitoring when entering red zone
      if (safetyMonitor) {
        const callbacks = {
          onSpeedAccident: (details: any) => {
            console.log('🚨 Speed accident detected:', details);
            if (safetyCallbacks.onSpeedAccident) {
              safetyCallbacks.onSpeedAccident(details);
            }
          },
          onStationaryAlert: (details: any) => {
            console.log('🚶 Stationary alert:', details);
            if (safetyCallbacks.onStationaryAlert) {
              safetyCallbacks.onStationaryAlert(details);
            }
          },
          onVoiceKeyword: (details: any) => {
            console.log('🎤 Voice keyword detected:', details);
            if (safetyCallbacks.onVoiceKeyword) {
              safetyCallbacks.onVoiceKeyword(details);
            }
          },
          onVoiceLevel: (details: any) => {
            console.log('🔊 Voice level alert:', details);
            if (safetyCallbacks.onVoiceLevel) {
              safetyCallbacks.onVoiceLevel(details);
            }
          },
          onTranscriptUpdate: (sessionId: string, transcript: string) => {
            if (safetyCallbacks.onTranscriptUpdate) {
              safetyCallbacks.onTranscriptUpdate(sessionId, transcript);
            }
          }
        };

        safetyMonitor.startMonitoring(currentZone.id, callbacks);
        
        // Update voice sessions and stats periodically
        const updateInterval = setInterval(() => {
          if (safetyMonitor) {
            setVoiceSessions(new Map(safetyMonitor.getVoiceSessions()));
            setActiveSessionCount(safetyMonitor.getActiveSessionCount());
            setCurrentVoiceLevel(safetyMonitor.getCurrentVoiceLevel());
          }
        }, 1000);

        // Store interval for cleanup
        (window as any).safetyUpdateInterval = updateInterval;
      }

      setAlertShown(true);
    }

    if (!currentZone) {
      // Stop safety monitoring when leaving red zone
      if (safetyMonitor) {
        safetyMonitor.stopMonitoring();
      }
      
      // Clear update interval
      if ((window as any).safetyUpdateInterval) {
        clearInterval((window as any).safetyUpdateInterval);
        (window as any).safetyUpdateInterval = null;
      }
      
      // Reset state
      setVoiceSessions(new Map());
      setActiveSessionCount(0);
      setCurrentVoiceLevel(0);
      setAlertShown(false);
    }
  }, [currentZone, safetyMonitor, safetyCallbacks]);

  // Voice session management functions
  const createVoiceSession = async (sessionId: string, keywords?: string[]): Promise<boolean> => {
    if (!safetyMonitor) return false;
    const result = await safetyMonitor.createVoiceSession(sessionId, keywords);
    if (result) {
      setVoiceSessions(new Map(safetyMonitor.getVoiceSessions()));
    }
    return result;
  };

  const startVoiceSession = (sessionId: string): boolean => {
    if (!safetyMonitor) return false;
    const result = safetyMonitor.startVoiceSession(sessionId);
    if (result) {
      setActiveSessionCount(safetyMonitor.getActiveSessionCount());
    }
    return result;
  };

  const stopVoiceSession = (sessionId: string): boolean => {
    if (!safetyMonitor) return false;
    const result = safetyMonitor.stopVoiceSession(sessionId);
    if (result) {
      setActiveSessionCount(safetyMonitor.getActiveSessionCount());
    }
    return result;
  };

  const updateKeywords = (sessionId: string, keywords: string[]): boolean => {
    if (!safetyMonitor) return false;
    return safetyMonitor.updateKeywords(sessionId, keywords);
  };

  const getSessionTranscript = (sessionId: string): string => {
    if (!safetyMonitor) return '';
    return safetyMonitor.getSessionTranscript(sessionId);
  };

  return (
    <ZoneContext.Provider
      value={{
        currentZone,
        isSafe: !currentZone,
        userLocation,
        zones,
        safetyMonitor,
        sosService,
        voiceSessions,
        activeSessionCount,
        currentVoiceLevel,
        createVoiceSession,
        startVoiceSession,
        stopVoiceSession,
        updateKeywords,
        getSessionTranscript,
        safetyCallbacks,
        setSafetyCallbacks,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
};

// Hook for accessing red zone context in any component
export function useZone() {
  return useContext(ZoneContext);
}
