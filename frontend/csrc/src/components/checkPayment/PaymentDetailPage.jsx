import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI } from '../../api/API';
import './PaymentDetailPage.css';

const PaymentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  const formatDecimal = (value) => {
    if (typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal).toFixed(2);
    }
    return parseFloat(value).toFixed(2);
  };

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await reportAPI.getById(id);
        const rawReport = response.data.report;

        const formattedReport = {
          ...rawReport,
          total_amount: formatDecimal(rawReport.total_amount),
        };

        setReport(formattedReport);
      } catch (err) {
        console.error('Error fetching report details:', err);
        setError('Failed to load report details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id]);

  const handleVerifyPayment = async () => {
    try {
      await reportAPI.verifyPayment(report.ref_no);
      alert('Payment verified successfully!');
      navigate('/checkPayment');
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment. Please try again.');
    }
  };

  const handleRejectPayment = async () => {
    try {
      await reportAPI.rejectPayment(report.ref_no);
      alert('Payment rejected successfully!');
      navigate('/checkPayment');
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment. Please try again.');
    }
  };

  const handleViewPDF = async () => {
    try {
      const response = await reportAPI.generate(report.ref_no);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const newPdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(newPdfUrl);
      setShowPdf(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!pdfUrl) {
        const response = await reportAPI.generate(report.ref_no);
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${report.ref_no}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.setAttribute('download', `report_${report.ref_no}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleClosePdf = () => {
    setShowPdf(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/checkPayment')}>Back to Payments</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="not-found-container">
        <h3>Report Not Found</h3>
        <p>The report you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/checkPayment')}>Back to Payments</button>
      </div>
    );
  }

  return (
    <div className="payment-detail-page">
      <div className="payment-detail-header">
        <button className="back-button" onClick={() => navigate('/checkPayment')}>
          &larr; Back to Payments
        </button>
        <h2>Report Details: {report.ref_no}</h2>
      </div>

      {showPdf ? (
        <div className="pdf-viewer-container">
          <div className="pdf-header">
            <h3>Report Preview</h3>
            <button className="close-pdf-button" onClick={handleClosePdf}>
              Close Preview
            </button>
          </div>
          <iframe src={pdfUrl} className="pdf-frame" title="PDF Viewer" />
        </div>
      ) : (
        <>
          <div className="report-section">
            <h3>Client Information</h3>
            <p><strong>Client Name:</strong> {report.client_name}</p>
            <p><strong>Department:</strong> {report.department}</p>
            <p><strong>Total Amount:</strong> ₹{report.total_amount}</p>
          </div>

          <div className="report-section">
            <h3>Payment Information</h3>
            <p><strong>Payment Status:</strong> {report.paid ? 'Paid' : 'Not Paid'}</p>
            <p><strong>Payment Verified:</strong> {report.paymentVerified ? 'Yes' : 'No'}</p>
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
            </table>
          </div>

          <div className="payment-actions">
            {!report.paymentVerified && (
              <>
                <button className="verify-button" onClick={handleVerifyPayment}>
                  Verify Payment
                </button>
                <button className="reject-button" onClick={handleRejectPayment}>
                  Reject Payment
                </button>
              </>
            )}
            <button className="view-report-button" onClick={handleViewPDF}>
              View Report PDF
            </button>
            <button className="download-pdf-button" onClick={handleDownloadPDF}>
              Download Report PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentDetailPage;

