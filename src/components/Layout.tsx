import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import FloatingButton from './FloatingButton';
import './Layout.css';

const Layout: React.FC = () => {
  const location = useLocation();
  const showFloatingButton = location.pathname === '/home';

  return (
    <div className="layout">
      <main className="layout-main">
        <Outlet /> 
      </main>
      {showFloatingButton && <FloatingButton />}
      <div className="layout-bottom-nav">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Layout;
