import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { reportAPI } from '../api/API';
import RejectedReportsList from '../components/RejectedReportList';
import EditRejectedReport from '../components/EditRejectedReport';
import './RejectedReportPage.css';

const RejectedReportsPage = () => {
  const [rejectedReports, setRejectedReports] = useState([]);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchRejectedReports();
  }, []);

  const fetchRejectedReports = async () => {
    try {
      setError('');
      const response = await reportAPI.fetchRejected();
      response.data.reports.total_amount = String(response.data.reports.total_amount);
      setRejectedReports(response.data.reports);
    } catch (err) {
      console.error('Error fetching rejected reports:', err);
      setError('No rejected Reports found');
    }
  };

  const handleEditClick = (report) => {
    setSelectedReport(report);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setSelectedReport(null);
    setIsEditing(false);
  };

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    setSelectedReport(null);
    fetchRejectedReports(); // Refresh the list
  };

  return (
    <div className="rejected-reports-page">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h1>Rejected Reports</h1>

      {error && <div className="error-message">{error}</div>}

      {isEditing && selectedReport ? (
        <EditRejectedReport
          report={selectedReport}
          onCancel={handleEditCancel}
          onUpdateSuccess={handleUpdateSuccess}
        />
      ) : (
        <RejectedReportsList
          reports={rejectedReports}
          onEditClick={handleEditClick}
        />
      )}
    </div>
  );
};

export default RejectedReportsPage;