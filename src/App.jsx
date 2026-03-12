import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { VehicleProvider } from './context/VehicleContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import OperatorNav from './components/OperatorNav';
import Footer from './components/Footer';
import PageSkeleton from './components/PageSkeleton';
import AIChatAssistant from './components/AIChatAssistant';
import { useAuth } from './hooks/useAuth';

// ── Lazy-loaded pages (greatly reduces initial bundle size) ─────────────────
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const SignupPage         = lazy(() => import('./pages/SignupPage'));
const RoleSelectPage     = lazy(() => import('./pages/RoleSelectPage'));
const DriverPricingPage  = lazy(() => import('./pages/DriverPricingPage'));
const OperatorPricingPage = lazy(() => import('./pages/OperatorPricingPage'));

const MapPage            = lazy(() => import('./pages/MapPage'));
const StationDetailsPage = lazy(() => import('./pages/StationDetailsPage'));
const QueuePage          = lazy(() => import('./pages/QueuePage'));
const TripsPage          = lazy(() => import('./pages/TripsPage'));
const CalculatorPage     = lazy(() => import('./pages/CalculatorPage'));
const CommunityPage      = lazy(() => import('./pages/CommunityPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const VehiclePage        = lazy(() => import('./pages/VehiclePage'));

const OperatorDashboardPage = lazy(() => import('./pages/operator/OperatorDashboardPage'));
const MyStationsPage     = lazy(() => import('./pages/operator/MyStationsPage'));
const AddStationPage     = lazy(() => import('./pages/operator/AddStationPage'));
const OperatorAnalyticsPage = lazy(() => import('./pages/operator/OperatorAnalyticsPage'));
const OperatorQueuePage  = lazy(() => import('./pages/operator/OperatorQueuePage'));
const FaultReportsPage   = lazy(() => import('./pages/operator/FaultReportsPage'));
const OperatorSettingsPage = lazy(() => import('./pages/operator/OperatorSettingsPage'));

// ── Constants ────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/login', '/signup', '/role-select', '/pricing-driver', '/pricing-operator'];

// ── Layout ───────────────────────────────────────────────────────────────────
const AppLayout = () => {
  const location = useLocation();
  const { user, userRole } = useAuth();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const showNav = user && !isPublic;

  return (
    <div className="app-container">
      <Navbar />
      {showNav && (userRole === 'driver' ? <SideNav /> : <OperatorNav />)}

      <main
        className="main-content-layout"
        style={!showNav ? { paddingLeft: 0, paddingBottom: 0 } : {}}
      >
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public */}
            <Route path="/"                  element={<LandingPage />} />
            <Route path="/login"             element={<LoginPage />} />
            <Route path="/signup"            element={<SignupPage />} />
            <Route path="/role-select"       element={<RoleSelectPage />} />
            <Route path="/pricing-driver"    element={<DriverPricingPage />} />
            <Route path="/pricing-operator"  element={<OperatorPricingPage />} />

            {/* Protected Driver */}
            <Route path="/map"        element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
            <Route path="/station/:id" element={<ProtectedRoute><StationDetailsPage /></ProtectedRoute>} />
            <Route path="/queue"      element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
            <Route path="/trips"      element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
            <Route path="/community"  element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/vehicle"    element={<ProtectedRoute><VehiclePage /></ProtectedRoute>} />

            {/* Protected Operator */}
            <Route path="/operator/dashboard"  element={<ProtectedRoute><OperatorDashboardPage /></ProtectedRoute>} />
            <Route path="/operator/stations"   element={<ProtectedRoute><MyStationsPage /></ProtectedRoute>} />
            <Route path="/operator/add-station" element={<ProtectedRoute><AddStationPage /></ProtectedRoute>} />
            <Route path="/operator/analytics"  element={<ProtectedRoute><OperatorAnalyticsPage /></ProtectedRoute>} />
            <Route path="/operator/queue"      element={<ProtectedRoute><OperatorQueuePage /></ProtectedRoute>} />
            <Route path="/operator/faults"     element={<ProtectedRoute><FaultReportsPage /></ProtectedRoute>} />
            <Route path="/operator/settings"   element={<ProtectedRoute><OperatorSettingsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={user
              ? (userRole === 'driver' ? <MapPage /> : <LandingPage />)
              : <LandingPage />
            } />
          </Routes>
        </Suspense>

        {/* Global Footer */}
        <Footer />
      </main>

      {/* Global Floating AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
};

// ── App Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VehicleProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </VehicleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
