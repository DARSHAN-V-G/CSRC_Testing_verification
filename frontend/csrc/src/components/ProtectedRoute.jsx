import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children }) => {
// need to do in authcontext.jsx
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <h3>Loading</h3>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;