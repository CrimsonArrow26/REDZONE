// src/pages/RouteAnalyzer.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import './RouteAnalyzer.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://shqfvfjsxtdeknqncjfa.supabase.co', 'your_supabase_key');

const RouteMap = ({ waypoints, redZones }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      show: false,
    }).addTo(map);

    redZones.forEach(zone => {
      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        color: 'red',
        radius: 6,
      }).addTo(map);
      marker.bindPopup(zone.name || 'Red Zone');
    });

    return () => map.removeControl(control);
  }, [map, waypoints, redZones]);

  return null;
};

const RouteAnalyzer = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [redZones, setRedZones] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');

  const geocode = async (place) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
    const data = await res.json();
    if (data[0]) {
      return L.latLng(data[0].lat, data[0].lon);
    }
    return null;
  };

  const calculateRisk = (routeCoords, redZones) => {
    let count = 0;
    redZones.forEach(zone => {
      routeCoords.forEach(coord => {
        const dist = mapDistance(coord.lat, coord.lng, zone.latitude, zone.longitude);
        if (dist < 0.5) count++; // 0.5 km
      });
    });
    if (count === 0) return 'Low';
    if (count <= 3) return 'Medium';
    return 'High';
  };

  const mapDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleAnalyze = async () => {
    const src = await geocode(source);
    const dest = await geocode(destination);
    if (src && dest) {
      setWaypoints([src, dest]);

      const { data } = await supabase.from('red_zones').select('*');
      setRedZones(data || []);

      // Wait briefly then analyze risk
      setTimeout(() => {
        const latlngs = [src, dest]; // In real usage you'd interpolate points
        const level = calculateRisk(latlngs, data || []);
        setRiskLevel(level);
      }, 1000);
    }
  };

  return (
    <div className="route-analyzer-page">
      <h2>Route Risk Analyzer</h2>
      <div className="inputs">
        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Enter Source Location" />
        <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Enter Destination" />
        <button onClick={handleAnalyze}>Analyze</button>
      </div>

      <div className="map-container">
        <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RouteMap waypoints={waypoints} redZones={redZones} />
        </MapContainer>
      </div>

      {riskLevel && (
        <div className={`risk-level risk-${riskLevel.toLowerCase()}`}>
          Risk Level: {riskLevel}
        </div>
      )}
    </div>
  );
};

export default RouteAnalyzer;
