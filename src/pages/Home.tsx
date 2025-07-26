import React from 'react';
import { MapPin, Phone, FileText, Shield, Bell, User, Map } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useZone } from '../context/ZoneContext'; // Geo-fencing context
import './Home.css';

const Home: React.FC = () => {
  const { isSafe, currentZone } = useZone();

  return (
    <div className="homepage">
      {/* Geo-Fencing Alert */}
      {!isSafe && (
        <div className="geo-alert-banner">
          ⚠ You are in a Red Zone: <strong>{currentZone?.name || 'Unnamed Area'}</strong>
        </div>
      )}

      {/* Header */}
      <div className="home-header">
        <div className="text-center">
          <h1 className="home-title">RED ZONE</h1>
          <p className="home-subtitle">Every street. Every step. Safer.</p>
        </div>
      </div>

      {/* Features */}
      <div className="feature-grid">
        <FeatureCard
          title="Live Map"
          icon={MapPin}
          to="/redzones"
          state={{ fromHome: true }}
          className="feature-card pink"
        />
        <FeatureCard
          title="Emergency"
          icon={Phone}
          to="/emergency"
          state={{ fromHome: true }}
          className="feature-card blue"
        />
        <FeatureCard
          title="My Reports"
          icon={FileText}
          to="/reports"
          state={{ fromHome: true }}
          className="feature-card yellow"
        />
        <FeatureCard
          title="S.O.S"
          icon={Shield}
          to="/sos"
          state={{ fromHome: true }}
          className="feature-card red"
        />
        <FeatureCard
          title="Notification"
          icon={Bell}
          to="/notification"
          state={{ fromHome: true }}
          className="feature-card red"
        />
        <FeatureCard
          title="Profile"
          icon={User}
          to="/profile"
          state={{ fromHome: true }}
          className="feature-card blue"
        />

      </div>

      {/* Safety Tips */}
      <div className="tips-section">
        <h2 className="tips-title">Safety Tips</h2>
        <div className="tips-list-container">
          <ul className="tips-list">
            <li className="tip-item"><span className="tip-dot">•</span> Stay aware of your surroundings at all times</li>
            <li className="tip-item"><span className="tip-dot">•</span> Avoid poorly lit or isolated areas</li>
            <li className="tip-item"><span className="tip-dot">•</span> Keep your emergency contacts up-to-date</li>
            <li className="tip-item"><span className="tip-dot">•</span> Use the app to report suspicious activity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
