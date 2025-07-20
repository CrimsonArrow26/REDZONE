import React from 'react';
import { MapPin, Phone, FileText, Shield, Bell, User } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="homepage">
      <div className="home-header">
        <div className="text-center">
          <h1 className="home-title">RED ZONE</h1>
          <p className="home-subtitle">Every street. Every step. Safer</p>
        </div>
      </div>

      
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

      
      <div className="tips-section">
        <h2 className="tips-title">Safety Tips</h2>
        <div className="tips-list-container">
          <ul className="tips-list">
            <li className="tip-item"><span className="tip-dot">•</span>Always stay aware of your surroundings</li>
            <li className="tip-item"><span className="tip-dot">•</span>Trust your instincts about dangerous situations</li>
            <li className="tip-item"><span className="tip-dot">•</span>Keep emergency contacts updated</li>
            <li className="tip-item"><span className="tip-dot">•</span>Report suspicious activities immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;