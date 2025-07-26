import React, { useState } from 'react';
import { MapPin, Phone, FileText, Shield, Bell, User, Menu, X } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useZone } from '../context/ZoneContext';
import { navItems } from '../components/BottomNavigation';
import { NavLink } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const { isSafe, currentZone } = useZone();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="homepage">
      {/* Geo-Fencing Alert */}
      {!isSafe && (
        <div className="geo-alert-banner">
          ⚠ You are in a Red Zone: <strong>{(currentZone as any)?.name || 'Unnamed Area'}</strong>
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
