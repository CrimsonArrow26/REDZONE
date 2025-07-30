import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteAnalyzer.css';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import RouteMap from './RouteMap';
import { geocodeAddress } from '../utils/geocoding';

const supabase = createClient(
  'https://shqfvfjsxtdeknqncjfa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc'
);

const RouteAnalyzer = () => {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
  const [redZones, setRedZones] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[]>([]);

  // Haversine distance helper
  const mapDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // New geocode function: gets closest match near Pune from geocodeAddress results
  const geocodeClosestMatch = async (place: string): Promise<L.LatLng | null> => {
    const referenceLat = 18.5204; // Pune
    const referenceLng = 73.8567;

    try {
      // Assume geocodeAddress returns array of results for the place
      const results = await geocodeAddress(place);
      if (!results || results.length === 0) return null;

      // Sort by distance to Pune
      results.sort((a: any, b: any) => {
        const distA = mapDistance(referenceLat, referenceLng, a.lat, a.lng);
        const distB = mapDistance(referenceLat, referenceLng, b.lat, b.lng);
        return distA - distB;
      });

      const closest = results[0];
      return L.latLng(closest.lat, closest.lng);
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Risk calculation unchanged
  const calculateRisk = (
    routeCoords: { lat: number; lng: number }[],
    redZones: { lat: number; lng: number }[]
  ) => {
    let count = 0;
    redZones.forEach(zone => {
      routeCoords.forEach(coord => {
        const dist = mapDistance(coord.lat, coord.lng, zone.lat, zone.lng);
        if (dist < 0.5) count++; // 0.5 km
      });
    });
    if (count === 0) return 'Low';
    if (count <= 3) return 'Medium';
    return 'High';
  };

  // Use new geocodeClosestMatch here
  const handleAnalyze = async () => {
    const src = await geocodeClosestMatch(source);
    const dest = await geocodeClosestMatch(destination);

    if (src && dest) {
      setWaypoints([src, dest]);
      const { data } = await supabase.from('red_zones').select('*');
      setRedZones(data || []);
    } else {
      setRiskLevel('');
      alert('Could not geocode one or both locations. Please check your input.');
    }
  };

  useEffect(() => {
    if (routeCoords.length === 0 || redZones.length === 0) return;

    const zones = redZones.map(zone =>
      zone.latitude && zone.longitude
        ? { lat: zone.latitude, lng: zone.longitude }
        : { lat: zone.coordinates[0], lng: zone.coordinates[1] }
    );

    const level = calculateRisk(routeCoords, zones);
    setRiskLevel(level);
  }, [routeCoords, redZones]);

  return (
    <div className="route-analyzer-page">
      <div className="route-analyzer-header-wrapper">
        <Header title="Route Risk Analyzer" />
      </div>
      <div className="route-analyzer-main-content">
        <div className="inputs route-analyzer-inputs">

          {/* Input with pin icon styling */}
          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input
              className="route-analyzer-input"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Enter Source Location"
            />
          </div>

          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input
              className="route-analyzer-input"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Enter Destination"
            />
          </div>

          <button className="analyze" onClick={handleAnalyze}>
            Analyze
          </button>
        </div>

        <div className="route-analyzer-map-container">
          <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RouteMap waypoints={waypoints} redZones={redZones} onRouteFound={setRouteCoords} />
          </MapContainer>
        </div>

        {riskLevel && (
          <div className={`risk-level risk-${riskLevel.toLowerCase()} route-analyzer-risk-level`}>
            Risk Level: {riskLevel}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteAnalyzer;
