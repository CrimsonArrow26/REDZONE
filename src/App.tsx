import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage } from '../sign/components/AuthPage';
import Layout from './components/Layout';
import Home from './pages/Home';
import News from './pages/News';
import Events from './pages/Events';
import Alerts from './pages/Alerts';
import Community from './pages/Community';
import RedZones from './pages/RedZones';
import Emergency from './pages/Emergency';
import Reports from './pages/Reports';
import SOS from './pages/SOS';
import ReportIncident from './pages/ReportIncident';
import Notification from './pages/Notification';
import UserProfile from './pages/UserProfile';
import './App.css';
import { ZoneProvider } from './context/ZoneContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteAnalyzer from './pages/RouteAnalyzer';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <ZoneProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<Events />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/community" element={<Community />} />
            <Route path="/redzones" element={<RedZones />} />
            <Route path="/route-analyzer" element={<RouteAnalyzer />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Route>
        </Routes>
      </Router>
    </ZoneProvider>
  );
}

export default App;