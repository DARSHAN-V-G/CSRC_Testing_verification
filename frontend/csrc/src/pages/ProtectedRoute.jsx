import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// This component checks if the user is authenticated and has the required role
const ProtectedRoute = ({ requiredRoles = [], children }) => {
  const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth();

  if (isLoading) {
    // Show loading indicator while checking authentication
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && user && user.role) {
    if (!requiredRoles.includes(user.role.toLowerCase())) {
      // User doesn't have the right role, redirect to their default page
      return <Navigate to={getRedirectPath()} replace />;
    }
  }

  // If all checks pass, render the protected content
  return children ? children : <Outlet />;
};

export default ProtectedRoute;