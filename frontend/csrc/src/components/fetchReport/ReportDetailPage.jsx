import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI } from '../../api/API';
import ReportDetailView from './ReportDetailView';
import './ReportDetailPage.css';

const ReportDetailPage = () => {
  const { id } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const isFromVerifiedTab = searchParams.get('fromVerifiedTab') === 'true';
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdf, setShowPdf] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await reportAPI.getById(id);
        setReport(response.data.report);
        const userRole = localStorage.getItem('userRole');
        if ( userRole) {
          setUser({ role: userRole });
        }
      } catch (err) {
        console.error('Error fetching report details:', err);
        setError('Failed to load report details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id]);

  const handleVerify = async () => {
    try {
      await reportAPI.verify(report.ref_no);
      alert('Report verified successfully!');
      navigate('/reports');
    } catch (err) {
      console.error('Error verifying report:', err);
      alert('Failed to verify report. Please try again.');
    }
  };

  const handleReject = async () => {
    try {
      await reportAPI.reject(report.ref_no);
      alert('Report rejected successfully!');
      navigate('/reports');
    } catch (err) {
      console.error('Error rejecting report:', err);
      alert('Failed to reject report. Please try again.');
    }
  };

  const handleViewReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.generate(report.ref_no);

      // Convert the response to a Blob
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const newPdfUrl = URL.createObjectURL(pdfBlob);

      setPdfUrl(newPdfUrl);
      setShowPdf(true);
      setLoading(false);
    } catch (err) {
      console.error('Error viewing PDF:', err);
      alert('Failed to generate PDF. Please try again.');
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!pdfUrl) {
        // Generate PDF first if not already generated
        const response = await reportAPI.generate(report.ref_no);
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${report.ref_no}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Use existing PDF URL
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

  const handleViewPO = () => {
    if (report?.po_file_url) {
      window.open(report.po_file_url, '_blank');
    }
  };

  const handleClosePdf = () => {
    setShowPdf(false);
    // Optional: revoke the URL to free up memory
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
        <button onClick={() => navigate('/reports')}>Back to Reports</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="not-found-container">
        <h3>Report Not Found</h3>
        <p>The report you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/reports')}>Back to Reports</button>
      </div>
    );
  }

  return (
    <div className="report-detail-page">
      <div className="report-detail-header">
        <button className="back-button" onClick={() => navigate('/reports')}>
          &larr; Back to Reports
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
          <iframe
            src={pdfUrl}
            className="pdf-frame"
            title="PDF Viewer"
          />
        </div>
      ) : (
        <ReportDetailView report={report} />
      )}

      <div className="report-actions">
        <div className="file-actions">
          <button className="view-po-button" onClick={handleViewPO}>
            View PO File
          </button>
          <button className="view-report-button" onClick={handleViewReport}>
            View Report PDF
          </button>
          <button className="download-pdf-button" onClick={handleDownloadPDF}>
            Download Report PDF
          </button>
        </div>

        <div className="verification-actions">
          
    {!isFromVerifiedTab && user && user.role !== 'staff'  && user.role !== 'office'  && (
      <>
        <button className="reject-button" onClick={handleReject}>
          Reject Report
        </button>
        <button className="verify-button" onClick={handleVerify}>
          Verify Report
        </button>
      </>
    )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
