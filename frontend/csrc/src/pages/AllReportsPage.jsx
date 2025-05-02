import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../api/API';
import ReportCard from '../components/fetchAllReports/ReportCard';
import './AllReportsPage.css';

const AllReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Get unique departments from reports
  const departments = [...new Set(reports.map(report => report.department))].sort();

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, searchTerm, startDate, endDate, selectedDepartment]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.fetchAll();
      setReports(response.data.reports);
      setFilteredReports(response.data.reports);
      setError(null);
    } catch (err) {
      console.error('Error fetching all reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.ref_no.toLowerCase().includes(term) ||
        report.client_name.toLowerCase().includes(term) ||
        (report.client_po_no && report.client_po_no.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(report => report.department === selectedDepartment);
    }

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(report => 
        new Date(report.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      // Add one day to include the end date fully
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      
      filtered = filtered.filter(report => 
        new Date(report.createdAt) <= endDateObj
      );
    }

    setFilteredReports(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedDepartment('');
  };

  return (
    <div className="all-reports-page">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>All Reports</h2>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by ref no, client name, PO no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label>Department:</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>To:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="reset-filters-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAllReports}>Try Again</button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="no-reports">
          {reports.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <p>No reports match your search criteria.</p>
          )}
        </div>
      ) : (
        <>
          <div className="results-summary">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
          <div className="reports-grid">
            {filteredReports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllReportsPage;