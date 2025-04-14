import React, { useState, useEffect } from 'react';
import AddTest from '../components/TestComponents/AddTest';
import UpdateTest from '../components/TestComponents/UpdateTest';
import DeleteTest from '../components/TestComponents/DeleteTest';
import './TestPage.css';
import { TestAPI } from '../api/API';

const TestPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [mode, setMode] = useState('view'); // 'view', 'add', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  
  // Fetch tests on initial load
  useEffect(() => {
    fetchTests();
  }, []);
  
  // Filter tests when search term or tests array changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTests(tests);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = tests.filter(test => 
        test.title.toLowerCase().includes(term) ||
        test.unit.toLowerCase().includes(term) ||
        test.department.toLowerCase().includes(term)
      );
      setFilteredTests(filtered);
    }
  }, [searchTerm, tests]);
  
  const fetchTests = async () => {
    try {
      setLoading(true);
      
      const response = await TestAPI.fetchAll();
      setTests(response.data.tests);
      setFilteredTests(response.data.tests);
      setError('');
    } catch (err) {
      setError('Error loading tests. Please try again later.');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddClick = () => {
    setMode('add');
    setSelectedTest(null);
  };
  
  const handleEditClick = (test) => {
    setSelectedTest(test);
    setMode('edit');
  };
  
  const handleDeleteClick = (test) => {
    setSelectedTest(test);
    setMode('delete');
  };
  
  const handleCancel = () => {
    setMode('view');
    setSelectedTest(null);
  };
  
  const handleAddSuccess = (newTest) => {
    setTests(prev => [...prev, newTest]);
    setMode('view');
  };
  
  const handleUpdateSuccess = (updatedTest) => {
    setTests(prev => 
      prev.map(test => test._id === updatedTest._id ? updatedTest : test)
    );
    setMode('view');
    setSelectedTest(null);
  };
  
  const handleDeleteSuccess = (deletedTestId) => {
    setTests(prev => prev.filter(test => test._id !== deletedTestId));
    setMode('view');
    setSelectedTest(null);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="test-page-container">
      <h2>Test Management</h2>
      
      {error && <div className="page-error">{error}</div>}
      
      <div className="test-page-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          className="add-btn"
          onClick={handleAddClick}
          disabled={mode !== 'view'}
        >
          Add New Test
        </button>
      </div>
      
      <div className="test-page-content">
        {mode === 'view' && (
          <div className="tests-table-container">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="no-tests-message">
                {searchTerm ? 'No tests match your search.' : 'No tests available. Add a new test to get started.'}
              </div>
            ) : (
              <table className="tests-table">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Unit</th>
                    <th>Price Per Unit</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => (
                    <tr key={test._id}>
                      <td>{test.title}</td>
                      <td>{test.unit}</td>
                      <td>₹{test.pricePerUnit.toFixed(2)}</td>
                      <td>{test.department}</td>
                      <td className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditClick(test)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(test)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {mode === 'add' && (
          <AddTest 
            onCancel={handleCancel}
            onAddSuccess={handleAddSuccess}
          />
        )}
        
        {mode === 'edit' && selectedTest && (
          <UpdateTest 
            test={selectedTest}
            onCancel={handleCancel}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
        
        {mode === 'delete' && selectedTest && (
          <DeleteTest 
            test={selectedTest}
            onCancel={handleCancel}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TestPage;