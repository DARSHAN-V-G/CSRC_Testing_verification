import React, { useState, useEffect } from 'react';
import { reportAPI } from '../api/API';
import { useNavigate } from 'react-router-dom';
import ReportsList from '../components/ReceiptComponents/ReportsList';
import AddReceiptForm from '../components/ReceiptComponents/AddReceiptForm';
import './AddReceiptNumberPage.css';

const AddReceiptNumberPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
 const navigate = useNavigate();
  useEffect(() => {
    fetchVerifiedReports();
  }, []);

  const fetchVerifiedReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportAPI.fetchWithoutReceipt();

      // Filter reports that don't have a receipt number
      const filteredReports = response.data.reports.filter(report =>
        !report.receipt_no || report.receipt_no === ''
      );

      setReports(filteredReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setFormVisible(true);
  };

  const handleFormClose = () => {
    setSelectedReport(null);
    setFormVisible(false);
  };

  const handleAddReceiptSuccess = () => {
    // Refresh the reports list
    fetchVerifiedReports();
    setFormVisible(false);
    setSelectedReport(null);
  };

  return (
    <div className="add-receipt-page">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h1>Add Receipt Number</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <>
          {formVisible && selectedReport ? (
            <AddReceiptForm
              report={selectedReport}
              onClose={handleFormClose}
              onSuccess={handleAddReceiptSuccess}
            />
          ) : (
            <ReportsList
              reports={reports}
              onReportSelect={handleReportSelect}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AddReceiptNumberPage;
