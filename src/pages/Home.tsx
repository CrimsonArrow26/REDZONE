import React, { useState, useEffect } from 'react';
import { MapPin, Phone, FileText, Shield, Bell, User, Menu, X } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useZone } from '../context/ZoneContext';
import { navItems } from '../components/BottomNavigation';
import { NavLink } from 'react-router-dom';
import './Home.css';
import { locationStability } from '../utils/locationStability';

const Home: React.FC = () => {
  const { isSafe, currentZone, userLocation } = useZone();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showLocationDebug, setShowLocationDebug] = useState(false);

  // Development mode check
  const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  // Update debug info periodically
  useEffect(() => {
    if (showLocationDebug && isDev) {
      const interval = setInterval(() => {
        setDebugInfo(locationStability.getDebugInfo());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLocationDebug, isDev]);

  return (
    <div className="homepage">
      {/* Geo-Fencing Alert */}
      {!isSafe && (
        <div className="geo-alert-banner">
          ⚠ You are in a Red Zone: <strong>{(currentZone as any)?.name || 'Unnamed Area'}</strong>
        </div>
      )}

      {/* Location Stability Debug Panel (Development Only) */}
      {isDev && (
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px', 
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <button 
              onClick={() => setShowLocationDebug(!showLocationDebug)}
              style={{
                background: showLocationDebug ? '#dc2626' : '#16a34a',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                marginRight: '10px'
              }}
            >
              📍 {showLocationDebug ? 'Hide' : 'Show'} Location Debug
            </button>
            <button 
              onClick={() => locationStability.reset()}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              🔄 Reset Location System
            </button>
          </div>
          
          {showLocationDebug && (
            <div>
              <div><strong>Current User Location:</strong> {userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'None'}</div>
              <div><strong>Stable Location:</strong> {debugInfo?.currentStableLocation ? 
                `${debugInfo.currentStableLocation.lat.toFixed(6)}, ${debugInfo.currentStableLocation.lng.toFixed(6)} (Confidence: ${debugInfo.currentStableLocation.confidence.toFixed(1)})` : 
                'None'}</div>
              <div><strong>GPS Readings:</strong> {debugInfo?.readingCount || 0}</div>
              <div><strong>Reading Range:</strong> {debugInfo?.oldestReading} - {debugInfo?.newestReading}</div>
              {debugInfo?.readings && debugInfo.readings.length > 0 && (
                <details>
                  <summary>Raw Readings ({debugInfo.readings.length})</summary>
                  {debugInfo.readings.map((reading: any, i: number) => (
                    <div key={i} style={{ marginLeft: '10px', fontSize: '10px' }}>
                      {i}: {reading.lat.toFixed(6)}, {reading.lng.toFixed(6)} ({reading.accuracy}m) at {new Date(reading.timestamp).toLocaleTimeString()}
                    </div>
                  ))}
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Home Title and Subtitle with Hamburger */}
      <header className="home-header">
        <div className="header-container">
          <div className="spacer" />
          <div className="home-header-center">
            <h1 className="home-title">RED ZONE</h1>
            <p className="home-subtitle">Every street. Every step. Safer.</p>
          </div>
          <button
            className="home-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ display: 'block', background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', position: 'absolute', right: 24, top: 24 }}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Custom Sidebar for Home */}
      {sidebarOpen && (
        <>
          <div className="home-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
          <aside className="home-sidebar">
            <button className="home-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X size={28} />
            </button>
            <nav className="home-sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `home-sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={22} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Feature Cards */}
      <section className="feature-grid">
        <FeatureCard title="Live Map" icon={MapPin} to="/redzones" state={{ fromHome: true }} className="feature-card pink" />
        <FeatureCard title="Emergency" icon={Phone} to="/emergency" state={{ fromHome: true }} className="feature-card blue" />
        <FeatureCard title="My Reports" icon={FileText} to="/reports" state={{ fromHome: true }} className="feature-card yellow" />
        <FeatureCard title="S.O.S" icon={Shield} to="/sos" state={{ fromHome: true }} className="feature-card red" />
        <FeatureCard title="Notification" icon={Bell} to="/notification" state={{ fromHome: true }} className="feature-card red" />
        <FeatureCard title="Profile" icon={User} to="/profile" state={{ fromHome: true }} className="feature-card blue" />
      </section>

      {/* Safety Tips */}
      <section className="tips-section">
        <h2 className="tips-title">Safety Tips</h2>
        <div className="tips-list-container">
          <ul className="tips-list">
            <li className="tip-item"><span className="tip-dot">•</span> Stay aware of your surroundings at all times</li>
            <li className="tip-item"><span className="tip-dot">•</span> Avoid poorly lit or isolated areas</li>
            <li className="tip-item"><span className="tip-dot">•</span> Keep your emergency contacts up-to-date</li>
            <li className="tip-item"><span className="tip-dot">•</span> Use the app to report suspicious activity</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;
