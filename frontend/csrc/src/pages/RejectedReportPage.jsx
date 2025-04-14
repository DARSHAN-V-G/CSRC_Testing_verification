import React, { useState, useEffect } from 'react';
import { reportAPI } from '../api/API';
import RejectedReportsList from '../components/RejectedReportList';
import EditRejectedReport from '../components/EditRejectedReport';
import './RejectedReportPage.css';

const RejectedReportsPage = () => {
  const [rejectedReports, setRejectedReports] = useState([]);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRejectedReports();
  }, []);

  const fetchRejectedReports = async () => {
    try {
      setError('');
      const response = await reportAPI.fetchRejected();
      setRejectedReports(response.data.reports);
    } catch (err) {
      console.error('Error fetching rejected reports:', err);
      setError('Failed to load rejected reports. Please try again later.');
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