import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../api/API';
import './CheckPaymentPage.css';

const CheckPaymentPage = () => {
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

  const handleVerifyPayment = async (ref_no) => {
    try {
      await reportAPI.verifyPayment(ref_no);
      alert('Payment verified successfully!');
      fetchReports();
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment. Please try again.');
    }
  };

  const handleRejectPayment = async (ref_no) => {
    try {
      await reportAPI.rejectPayment(ref_no);
      alert('Payment rejected successfully!');
      fetchReports();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment. Please try again.');
    }
  };

  return (
    <div className="check-payment-page">
      <h2>Payment Verification</h2>

      <div className="payment-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payments
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
              {!report.paymentVerified && (
                <div className="report-card-actions">
                  <button
                    className="verify-button"
                    onClick={() => handleVerifyPayment(report.ref_no)}
                  >
                    Verify Payment
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleRejectPayment(report.ref_no)}
                  >
                    Reject Payment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckPaymentPage;