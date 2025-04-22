import React from 'react';
import { Link } from 'react-router-dom';
import './ReportCard.css';

const ReportCard = ({ report,isFromVerifiedTab }) => {
  const { _id, ref_no, client_name, department, test } = report;
  
  // Get test titles
  const testTitles = test.map(t => t.title).join(', ');
  
  return (
    <div className="report-card">
      <div className="report-card-header">
        <span className="ref-no">{ref_no}</span>
        <span className={`status-indicator ${report.verified_flag > 0 ? 'verified' : 'pending'}`}>
          {report.verified_flag > 0 ? 'Verified' : 'Pending'}
        </span>
      </div>
      
      <div className="report-card-body">
        <h3>{client_name}</h3>
        <p className="department">{department}</p>
        <p className="test-titles"><strong>Tests:</strong> {testTitles}</p>
        <p className="date">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div className="report-card-footer">
        <Link to={`/report/${_id}?fromVerifiedTab=${isFromVerifiedTab}`} className="view-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ReportCard;