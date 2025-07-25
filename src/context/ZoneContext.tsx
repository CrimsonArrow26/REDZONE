import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
const ZoneContext = createContext({
  currentZone: null,
  isSafe: true,
  userLocation: null,
  zones: [],
});

export const ZoneProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const [alertShown, setAlertShown] = useState(false);

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

  // Alert when entering red zone
  useEffect(() => {
    if (currentZone && !alertShown) {
      const zoneName = currentZone.name || 'a Red Zone';
      alert(`⚠ Alert: You have entered ${zoneName}. Please stay alert.`);

      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300]);
      }

      setAlertShown(true);
    }

    if (!currentZone) {
      setAlertShown(false); // reset when out of danger zone
    }
  }, [currentZone]);

  return (
    <ZoneContext.Provider
      value={{
        currentZone,
        isSafe: !currentZone,
        userLocation,
        zones,
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
