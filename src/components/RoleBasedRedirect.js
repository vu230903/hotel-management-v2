import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'reception':
      return <Navigate to="/reception" replace />;
    case 'cleaning':
      return <Navigate to="/" replace />;
    case 'customer':
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleBasedRedirect;
