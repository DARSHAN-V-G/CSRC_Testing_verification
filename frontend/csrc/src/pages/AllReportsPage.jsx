import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../api/API';
import ReportCard from '../components/fetchAllReports/ReportCard';
import './AllReportsPage.css';

const AllReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.fetchAll();
      setReports(response.data.reports);
      setError(null);
    } catch (err) {
      console.error('Error fetching all reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-reports-page">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>All Reports</h2>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAllReports}>Try Again</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <p>No reports found.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllReportsPage;