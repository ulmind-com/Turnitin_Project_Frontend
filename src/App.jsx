import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadDocument from './pages/UploadDocument';
import ScanReport from './pages/ScanReport';
import Plans from './pages/Plans';
import PaymentProof from './pages/PaymentProof';
import ScanHistory from './pages/ScanHistory';
import FeedbackStudio from './pages/FeedbackStudio';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — Standalone Full-screen */}
          <Route
            path="/feedback-studio/:id"
            element={
              <ProtectedRoute>
                <FeedbackStudio />
              </ProtectedRoute>
            }
          />

          {/* Protected — Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadDocument />} />
            <Route path="/report/:id" element={<ScanReport />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/payment/:planId" element={<PaymentProof />} />
            <Route path="/history" element={<ScanHistory />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
