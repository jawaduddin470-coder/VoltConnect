import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import OperatorNav from './components/OperatorNav';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoleSelectPage from './pages/RoleSelectPage';
import DriverPricingPage from './pages/DriverPricingPage';
import OperatorPricingPage from './pages/OperatorPricingPage';

import OperatorDashboardPage from './pages/operator/OperatorDashboardPage';
import MyStationsPage from './pages/operator/MyStationsPage';
import AddStationPage from './pages/operator/AddStationPage';
import OperatorAnalyticsPage from './pages/operator/OperatorAnalyticsPage';
import OperatorQueuePage from './pages/operator/OperatorQueuePage';
import FaultReportsPage from './pages/operator/FaultReportsPage';
import OperatorSettingsPage from './pages/operator/OperatorSettingsPage';

import MapPage from './pages/MapPage';
import StationDetailsPage from './pages/StationDetailsPage';
import QueuePage from './pages/QueuePage';
import TripsPage from './pages/TripsPage';
import CalculatorPage from './pages/CalculatorPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/role-select', '/pricing-driver', '/pricing-operator'];

const AppLayout = () => {
  const location = useLocation();
  const { user, userRole } = useAuth();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const showNav = user && !isPublic;

  return (
    <div className="app-container">
      <Navbar />
      {showNav && (userRole === 'driver' ? <SideNav /> : <OperatorNav />)}

      {/* 
        This wrapper correctly applies sidebar padding on desktop
        and bottom nav padding on mobile for protected pages,
        while remaining full width for public pages.
      */}
      <main
        className="main-content-layout"
        style={!showNav ? { paddingLeft: 0, paddingBottom: 0 } : {}}
      >
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/role-select" element={<RoleSelectPage />} />
          <Route path="/pricing-driver" element={<DriverPricingPage />} />
          <Route path="/pricing-operator" element={<OperatorPricingPage />} />

          {/* Protected */}
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/station/:id" element={<ProtectedRoute><StationDetailsPage /></ProtectedRoute>} />
          <Route path="/queue" element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Protected Operator Hub */}
          <Route path="/operator/dashboard" element={<ProtectedRoute><OperatorDashboardPage /></ProtectedRoute>} />
          <Route path="/operator/stations" element={<ProtectedRoute><MyStationsPage /></ProtectedRoute>} />
          <Route path="/operator/add-station" element={<ProtectedRoute><AddStationPage /></ProtectedRoute>} />
          <Route path="/operator/analytics" element={<ProtectedRoute><OperatorAnalyticsPage /></ProtectedRoute>} />
          <Route path="/operator/queue" element={<ProtectedRoute><OperatorQueuePage /></ProtectedRoute>} />
          <Route path="/operator/faults" element={<ProtectedRoute><FaultReportsPage /></ProtectedRoute>} />
          <Route path="/operator/settings" element={<ProtectedRoute><OperatorSettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={user ? (userRole === 'driver' ? <MapPage /> : <LandingPage />) : <LandingPage />} />
        </Routes>

        {/* Global Footer */}
        <Footer />
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
