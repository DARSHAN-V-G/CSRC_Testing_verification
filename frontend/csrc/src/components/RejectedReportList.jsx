import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import './ReportReject.css';

const RejectedReportsList = ({ reports, onEditClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter((report) => {
    const searchString = searchTerm.toLowerCase();
    return (
      report.ref_no.toLowerCase().includes(searchString) ||
      report.client_name.toLowerCase().includes(searchString) ||
      report.department.toLowerCase().includes(searchString) ||
      (report.rejected_by && report.rejected_by.toLowerCase().includes(searchString))
    );
  });

  return (
    <div className="rejected-reports-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {filteredReports.length === 0 ? (
        <div className="no-reports">
          {searchTerm ? 'No reports match your search' : 'No rejected reports found'}
        </div>
      ) : (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Client</th>
                <th>Department</th>
                <th>Lab</th>
                <th>Rejected By</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td>{report.ref_no}</td>
                  <td>{report.client_name}</td>
                  <td>{report.department}</td>
                  <td>{report.lab}</td>
                  <td>{report.rejected_by}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => onEditClick(report)}
                    >
                      Edit & Resubmit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RejectedReportsList;