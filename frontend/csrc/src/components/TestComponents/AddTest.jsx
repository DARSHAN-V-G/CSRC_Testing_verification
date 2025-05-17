import React, { useState, useRef, useEffect } from 'react';
import './TestForms.css';
import { TestAPI } from '../../api/API';

const AddTest = ({ onAddSuccess }) => {
  // Form state
  const [test, setTest] = useState({
    title: '',
    unit: '',
    pricePerUnit: '',
    department: '',
    lab: '' 
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
    'PHYSICAL EDUCATION',
    'PHYSICS',
  ];

  // Filter departments based on search term
  const filteredDepartments = departmentOptions.filter(dept =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Handle form input changes
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

  // Fetch labs for the selected department
  const fetchLabsByDepartment = async (departmentName) => {
    if (!departmentName) return;
    
    setLabsLoading(true);
    setError('');
    
    try {
      console.log(departmentName)
      const response = await TestAPI.fetchLabByDepartment({ department: departmentName });
      if (response.data && response.data.lab) {
        setLabs(response.data.lab);
        
        // Auto-select first lab if available
        /*if (response.data.lab.length > 0) {
          const firstLab = response.data.lab[0];
          setTest(prev => ({
            ...prev,
            lab: firstLab
          }));
          setLabSearchTerm(firstLab);
        }*/
       setTest(prev => ({
        ...prev,
        lab: ''
      }));
      setLabSearchTerm('');

      } else {
        setLabs([]);
        setTest(prev => ({
          ...prev,
          lab: ''
        }));
        setLabSearchTerm('');
      }
    } catch (err) {
      console.error('Error fetching labs:', err);
      setLabs([]);
      setTest(prev => ({
        ...prev,
        lab: ''
      }));
      setLabSearchTerm('');
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
    setTest(prev => ({
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
    setTest(prev => ({
      ...prev,
      lab
    }));
    setLabSearchTerm(lab);
    setShowLabDropdown(false);
  };

  const handleLabInputFocus = () => {
    setShowLabDropdown(true);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate required fields
    if (!test.title || !test.unit || !test.pricePerUnit || !test.department || !test.lab) {
      setError('All fields are required');
      return;
    }
    
    // Validate department selection
    if (!departmentOptions.includes(test.department)) {
      setError('Please select a valid department from the list');
      return;
    }
    
    // Validate lab selection
    if (!labs.includes(test.lab)) {
      setError('Please select a valid lab from the list');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
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
        department: '',
        lab: ''
      });
      setSearchTerm('');
      setLabSearchTerm('');
      setLabs([]);
      
      // Notify parent component
      if (onAddSuccess) {
        onAddSuccess(result.test);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add test');
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
        
        {test.department && (
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
                    value={test.lab} 
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
                              className={`dropdown-item ${test.lab === lab ? 'selected' : ''}`}
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
            {isSubmitting ? 'Adding...' : 'Add Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTest;