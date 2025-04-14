import React, { useState, useRef, useEffect } from 'react';
import './TestForms.css';
import { TestAPI } from '../../api/API';
const AddTest = ({ onAddSuccess }) => {
  const [test, setTest] = useState({
    title: '',
    unit: '',
    pricePerUnit: '',
    department: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Department options
  const departmentOptions = [
    'APPAREL AND FASHION DESIGN',
    'APPLIED MATHEMATICS AND COMPUTATIONAL SCIENCES',
    'APPLIED SCIENCE',
    'AUTOMOBILE ENGINEERING',
    'BIOMEDICAL ENGINEERING',
    'BIOTECHNOLOGY',
    'CIVIL ENGINEERING',
    'COMPUTER APPLICATIONS',
    'COMPUTER SCIENCE & ENGINEERING',
    'ELECTRICAL & ELECTRONICS ENGINEERING',
    'ELECTRONICS & COMMUNICATION ENGINEERING',
    'FASHION TECHNOLOGY',
    'INFORMATION TECHNOLOGY',
    'INSTRUMENTATION & CONTROL ENGINEERING',
    'MECHANICAL ENGINEERING',
    'METALLURGICAL ENGINEERING',
    'PRODUCTION ENGINEERING',
    'ROBOTICS & AUTOMATION ENGINEERING',
    'TEXTILE TECHNOLOGY'
  ];

  // Filter departments based on search term
  const filteredDepartments = departmentOptions.filter(dept =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Handle decimal numbers for pricePerUnit
    if (name === 'pricePerUnit') {
      // Allow only numbers with up to 2 decimal places
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        processedValue = value;
      } else {
        return; // Don't update if invalid
      }
    }
    
    setTest(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleDepartmentSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDepartmentDropdown(true);
  };

  const handleDepartmentSelect = (department) => {
    setTest(prev => ({
      ...prev,
      department
    }));
    setSearchTerm(department);
    setShowDepartmentDropdown(false);
  };

  const handleDepartmentInputFocus = () => {
    setShowDepartmentDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!test.title || !test.unit || !test.pricePerUnit || !test.department) {
      setError('All fields are required');
      return;
    }
    
    // Validate that department is one of the options
    if (!departmentOptions.includes(test.department)) {
      setError('Please select a valid department from the list');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Convert pricePerUnit to a number with 2 decimal places
      const testData = {
        ...test,
        pricePerUnit: parseFloat(parseFloat(test.pricePerUnit).toFixed(2))
      };
      
      // Make API call to add test
      const response = await TestAPI.addTest(testData);
      const result = response.data;
      
      // Reset the form
      setTest({
        title: '',
        unit: '',
        pricePerUnit: '',
        department: ''
      });
      setSearchTerm('');
      
      // Notify parent component
      if (onAddSuccess) {
        onAddSuccess(result.test);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to add test');
      console.error('Error adding test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-form-container">
      <h3>Add New Test</h3>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Test Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={test.title}
            onChange={handleChange}
            placeholder="Enter test title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="unit">Unit*</label>
          <input
            type="text"
            id="unit"
            name="unit"
            value={test.unit}
            onChange={handleChange}
            placeholder="e.g. kg, cm, pieces"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="pricePerUnit">Price Per Unit (₹)*</label>
          <input
            type="text"
            id="pricePerUnit"
            name="pricePerUnit"
            value={test.pricePerUnit}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
          <small>Enter price with up to 2 decimal places</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="departmentSearch">Department*</label>
          <div className="searchable-dropdown">
            <input
              type="text"
              id="departmentSearch"
              ref={searchInputRef}
              value={searchTerm}
              onChange={handleDepartmentSearch}
              onFocus={handleDepartmentInputFocus}
              placeholder="Search or select department"
              required
              autoComplete="off"
            />
            <input 
              type="hidden" 
              name="department" 
              value={test.department} 
              required 
            />
            
            {showDepartmentDropdown && (
              <div className="dropdown-menu" ref={dropdownRef}>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, index) => (
                    <div 
                      key={index} 
                      className={`dropdown-item ${test.department === dept ? 'selected' : ''}`}
                      onClick={() => handleDepartmentSelect(dept)}
                    >
                      {dept}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-no-results">No departments found</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTest;