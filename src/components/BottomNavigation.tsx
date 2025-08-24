import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, AlertTriangle, Users, Shield } from 'lucide-react';
import './BottomNavigation.css';

export const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/news', icon: FileText, label: 'News' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/admin', icon: Shield, label: 'Admin' }
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="bottom-nav md:hidden">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`bottom-nav-link ${isActive ? 'bottom-nav-link-active' : 'bottom-nav-link-inactive'}`}
            >
              <Icon
                size={22}
                className="bottom-nav-icon"
                color={isActive ? '#fff' : '#9ca3af'}
              />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;