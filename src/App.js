import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import luxuryTheme from './theme/luxuryTheme';
import './styles/global.css';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Rooms from './pages/customer/Rooms';
import RoomDetail from './pages/customer/RoomDetail';
import BookRoom from './pages/customer/BookRoom';
import BookingHistory from './pages/customer/BookingHistory';
import Reviews from './pages/customer/Reviews';
import UserProfile from './pages/customer/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import Settings from './pages/admin/Settings';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';

// Layouts
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider theme={luxuryTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public Room Detail Route - No login required */}
            <Route path="/room/:id" element={<RoomDetail />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/rooms" element={<RoomManagement />} />
                      <Route path="/bookings" element={<BookingManagement />} />
                      <Route path="/services" element={<ServicesManagement />} />
                      <Route path="/reports" element={<ReportsAnalytics />} />
                      <Route path="/settings" element={<Settings />} />
                      {/* Add more admin routes here */}
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Reception Routes */}
            <Route
              path="/reception"
              element={
                <ProtectedRoute allowedRoles={['reception']}>
                  <ReceptionDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Dashboard Route - redirects based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'reception', 'cleaning', 'customer']}>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Customer Routes - Require Login */}
            <Route
              path="/book-room"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Reviews />
                </ProtectedRoute>
              }
            />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute allowedRoles={['customer']}>
                              <UserProfile />
                            </ProtectedRoute>
                          }
                        />
            
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
