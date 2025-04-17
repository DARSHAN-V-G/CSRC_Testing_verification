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
      <div className="dashboard-header">
        <h2>Welcome to CSRC Testing Application!</h2>
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
      </div>
      <div className="dashboard-card">
        <h3>Buttons</h3>
        <div className="dashboard-buttons">
          {user?.role === 'staff' && (
            <button onClick={() => navigate('/createReport')} className="dashboard-button">
              Create Report
            </button>
          )}
          {(user?.role === 'dean' || user?.role === 'office' || user?.role === 'hod' || user?.role === 'faculty') && (
            <button onClick={() => navigate('/reports')} className="dashboard-button">
              Check Reports
            </button>
          )}
          {user?.role === 'office' && (
            <button onClick={() => navigate('/checkPayment')} className="dashboard-button">
              Check Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

