import React, { useState, useEffect, useRef } from 'react';
import './TestForms.css';
import { TestAPI } from '../../api/API';

const UpdateTest = ({ test, onCancel, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    unit: '',
    pricePerUnit: '',
    department: '',
    lab: '' // Added lab field
  });
  
  // UI state variables
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [labSearchTerm, setLabSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  
  // Refs for dropdown handling
  const labInputRef = useRef(null);
  const labDropdownRef = useRef(null);
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
    'TEXTILE TECHNOLOGY',
    'PHYSICS',
    'CHEMISTRY',
    'MATHEMATICS',
    'ENGLISH',
    'HUMANITIES',
    'PHYSICAL EDUCATION'
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
        department: test.department || '',
        lab: test.lab || '' // Initialize lab field
      });
      setSearchTerm(test.department || '');
      setLabSearchTerm(test.lab || '');
      
      // Fetch labs for the current department
      if (test.department) {
        fetchLabsByDepartment(test.department);
      }
    }
  }, [test]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close department dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
      
      // Close lab dropdown
      if (labDropdownRef.current && !labDropdownRef.current.contains(event.target) &&
          labInputRef.current && !labInputRef.current.contains(event.target)) {
        setShowLabDropdown(false);
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

  // Fetch labs for the selected department
  const fetchLabsByDepartment = async (departmentName) => {
    if (!departmentName) return;
    
    setLabsLoading(true);
    setError('');
    
    try {
      const response = await TestAPI.fetchLabByDepartment({ department: departmentName });
      if (response.data && response.data.lab) {
        setLabs(response.data.lab);
      } else {
        setLabs([]);
        // If changing department, reset lab field
        if (departmentName !== test.department) {
          setFormData(prev => ({
            ...prev,
            lab: ''
          }));
          setLabSearchTerm('');
        }
      }
    } catch (err) {
      console.error('Error fetching labs:', err);
      setLabs([]);
      setError('Failed to load labs for this department. Please try again.');
    } finally {
      setLabsLoading(false);
    }
  };

  // Department selection handlers
  const handleDepartmentSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDepartmentDropdown(true);
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({
      ...prev,
      department,
      lab: '' // Reset lab when department changes
    }));
    setSearchTerm(department);
    setShowDepartmentDropdown(false);
    setLabSearchTerm('');
    
    // Fetch labs for the selected department
    fetchLabsByDepartment(department);
  };

  const handleDepartmentInputFocus = () => {
    setShowDepartmentDropdown(true);
  };

  // Lab selection handlers
  const handleLabSearch = (e) => {
    setLabSearchTerm(e.target.value);
    setShowLabDropdown(true);
  };

  const handleLabSelect = (lab) => {
    setFormData(prev => ({
      ...prev,
      lab
    }));
    setLabSearchTerm(lab);
    setShowLabDropdown(false);
  };

  const handleLabInputFocus = () => {
    setShowLabDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate required fields
    if (!formData.title || !formData.unit || !formData.pricePerUnit || !formData.department || !formData.lab) {
      setError('All fields are required');
      return;
    }
    
    // Validate department selection
    if (!departmentOptions.includes(formData.department)) {
      setError('Please select a valid department from the list');
      return;
    }
    
    // Validate lab selection
    if (!labs.includes(formData.lab)) {
      setError('Please select a valid lab from the list');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert pricePerUnit to a number with 2 decimal places
      const testData = {
        ...formData,
        pricePerUnit: parseFloat(parseFloat(formData.pricePerUnit).toFixed(2)),
        _id: test._id // Include the test ID
      };
      
      // Make API call to update test
      const response = await TestAPI.updateTest(test._id, testData);
      const result = response.data;
      
      // Notify parent component
      if (onUpdateSuccess) {
        onUpdateSuccess(result.test);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update test');
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
        
        {formData.department && (
          <div className="form-group">
            <label htmlFor="labSearch">Lab*</label>
            <div className="searchable-dropdown">
              {labsLoading ? (
                <div className="lab-loading">Loading labs...</div>
              ) : (
                <>
                  <input
                    type="text"
                    id="labSearch"
                    ref={labInputRef}
                    value={labSearchTerm}
                    onChange={handleLabSearch}
                    onFocus={handleLabInputFocus}
                    placeholder="Search or select lab"
                    required
                    autoComplete="off"
                  />
                  <input 
                    type="hidden" 
                    name="lab" 
                    value={formData.lab} 
                    required 
                  />
                  
                  {showLabDropdown && (
                    <div className="dropdown-menu" ref={labDropdownRef}>
                      {labs.length > 0 ? (
                        labs
                          .filter(lab => lab.toLowerCase().includes(labSearchTerm.toLowerCase()))
                          .map((lab, index) => (
                            <div 
                              key={index} 
                              className={`dropdown-item ${formData.lab === lab ? 'selected' : ''}`}
                              onClick={() => handleLabSelect(lab)}
                            >
                              {lab}
                            </div>
                          ))
                      ) : (
                        <div className="dropdown-no-results">No labs found for this department</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
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