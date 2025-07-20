import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shqfvfjsxtdeknqncjfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc';
const supabase = createClient(supabaseUrl, supabaseKey);

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

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

  // Fetch zones from Supabase
  useEffect(() => {
    async function fetchZones() {
      const { data } = await supabase.from('red_zones').select('*');
      setZones(data || []);
    }
    fetchZones();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => setUserLocation(null)
      );
    }
  }, []);

  // Detect current zone
  useEffect(() => {
    if (userLocation && zones.length) {
      const found = zones.find(zone => {
        const dist = haversineDistance(
          userLocation.lat, userLocation.lng,
          parseFloat(zone.latitude), parseFloat(zone.longitude)
        );
        return dist < 500; // 500m radius
      });
      setCurrentZone(found || null);
    }
  }, [userLocation, zones]);

  return (
    <ZoneContext.Provider value={{
      currentZone,
      isSafe: !currentZone,
      userLocation,
      zones,
    }}>
      {children}
    </ZoneContext.Provider>
  );
};

export function useZone() {
  return useContext(ZoneContext);
} 