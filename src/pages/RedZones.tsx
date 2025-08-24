import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { AlertTriangle, Users, Calendar } from 'lucide-react';
import Header from '../components/Header';
import 'leaflet/dist/leaflet.css';
import './RedZones.css';
import L from 'leaflet';
import { Marker, Popup, Circle } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { locationStability } from '../utils/locationStability';

// Your Supabase project URL and anon key
const supabaseUrl = 'https://shqfvfjsxtdeknqncjfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc';
const supabase = createClient(supabaseUrl, supabaseKey);

interface RedZone {
  id: string;
  name: string;
  coordinates: [number, number];
  crimeRate: number;
  incidentCount: number;
  lastIncident: string;
  risk_level: 'high' | 'medium' | 'low'; // use snake_case to match backend
  radius: number; // meters
}

interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  red_zone_id?: string;
  // ... other fields ...
}

const RedZones: React.FC = () => {
  const [redZones, setRedZones] = useState<RedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const showBack = location.state?.fromHome;
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [inZone, setInZone] = useState<RedZone | null>(null);
  const [hasNotified, setHasNotified] = useState(false);
  const navigate = useNavigate();

  // Haversine distance in meters
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Validate coordinates
  function isValidCoordinate(lat: any, lng: any): boolean {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return !isNaN(latNum) && !isNaN(lngNum) && 
           latNum >= -90 && latNum <= 90 && 
           lngNum >= -180 && lngNum <= 180;
  }

  useEffect(() => {
    let watchId: number | null = null;
    
    if (navigator.geolocation) {
      // Use existing stable location if available
      const currentStable = locationStability.getCurrentStableLocation();
      if (currentStable) {
        console.log('RedZones: Using existing stable location:', currentStable);
        setUserLocation({ 
          lat: currentStable.lat, 
          lng: currentStable.lng 
        });
      }

      // Set up callback for location updates (but don't override ZoneContext callback)
      const handleLocationUpdate = (stableLocation: any) => {
        console.log('RedZones: Stable location updated:', stableLocation);
        setUserLocation({ 
          lat: stableLocation.lat, 
          lng: stableLocation.lng 
        });
      };

      // Since ZoneContext already handles the watchPosition and feeds to locationStability,
      // we just need to listen for stable location changes
      // We'll create a simple polling mechanism to check for updates
      const pollInterval = setInterval(() => {
        const stable = locationStability.getCurrentStableLocation();
        if (stable && (!userLocation || 
            userLocation.lat !== stable.lat || 
            userLocation.lng !== stable.lng)) {
          setUserLocation({ 
            lat: stable.lat, 
            lng: stable.lng 
          });
        }
      }, 1000); // Check every second

      return () => {
        clearInterval(pollInterval);
      };
    }
    
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userLocation]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchRedZones() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('red_zones')
          .select('*');

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        if (!data || data.length === 0) {
          setRedZones([]);
          setLoading(false);
          return;
        }

        // Transform and validate data
        const zones = data
          .filter(zone => zone && zone.name && zone.latitude && zone.longitude)
          .map(zone => ({
            ...zone,
            coordinates: [parseFloat(zone.latitude), parseFloat(zone.longitude)] as [number, number],
            risk_level: zone.risk_level || 'low',
            incidentCount: parseInt(zone.incident_count) || 0,
            crimeRate: parseFloat(zone.crime_rate) || 0,
            lastIncident: zone.last_incident || 'Unknown',
          }))
          .filter(zone => zone !== null);

        setRedZones(zones);
        setLoading(false);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch red zones');
        setLoading(false);
      }
    }
    
    fetchRedZones(); // Initial fetch

    intervalId = setInterval(fetchRedZones, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      // Fetch all incidents and red zones
      const { data: incidents, error: incError } = await supabase.from('incidents').select('*');
      const { data: redZones, error: rzError } = await supabase.from('red_zones').select('*');
      if (!incidents || !redZones) return;

      for (const incident of incidents) {
        let foundZone = null;
        for (const zone of redZones) {
          const dist = haversineDistance(
            parseFloat(incident.latitude),
            parseFloat(incident.longitude),
            parseFloat(zone.latitude),
            parseFloat(zone.longitude)
          );
          console.log(`Incident ${incident.id} (${incident.latitude}, ${incident.longitude}) vs Zone ${zone.id} (${zone.latitude}, ${zone.longitude}) - Distance: ${dist}m, Assignment Radius: ${ASSIGNMENT_RADIUS}`);
          if (dist <= ASSIGNMENT_RADIUS) {
            foundZone = zone;
            break;
          }
        }
        if (foundZone) {
          // If not already assigned, update red zone and incident
          if (incident.red_zone_id !== foundZone.id) {
            console.log(`Assigning incident ${incident.id} to zone ${foundZone.id}`);
            const { error: updateError } = await supabase.from('red_zones').update({
              incident_count: (foundZone.incident_count || 0) + 1,
              last_incident: new Date().toISOString()
            }).eq('id', foundZone.id);
            if (updateError) console.error('Update error:', updateError);
            const { error: incUpdateError } = await supabase.from('incidents').update({
              red_zone_id: foundZone.id
            }).eq('id', incident.id);
            if (incUpdateError) console.error('Incident update error:', incUpdateError);
          } else {
            console.log(`Incident ${incident.id} already assigned to zone ${foundZone.id}`);
          }
        } else {
          // Create new red zone for this incident
          console.log(`Creating new red zone for incident ${incident.id} at (${incident.latitude}, ${incident.longitude})`);
          const { data: newZone, error: newZoneError } = await supabase.from('red_zones').insert([{
            latitude: incident.latitude,
            longitude: incident.longitude,
            incident_count: 1,
            last_incident: new Date().toISOString(),
            radius: 500, // default radius in meters
            name: incident.title || `Zone at (${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)})`
          }]).select().single();
          if (newZone && newZone.id) {
            const { error: incUpdateError } = await supabase.from('incidents').update({
              red_zone_id: newZone.id
            }).eq('id', incident.id);
            if (incUpdateError) console.error('Incident update error:', incUpdateError);
          }
          if (newZoneError) console.error('New zone insert error:', newZoneError);
        }
      }
    }, 30000); // every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (userLocation && redZones.length) {
      // Find the first zone the user is inside
      const foundZone = redZones.find(zone => {
        if (!zone.coordinates || zone.coordinates.length !== 2) return false;
        
        const dist = haversineDistance(
          userLocation.lat, 
          userLocation.lng, 
          zone.coordinates[0], 
          zone.coordinates[1]
        );
        return dist < 500; // Use 500 for user's location
      });

      setInZone(foundZone || null);

      if (foundZone && !hasNotified) {
        if (window.Notification && Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Red Zone Alert', {
                body: `You are currently inside the ${foundZone.name}!`,
                icon: '/favicon.ico'
              });
              setHasNotified(true);
            }
          });
        }
      }

      if (!foundZone && hasNotified) {
        setHasNotified(false);
      }
    }
  }, [userLocation, redZones, hasNotified]);

  function getIncidentColor(incidentCount: number) {
    if (incidentCount >= 40) return '#dc2626'; // red
    if (incidentCount >= 20) return '#f59e0b'; // orange/yellow
    return '#16a34a'; // green
  }

  const getPulseClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'radar-pulse-high';
      case 'medium': return 'radar-pulse-medium';
      case 'low': return 'radar-pulse-low';
      default: return '';
    }
  };

  const INCIDENT_THRESHOLD = 10;
  const ASSIGNMENT_RADIUS = 100000; // 1km for assignment logic

  // Filter zones that should be displayed
  const displayableZones = redZones.filter(zone => 
    zone && 
    zone.coordinates && 
    zone.coordinates.length === 2 &&
    zone.risk_level &&
    !isNaN(zone.coordinates[0]) &&
    !isNaN(zone.coordinates[1])
  );

  const highActivityZones = displayableZones.filter(zone => 
    zone.incidentCount > INCIDENT_THRESHOLD
  );

  // Sort displayableZones by incidentCount descending (red/high at top, green/low at bottom)
  const sortedZones = [...displayableZones].sort((a, b) => b.incidentCount - a.incidentCount);

  if (loading) {
    return (
      <div className="redzones-page">
        <Header title="Red Zones" showBack={showBack} />
        <div className="redzones-loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="redzones-page">
        <Header title="Red Zones" showBack={showBack} />
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '1rem',
          margin: '1rem',
          textAlign: 'center'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="redzones-page">
      <Header title="Red Zones" showBack={showBack} />
      
      {inZone && (
        <div style={{
          background: '#dc2626',
          color: '#fff',
          padding: '1rem',
          borderRadius: '1rem',
          margin: '1rem',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          You are currently inside the {inZone.name}!
        </div>
      )}

      {/* Map Container */}
      <div className="redzones-map-section">
        <div className="redzones-map-container">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [18.5204, 73.8567]}
            zoom={12}
            className="redzones-leaflet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {highActivityZones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={zone.coordinates}
                  radius={500}
                  pathOptions={{
                    color: getIncidentColor(zone.incidentCount),
                    fillColor: getIncidentColor(zone.incidentCount),
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
                <Marker
                  position={zone.coordinates}
                  icon={L.divIcon({
                    className: '',
                    html: `
                      <div class="radar-pulse-marker">
                        <div class="radar-pulse" style="background:${getIncidentColor(zone.incidentCount)};opacity:0.7;"></div>
                        <div class="radar-pulse-dot" style="background:${getIncidentColor(zone.incidentCount)};"></div>
                      </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                >
                  <Popup>
                    <div className="redzones-popup">
                      <h3 className="redzones-card-title">{zone.name}</h3>
                      <p className="redzones-card-detail-label">Crime Rate: {zone.crimeRate}</p>
                      <p className="redzones-card-detail-label">Incidents: {zone.incidentCount}</p>
                      <p className="redzones-card-detail-label">Last: {zone.lastIncident}</p>
                      <p className="redzones-card-detail-label">Radius: 500m</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
            
            {/* User live location marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 8px #2563eb;"></div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })}
              >
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      <button className="analyzer"
        onClick={() => navigate('/route-analyzer')}
      >
        Route Analyzer
      </button>

      {/* Legend */}
      <div className="redzones-legend-section">
        <div className="redzones-legend-card">
          <h3 className="redzones-legend-title">Risk Levels</h3>
          <div className="redzones-legend-list">
            <div className="redzones-legend-item">
              <div className="redzones-legend-dot redzones-legend-dot-high"></div>
              <span className="redzones-legend-label">High Risk</span>
            </div>
            <div className="redzones-legend-item">
              <div className="redzones-legend-dot redzones-legend-dot-medium"></div>
              <span className="redzones-legend-label">Medium Risk</span>
            </div>
            <div className="redzones-legend-item">
              <div className="redzones-legend-dot redzones-legend-dot-low"></div>
              <span className="redzones-legend-label">Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Zone Details List */}
      <div className="redzones-list-section">
        <h3 className="redzones-list-title">Red Zone Details</h3>
        {displayableZones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6b7280'
          }}>
            No red zones available at this time.
          </div>
        ) : (
          <div className="redzones-list">
            {sortedZones.map((zone) => (
              <div key={zone.id} className="redzones-card redzones-card-relative">
                <div className="redzones-card-header redzones-card-header-flex">
                  <h4 className="redzones-card-title">{zone.name}</h4>
                </div>
                <span
                  className="redzones-card-badge redzones-badge-pill redzones-badge-absolute"
                  style={{ background: getIncidentColor(zone.incidentCount) }}
                >
                  {zone.incidentCount >= 40 ? 'HIGH' : zone.incidentCount >= 20 ? 'MEDIUM' : 'LOW'}
                </span>
                <div className="redzones-card-details">
                  <div className="redzones-card-detail">
                    <AlertTriangle size={16} className="redzones-card-detail-icon" />
                    <div>
                      <div className="redzones-card-detail-label">Crime Rate</div>
                      <div className="redzones-card-detail-value">{zone.crimeRate}</div>
                    </div>
                  </div>
                  <div className="redzones-card-detail">
                    <Users size={16} className="redzones-card-detail-icon" />
                    <div>
                      <div className="redzones-card-detail-label">Incidents</div>
                      <div className="redzones-card-detail-value" style={{ color: getIncidentColor(zone.incidentCount) }}>{zone.incidentCount}</div>
                    </div>
                  </div>
                  <div className="redzones-card-detail">
                    <Calendar size={16} className="redzones-card-detail-icon" />
                    <div>
                      <div className="redzones-card-detail-label">Last</div>
                      <div className="redzones-card-detail-value">{zone.lastIncident && zone.lastIncident.slice(0, 10)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default RedZones;

