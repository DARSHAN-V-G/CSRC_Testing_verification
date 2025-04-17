import React, { useState, useEffect } from 'react';
import { reportAPI } from '../api/API';
import './AddPaymentDetails.css';

const AddPaymentDetails = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    paid: false,
    payment_mode: '',
    transaction_details: '',
    transaction_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch unpaid reports
  useEffect(() => {
    const fetchUnpaidReports = async () => {
      try {
        const response = await reportAPI.getUnpaidReports();
        setReports(response.data.reports);
      } catch (err) {
        console.error('Error fetching unpaid reports:', err);
        setError('Failed to load unpaid reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidReports();
  }, []);

  // Handle report selection
  const handleReportSelect = (report) => {
    setSelectedReport({
      ...report,
      total_amount: typeof report.total_amount === 'object' && report.total_amount.$numberDecimal
        ? parseFloat(report.total_amount.$numberDecimal).toFixed(2)
        : report.total_amount,
    });

    setFormData({
      paid: report.paid || false,
      payment_mode: report.payment_mode || '',
      transaction_details: report.transaction_details || '',
      transaction_date: report.transaction_date
        ? new Date(report.transaction_date).toISOString().split('T')[0]
        : '',
    });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        paid: formData.paid,
        payment_mode: formData.payment_mode,
        transaction_details: formData.transaction_details,
        transaction_date: formData.transaction_date,
      };

      await reportAPI.addPaymentDetails(selectedReport._id, payload);
      alert('Payment details updated successfully.');
      setSelectedReport(null); // Reset the selected report
    } catch (err) {
      console.error('Error updating payment details:', err);
      setError('Failed to update payment details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading unpaid reports...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="add-payment-details">
      <div className="header">
        <h2>Add Payment Details</h2>
      </div>

      {!selectedReport ? (
        <div className="report-list">
          <h3>Unpaid Reports</h3>
          {reports.length === 0 ? (
            <p>No unpaid reports found.</p>
          ) : (
            <ul>
              {reports.map((report) => (
                <li
                  key={report._id}
                  className="report-item"
                  onClick={() => handleReportSelect(report)}
                >
                  <strong>Ref No:</strong> {report.ref_no} | <strong>Client:</strong> {report.client_name} | <strong>Total:</strong> ₹
                  {typeof report.total_amount === 'object' && report.total_amount.$numberDecimal
                    ? parseFloat(report.total_amount.$numberDecimal).toFixed(2)
                    : report.total_amount}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Report Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Reference No:</label>
                <div className="read-only-field">{selectedReport.ref_no}</div>
              </div>
              <div className="form-group">
                <label>Client Name:</label>
                <div className="read-only-field">{selectedReport.client_name}</div>
              </div>
              <div className="form-group">
                <label>Total Amount:</label>
                <div className="read-only-field">₹{selectedReport.total_amount}</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paid">Payment Received</label>
                <input
                  type="checkbox"
                  id="paid"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleChange}
                />
              </div>
            </div>
            {formData.paid && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="transaction_details">Transaction Details</label>
                    <input
                      type="text"
                      id="transaction_details"
                      name="transaction_details"
                      value={formData.transaction_details}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="payment_mode">Payment Mode</label>
                    <select
                      id="payment_mode"
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleChange}
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="transaction_date">Transaction Date</label>
                    <input
                      type="date"
                      id="transaction_date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPaymentDetails;