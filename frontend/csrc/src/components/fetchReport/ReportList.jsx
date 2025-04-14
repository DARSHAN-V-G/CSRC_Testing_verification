import React, { useState, useEffect } from 'react'
import { reportAPI } from '../../api/API';
import ReportCard from './reportCard';
import './ReportList.css';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'

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
      <h2>CSRC Testing Reports</h2>
      
      <div className="report-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Reports
        </button>
        <button 
          className={`tab-button ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified Reports
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReports}>Try Again</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <p>No {activeTab} reports found.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map(report => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
