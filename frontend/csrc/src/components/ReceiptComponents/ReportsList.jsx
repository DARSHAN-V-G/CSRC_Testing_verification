import React, { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import './ReportsList.css';

const ReportsList = ({ reports, onReportSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter((report) => {
    const searchString = searchTerm.toLowerCase();
    return (
      report.ref_no.toLowerCase().includes(searchString) ||
      report.client_name.toLowerCase().includes(searchString) ||
      report.department.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="reports-list-container">
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
          {searchTerm ? 'No reports match your search' : 'No reports need receipt numbers'}
        </div>
      ) : (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Client</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td>{report.ref_no}</td>
                  <td>{report.client_name}</td>
                  <td>{report.department}</td>
                  <td>
                    ₹{typeof report.total_amount === 'object' && report.total_amount.$numberDecimal 
                      ? report.total_amount.$numberDecimal 
                      : (typeof report.total_amount === 'string' 
                        ? report.total_amount 
                        : report.total_amount?.toFixed(2) || '0.00')}
                  </td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <button
                      className="add-receipt-btn"
                      onClick={() => onReportSelect(report)}
                    >
                      Add Receipt
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

export default ReportsList;