import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { reportAPI } from '../../api/API';
import ReportCard from './ReportCard';
import './ReportList.css';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const isVerified = activeTab === 'verified';
      const response = await reportAPI.fetch(isVerified);
      setReports(response.data.reports);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-list-container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>CSRC Testing Reports</h2>

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button
          className={`tab-button ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified Requests
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReports}>Try Again</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <p>No {activeTab} test requests found.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} isFromVerifiedTab={activeTab === 'verified'}  />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
