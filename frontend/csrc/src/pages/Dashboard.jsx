import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAuthenticated, getRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const redirectPath = getRedirectPath();
    if (redirectPath !== '/dashboard' && location.pathname === '/dashboard') {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, user, getRedirectPath, location.pathname]);

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleChangeUsername = () => {
    navigate('/change-username');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="dashboard-container">
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </div>
      {menuOpen && (
        <div className="menu-dropdown">
          <button onClick={handleChangeUsername}>Change Username</button>
          <button onClick={handleForgotPassword}>Forgot Password</button>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      <div className="dashboard-content">
        <h2>Welcome, {user?.username || 'User'}!</h2>
        <div className="dashboard-options">
          {user?.role === 'staff' && (
            <>
              <div
                className="dashboard-option"
                onClick={() => navigate('/createReport')}
              >
                <h3>Create Report</h3>
                <p>Start creating a new report for testing purposes.</p>
              </div>
              <div
                className="dashboard-option"
                onClick={() => navigate('/rejectedReports')}
              >
                <h3>Rejected Reports</h3>
                <p>View and manage rejected reports.</p>
              </div>
              <div
                className="dashboard-option"
                onClick={() => navigate('/addPaymentDetails')}
              >
                <h3>Add Payment Details</h3>
                <p>Update payment details for reports.</p>
              </div>
            </>
          )}
          {(user?.role === 'staff' || user?.role === 'dean' || user?.role === 'office' || user?.role === 'hod' || user?.role === 'faculty') && (
            <div
              className="dashboard-option"
              onClick={() => navigate('/reports')}
            >
              <h3>Check Reports</h3>
              <p>View and manage all submitted reports.</p>
            </div>
          )}
          {user?.role === 'office' && (
            <div
              className="dashboard-option"
              onClick={() => navigate('/checkPayment')}
            >
              <h3>Check Payment</h3>
              <p>Verify and manage payment details for reports.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

