import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, AlertTriangle, Users } from 'lucide-react';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/news', icon: FileText, label: 'News' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
    { path: '/community', icon: Users, label: 'Community' }
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-link ${isActive ? 'bottom-nav-link-active' : 'bottom-nav-link-inactive'}`}
            >
              <Icon 
                size={22} 
                className="bottom-nav-icon" 
              />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;