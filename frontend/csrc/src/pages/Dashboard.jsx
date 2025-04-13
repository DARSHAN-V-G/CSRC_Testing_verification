import React, { useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation
import './Dashboard.css';  // Import the custom CSS for styling

const Dashboard = () => {
  const { user, logout, isAuthenticated, getRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To check the current location

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');  // Redirect to login if not authenticated
      return;
    }

    // Check if the user should be redirected based on their role
    const redirectPath = getRedirectPath();

    // Prevent redirection if already on /dashboard
    if (redirectPath !== '/dashboard' && location.pathname === '/dashboard') {
      navigate(redirectPath); // Redirect to the proper path
    }
  }, [isAuthenticated, navigate, user, getRedirectPath, location.pathname]);  // Added location.pathname to dependency list

  const handleForgotPassword = () => {
    // Navigate to the Forgot Password page
    navigate('/forgot-password');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome to the Dashboard</h2>
        <h3>{user?.email}</h3>
        <div className="dashboard-buttons">
          {user?.role === 'staff' && (
            <button onClick={() => navigate('/createReport')} className="dashboard-button">
              Create Report
            </button>
          )}
          {user?.role === 'faculty' && (
            <button onClick={() => navigate('/checkPayment')} className="dashboard-button">
              Check Payment
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="dashboard-button">
              Admin Panel
            </button>
          )}
        </div>
        <div className="footer-buttons">
          <button onClick={handleForgotPassword} className="forgot-password-button">
            Forgot Password?
          </button>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

