import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportAPI } from '../../api/API';
import './CheckPaymentPage.css';

const CheckPaymentPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const isVerified = activeTab === 'verified';
      const response = await reportAPI.fetch(isVerified); // Fetch reports based on payment verification status

      // Format Decimal128 values in the reports
      const formattedReports = response.data.reports.map((report) => ({
        ...report,
        total_amount: formatDecimal(report.total_amount),
      }));

      setReports(formattedReports);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDecimal = (value) => {
    if (typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal).toFixed(2); // Convert Decimal128 to a number
    }
    return parseFloat(value).toFixed(2); // Handle regular numbers
  };

  return (
    <div className="check-payment-page">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>Payment Verification</h2>

      <div className="payment-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payment Verification
        </button>
        <button
          className={`tab-button ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified Payments
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReports}>Try Again</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <p>No {activeTab} payments found.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-card-header">
                <span className="ref-no">{report.ref_no}</span>
                <span className={`status-indicator ${report.paymentVerified ? 'verified' : 'pending'}`}>
                  {report.paymentVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="report-card-body">
                <h3>{report.client_name}</h3>
                <p className="department">{report.department}</p>
                <p className="total-amount">Total: ₹{report.total_amount}</p>
              </div>
              <div className="report-card-footer">
                <Link to={`/checkPayment/report/${report._id}`} className="view-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckPaymentPage;
