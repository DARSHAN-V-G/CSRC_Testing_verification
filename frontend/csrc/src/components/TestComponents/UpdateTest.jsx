import React, { useState, useEffect, useRef } from 'react';
import './TestForms.css';

const UpdateTest = ({ test, onCancel, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
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
  
  // Initialize form data when test prop changes
  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || '',
        unit: test.unit || '',
        pricePerUnit: test.pricePerUnit ? test.pricePerUnit.toString() : '',
        department: test.department || ''
      });
      setSearchTerm(test.department || '');
    }
  }, [test]);

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
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleDepartmentSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDepartmentDropdown(true);
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({
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
    if (!formData.title || !formData.unit || !formData.pricePerUnit || !formData.department) {
      setError('All fields are required');
      return;
    }
    
    // Validate that department is one of the options
    if (!departmentOptions.includes(formData.department)) {
      setError('Please select a valid department from the list');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Convert pricePerUnit to a number with 2 decimal places
      const testData = {
        ...formData,
        pricePerUnit: parseFloat(parseFloat(formData.pricePerUnit).toFixed(2)),
        _id: test._id // Include the test ID
      };
      
      // Make API call to update test
      const response = await fetch(`http://localhost:4000/test/update/${test._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update test');
      }
      
      const result = await response.json();
      
      // Notify parent component
      if (onUpdateSuccess) {
        onUpdateSuccess(result.test);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to update test');
      console.error('Error updating test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-form-container">
      <h3>Update Test</h3>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Test Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
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
            value={formData.unit}
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
            value={formData.pricePerUnit}
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
              value={formData.department} 
              required 
            />
            
            {showDepartmentDropdown && (
              <div className="dropdown-menu" ref={dropdownRef}>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, index) => (
                    <div 
                      key={index} 
                      className={`dropdown-item ${formData.department === dept ? 'selected' : ''}`}
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
            {isSubmitting ? 'Updating...' : 'Update Test'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTest;