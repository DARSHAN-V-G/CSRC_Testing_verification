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
                <h3>New Test Request</h3>
                <p>Create new test request</p>
              </div>
              <div
                className="dashboard-option"
                onClick={() => navigate('/rejectedReports')}
              >
                <h3>Rejected Tests</h3>
                <p>View and manage rejected tests</p>
              </div>
              <div
                className="dashboard-option"
                onClick={() => navigate('/addPaymentDetails')}
              >
                <h3>Add Payment Details</h3>
                <p>Update payment details for tests</p>
              </div>
            </>
          )}
          {(user?.role === 'staff' || user?.role === 'dean'  || user?.role === 'hod' || user?.role === 'faculty') && (
            <div
              className="dashboard-option"
              onClick={() => navigate('/reports')}
            >
              <h3>View Test requests</h3>
              <p>View all submitted test requests</p>
            </div>
          )}
          {user?.role === 'office' && (
            <>
            <div
              className="dashboard-option"
              onClick={() => navigate('/checkPayment')}
            >
              <h3>Verify Payment</h3>
              <p>Verify payment details for test requests</p>
            </div>
             <div
             className="dashboard-option"
             onClick={() => navigate('/addReceiptNumber')}
           >
             <h3>Add Receipt Number </h3>
             <p>Adding receipt number for verified reports</p>
           </div>
           </>
          )}{user?.role === 'dean' && (
            <div
              className="dashboard-option"
              onClick={() => navigate('/tests')}
            >
              <h3>Add Tests</h3>
              <p>Add new test, Delete Existing test, Edit existing tests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

