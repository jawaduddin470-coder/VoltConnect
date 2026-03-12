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

// ── Helper: Retry Lazy Import ──────────────────────────────────────────────────
// Catches chunk load errors (often caused by Vercel deployments changing file hashes
// while an old PWA service worker is active) and forces a hard reload.
const retryLazy = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Chunk loading failed, forcing full reload to fetch new assets...", error);
      // Wait a moment so we don't spam reloads if it's completely offline
      setTimeout(() => window.location.reload(true), 1500);
      return { default: () => <PageSkeleton /> };
    }
  });
};

// ── Lazy-loaded pages (greatly reduces initial bundle size) ─────────────────
const LandingPage        = retryLazy(() => import('./pages/LandingPage'));
const LoginPage          = retryLazy(() => import('./pages/LoginPage'));
const SignupPage         = retryLazy(() => import('./pages/SignupPage'));
const RoleSelectPage     = retryLazy(() => import('./pages/RoleSelectPage'));
const DriverPricingPage  = retryLazy(() => import('./pages/DriverPricingPage'));
const OperatorPricingPage = retryLazy(() => import('./pages/OperatorPricingPage'));

const MapPage            = retryLazy(() => import('./pages/MapPage'));
const StationDetailsPage = retryLazy(() => import('./pages/StationDetailsPage'));
const QueuePage          = retryLazy(() => import('./pages/QueuePage'));
const TripsPage          = retryLazy(() => import('./pages/TripsPage'));
const CalculatorPage     = retryLazy(() => import('./pages/CalculatorPage'));
const CommunityPage      = retryLazy(() => import('./pages/CommunityPage'));
const ProfilePage        = retryLazy(() => import('./pages/ProfilePage'));
const VehiclePage        = retryLazy(() => import('./pages/VehiclePage'));

const OperatorDashboardPage = retryLazy(() => import('./pages/operator/OperatorDashboardPage'));
const MyStationsPage     = retryLazy(() => import('./pages/operator/MyStationsPage'));
const AddStationPage     = retryLazy(() => import('./pages/operator/AddStationPage'));
const OperatorAnalyticsPage = retryLazy(() => import('./pages/operator/OperatorAnalyticsPage'));
const OperatorQueuePage  = retryLazy(() => import('./pages/operator/OperatorQueuePage'));
const FaultReportsPage   = retryLazy(() => import('./pages/operator/FaultReportsPage'));
const OperatorSettingsPage = retryLazy(() => import('./pages/operator/OperatorSettingsPage'));

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
