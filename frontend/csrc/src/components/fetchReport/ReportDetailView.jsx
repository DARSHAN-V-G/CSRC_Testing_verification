import React from 'react';
import './ReportDetailView.css';

const ReportDetailView = ({ report }) => {
  // Calculate total for tests
  const calculateTotal = (tests) => {
    return tests.reduce((sum, test) => {
      return sum + (test.pricePerUnit * test.quantity);
    }, 0);
  };

  // Format decimal values
  const formatCurrency = (value) => {
    if (typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal).toFixed(2);
    }
    return value.toFixed(2);
  };

  return (
    <div className="report-detail-container">
      <div className="report-section">
        <h3>Client Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Client Name:</span>
            <span className="value">{report.client_name}</span>
          </div>
          <div className="info-item">
            <span className="label">PO Number:</span>
            <span className="value">{report.client_po_no}</span>
          </div>
          <div className="info-item">
            <span className="label">Department:</span>
            <span className="value">{report.department}</span>
          </div>
          <div className="info-item">
            <span className="label">Address :</span>
            <span className="value">{report.bill_to_be_sent_mail_address}</span>
          </div>
          <div className="info-item">
            <span className="label">PO Received Date:</span>
            <span className="value">{new Date(report.client_po_recieved_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="label">GST Number:</span>
            <span className="value">{report.gst_no}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Faculty Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Faculty Incharge:</span>
            <span className="value">{report.faculty_incharge}</span>
          </div>
          <div className="info-item">
            <span className="label">Prepared By:</span>
            <span className="value">{report.prepared_by}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Payment Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Payment Status:</span>
            <span className="value">{report.paid ? 'Paid' : 'Pending'}</span>
          </div>
          {report.paid && (
            <>
              <div className="info-item">
                <span className="label">Payment Mode:</span>
                <span className="value">{report.payment_mode}</span>
              </div>
              {report.transaction_details && (
                <div className="info-item">
                  <span className="label">Transaction Details:</span>
                  <span className="value">{report.transaction_details}</span>
                </div>
              )}
              {report.transaction_date && (
                <div className="info-item">
                  <span className="label">Transaction Date:</span>
                  <span className="value">{new Date(report.transaction_date).toLocaleDateString()}</span>
                </div>
              )}
              {report.receipt_no && (
                <div className="info-item">
                  <span className="label">Receipt Number:</span>
                  <span className="value">{report.receipt_no}</span>
                </div>
              )}
              {report.bill_no && (
                <div className="info-item">
                  <span className="label">Bill Number:</span>
                  <span className="value">{report.bill_no}</span>
                </div>
              )}
            </>
          )}
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
            {report.test.map((test, index) => (
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
              <td className="total-value">₹{formatCurrency(report.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="report-section">
        <h3>Status Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Reference Number:</span>
            <span className="value">{report.ref_no}</span>
          </div>
          <div className="info-item">
            <span className="label">Verification Status:</span>
            <span className={`value status ${report.verified_flag > 0 ? 'verified' : 'pending'}`}>
              {report.verified_flag > 0 ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Verification Level:</span>
            <span className="value">{report.verified_flag}</span>
          </div>
          {report.rejected_by && (
            <div className="info-item">
              <span className="label">Rejected By:</span>
              <span className="value rejected">{report.rejected_by}</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">Created At:</span>
            <span className="value">{new Date(report.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Last Updated:</span>
            <span className="value">{new Date(report.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailView;