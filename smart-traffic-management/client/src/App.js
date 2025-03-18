import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Lazy load components for better performance
const DashboardRealtime = React.lazy(() => import('./components/dashboard/DashboardRealtime'));
const TrafficMapNew = React.lazy(() => import('./components/maps/TrafficMapNew'));
const Login = React.lazy(() => import('./components/auth/Login'));
const ControlPanel = React.lazy(() => import('./components/dashboard/ControlPanel'));
const EmergencyRoutes = React.lazy(() => import('./components/dashboard/EmergencyRoutes'));
const SignalControl = React.lazy(() => import('./components/dashboard/SignalControl'));
const Analytics = React.lazy(() => import('./components/dashboard/Analytics'));

const App = () => {
  const location = useLocation();

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      {location.pathname === '/login' ? (
        // Login page without layout
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        // All other routes with layout
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRealtime />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/map"
              element={
                <PrivateRoute>
                  <TrafficMapNew />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/control"
              element={
                <PrivateRoute roles={['admin', 'traffic_authority']}>
                  <ControlPanel />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/emergency"
              element={
                <PrivateRoute roles={['admin', 'traffic_authority']}>
                  <EmergencyRoutes />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/signals"
              element={
                <PrivateRoute roles={['admin', 'traffic_authority']}>
                  <SignalControl />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/analytics"
              element={
                <PrivateRoute roles={['admin', 'traffic_authority']}>
                  <Analytics />
                </PrivateRoute>
              }
            />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </React.Suspense>
  );
};

export default App;