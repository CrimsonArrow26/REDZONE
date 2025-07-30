import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteAnalyzer.css';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import RouteMap from './RouteMap';
import { geocodeAddress } from '../utils/geocoding';

const supabase = createClient('https://shqfvfjsxtdeknqncjfa.supabase.co', 'your_supabase_key');

const RouteAnalyzer = () => {
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
  const [redZones, setRedZones] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[]>([]);

  const geocode = async (place: string): Promise<L.LatLng | null> => {
    try {
      const result = await geocodeAddress(place);
      if (result) {
        return L.latLng(result.lat, result.lng);
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const mapDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calculateRisk = (routeCoords: { lat: number; lng: number }[], redZones: { lat: number; lng: number }[]) => {
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

  const handleAnalyze = async () => {
    const src = await geocode(source);
    const dest = await geocode(destination);
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

    // Normalize red zone structure
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
          <input className="route-analyzer-input" value={source} onChange={e => setSource(e.target.value)} placeholder="Enter Source Location" />
          <input className="route-analyzer-input" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Enter Destination" />
          <button className="analyze" onClick={handleAnalyze}>Analyze</button>
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
