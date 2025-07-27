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
      (report.client_po_no && report.client_po_no.toLowerCase().includes(term)) ||
      (report.faculty_incharge && report.faculty_incharge.toLowerCase().includes(term))
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
    <div className="all-reports-container">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-card">
          <h3>Search & Filter Reports</h3>
          
          <div className="search-row">
            <div className="search-group">
              <label htmlFor="search">Search Reports</label>
              <input
                type="text"
                id="search"
                placeholder="Search by reference no, client name,PO number, or faculty in-charge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="department">Department</label>
              <select 
                id="department"
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="filter-select"
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
              <label htmlFor="startDate">From Date</label>
              <input 
                type="date" 
                id="startDate"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-date"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate">To Date</label>
              <input 
                type="date" 
                id="endDate"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-date"
              />
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <h3>Error Loading Reports</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchAllReports}>
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="results-header">
              <div className="results-summary">
                <span className="results-count">
                  Showing {filteredReports.length} of {reports.length} reports
                </span>
                {(searchTerm || selectedDepartment || startDate || endDate) && (
                  <span className="filter-active">
                    • Filters applied
                  </span>
                )}
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="no-results">
                <div className="no-results-content">
                  <h3>No Reports Found</h3>
                  {reports.length === 0 ? (
                    <p>No reports have been created yet.</p>
                  ) : (
                    <p>No reports match your search criteria. Try adjusting your filters.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllReportsPage;