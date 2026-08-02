import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';

// Pages
import Dashboard from '../pages/Dashboard.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import HR from '../pages/HR.jsx';
import Attendance from '../pages/Attendance.jsx';
import Leave from '../pages/Leave.jsx';
import Mines from '../pages/Mines.jsx';
import Production from '../pages/Production.jsx';
import Fleet from '../pages/Fleet.jsx';
import Inventory from '../pages/Inventory.jsx';
import Procurement from '../pages/Procurement.jsx';
import Dispatch from '../pages/Dispatch.jsx';
import Finance from '../pages/Finance.jsx';
import Safety from '../pages/Safety.jsx';
import Circulars from '../pages/Circulars.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      
      {/* PUBLIC AUTH ROUTES */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />

      {/* PROTECTED MODULE ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HR />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Leave />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/mines"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Mines />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Production />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fleet"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Fleet />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/procurement"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Procurement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dispatch"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dispatch />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Finance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/safety"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Safety />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/circulars"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Circulars />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* SECURITY EXCEPTION PAGES */}
      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Unauthorized />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK REDIRECTS */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;
