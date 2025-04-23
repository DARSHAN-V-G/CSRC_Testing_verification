import React, { useState, useEffect } from 'react';
import { reportAPI } from '../api/API';
import './AddPaymentDetails.css';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();
  // Fetch unpaid reports
  useEffect(() => {
    const fetchUnpaidReports = async () => {
      try {
        const response = await reportAPI.getUnpaidReports();
        const formattedReports = response.data.reports.map((report) => ({
          ...report,
          total_amount: formatTotalAmount(report.total_amount),
        }));
        setReports(formattedReports);
      } catch (err) {
        console.error('Error fetching unpaid reports:', err);
        setError('Failed to load unpaid reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidReports();
  }, []);

  // Format total_amount to ensure it's a string or number
  const formatTotalAmount = (amount) => {
    if (typeof amount === 'object' && amount.$numberDecimal) {
      return parseFloat(amount.$numberDecimal).toFixed(2);
    }
    if (typeof amount === 'string' || typeof amount === 'number') {
      return parseFloat(amount).toFixed(2);
    }
    return '0.00';
  };

  // Handle report selection
  const handleReportSelect = (report) => {
    setSelectedReport({
      ...report,
      total_amount: formatTotalAmount(report.total_amount),
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
      alert('Payment details updated successfully!');
      setSelectedReport(null); // Reset the selected report
    } catch (err) {
      console.error('Error updating payment details:', err);
      alert('Failed to update payment details. Please try again.');
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
      
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      
      <div className="header">
        <h2>Add Payment Details</h2>
      </div>

      {!selectedReport ? (
        <div className="report-list">
          <h3>Unpaid Reports</h3>
          {reports.length === 0 ? (
            <p>No unpaid reports found.</p>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="report-card"
                  onClick={() => handleReportSelect(report)}
                >
                  <div className="report-card-header">
                    <span className="ref-no">{report.ref_no}</span>
                    <span className="total-amount">₹{report.total_amount}</span>
                  </div>
                  <div className="report-card-body">
                    <h3>{report.client_name}</h3>
                    <p className="department">{report.department}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="report-details-container">
          <div className="report-section">
            <h3>Client Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Client Name:</span>
                <span className="value">{selectedReport.client_name}</span>
              </div>
              <div className="info-item">
                <span className="label">PO Number:</span>
                <span className="value">{selectedReport.client_po_no}</span>
              </div>
              <div className="info-item">
                <span className="label">Billing Email:</span>
                <span className="value">{selectedReport.bill_to_be_sent_mail_address}</span>
              </div>
              <div className="info-item">
                <span className="label">PO Received Date:</span>
                <span className="value">{new Date(selectedReport.client_po_recieved_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="label">GST Number:</span>
                <span className="value">{selectedReport.gst_no}</span>
              </div>
              <div className="info-item">
                <span className="label">Department:</span>
                <span className="value">{selectedReport.department}</span>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>Faculty Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Faculty Incharge:</span>
                <span className="value">{selectedReport.faculty_incharge}</span>
              </div>
              <div className="info-item">
                <span className="label">Prepared By:</span>
                <span className="value">{selectedReport.prepared_by}</span>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>Test Information</h3>
            <table className="test-table">
              <thead>
                <tr>
                  <th>Test Title</th>
                  <th>Unit</th>
                  <th>Price Per Unit</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedReport.test.map((test, index) => (
                  <tr key={index}>
                    <td>{test.title}</td>
                    <td>{test.unit}</td>
                    <td>₹{test.pricePerUnit.toFixed(2)}</td>
                    <td>{test.quantity}</td>
                    <td>₹{(test.pricePerUnit * test.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total-label">Total Amount</td>
                  <td className="total-value">₹{selectedReport.total_amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="report-section">
            <h3>Payment Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="paid"
                    name="paid"
                    checked={formData.paid}
                    onChange={handleChange}
                  />
                  <label htmlFor="paid">Payment Received</label>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPaymentDetails;