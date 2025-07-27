import React, { useState, useEffect, useRef } from 'react';
import './ReportUploadForm.css';
import { reportAPI, TestAPI } from '../api/API';
import { useNavigate } from 'react-router-dom';
const ReportUploadForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    ref_no: '',
    department: '',
    lab: '',
    verified_flag: 0,
    client_name: '',
    client_po_no: '',
    bill_to_be_sent_mail_address: '',
    client_po_recieved_date: '',
    gst_no: '',
    faculty_incharge: '',
    paid: false,
    payment_mode: '',
    prepared_by: '', // This will be fetched and set
    po_file: null,
    total_amount: 0,
    transaction_details: '',
    transaction_date: '',
    receipt_no: '',
    bill_no: '',
    gst_percent: 18 // Default GST percentage
  });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    address: '',
    gstno: '',
    department: ''
  });
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const customerSearchRef = useRef(null);
  const customerDropdownRef = useRef(null);
  const [tests, setTests] = useState([{
    title: '',
    unit: '',
    pricePerUnit: 0,
    quantity: 0,
    testId: '' // To store the selected test's ID
  }]);

  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // For search dropdown
  const [searchTerms, setSearchTerms] = useState(['']);
  const [showDropdowns, setShowDropdowns] = useState([false]);
  const [filteredTests, setFilteredTests] = useState([[]]);
  const [labs, setLabs] = useState([]);
  const searchInputRefs = useRef([]);
  const dropdownRefs = useRef([]);
  const navigate = useNavigate();
  useEffect(() => {
    const initializeForm = async () => {
      try {
        const generatedRefNo = await generateRefNo();
        const dept = findDepartment();

        // Fetch the username for "Prepared By"
        const response = await reportAPI.getUsername();
        const username = response.data.username;

        setFormData(prev => ({
          ...prev,
          ref_no: generatedRefNo,
          department: dept,
          prepared_by: username // Set the fetched username
          
        }));
        await fetchLabs();
      } catch (err) {
        console.error('Error fetching username:', err);
        setError('Failed to fetch username. Please try again.');
      }
    };

    initializeForm();
    // Fetch available tests

  }, []);

  // Add this useEffect
useEffect(() => {
  if (formData.lab) {
    // Clear current test selections when lab changes
    setTests([{
      title: '',
      unit: '',
      pricePerUnit: 0,
      quantity: 0,
      testId: ''
    }]);
    setSearchTerms(['']);
    setFilteredTests([[]]);
    
    // Fetch tests for the selected lab
    fetchAvailableTests(formData.lab);
  }
}, [formData.lab]); // This effect runs when lab selection changes

  // Filter tests when search term changes
  useEffect(() => {
    const newFilteredTests = searchTerms.map((term, index) => {
      if (!term.trim()) return availableTests;
      return availableTests.filter(test =>
        test.title.toLowerCase().includes(term.toLowerCase())
      );
    });
    setFilteredTests(newFilteredTests);
  }, [searchTerms, availableTests]);

  // Setup click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target) &&
          searchInputRefs.current[index] && !searchInputRefs.current[index].contains(event.target)) {
          const newShowDropdowns = [...showDropdowns];
          newShowDropdowns[index] = false;
          setShowDropdowns(newShowDropdowns);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdowns]);

  // Add this useEffect after your existing useEffects
useEffect(() => {
  fetchCustomers();
}, []);

// Add click outside handler for customer dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target) &&
        customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
      setShowCustomerDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  const fetchAvailableTests = async (selectedLab = formData.lab) => {
  try {
    setLoading(true);
    setError('');
    
    // Only fetch tests if a lab is selected
    if (!selectedLab) {
      setAvailableTests([]);
      return;
    }
    
    // Pass the lab name to the API
    const response = await TestAPI.fetchByDepartment(selectedLab);
    setAvailableTests(response.data.tests);
  } catch (err) {
    setError('Failed to load available tests');
    console.error('Error fetching tests:', err);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'gst_percent') {
      // Update GST percentage and recalculate total
      const newGstPercent = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        gst_percent: newGstPercent
      }));
      calculateTotalAmount(tests, newGstPercent);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked :
          type === 'file' ? files[0] :
            name === 'client_po_recieved_date' ? value :
              value
      });
    }
  };
  const fetchLabs = async () => {
  try {
    const response = await reportAPI.fetchLab();
    if (response.data && response.data.labs && response.data.labs.labs) {
      setLabs(response.data.labs.labs);
      
      // Set the first lab as the default selected value
      if (response.data.labs.labs.length > 0) {
        setFormData(prev => ({
          ...prev,
          lab: response.data.labs.labs[0]
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching labs:', err);
    setError(prevError => prevError || 'Failed to fetch labs');
  }
};

  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTests = [...tests];

    updatedTests[index] = {
      ...updatedTests[index],
      [name]: name === 'pricePerUnit' || name === 'quantity' ? Number(value) : value
    };

    setTests(updatedTests);
    calculateTotalAmount(updatedTests, formData.gst_percent);
  };

  const handleTestSearch = (index, e) => {
    const term = e.target.value;

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = term;
    setSearchTerms(newSearchTerms);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = true;
    setShowDropdowns(newShowDropdowns);
  };

  const handleTestSelect = (index, test) => {
    const updatedTests = [...tests];
    updatedTests[index] = {
      ...updatedTests[index],
      title: test.title,
      unit: test.unit,
      pricePerUnit: Number(test.pricePerUnit),
      testId: test._id,
      quantity: updatedTests[index].quantity || 1 // Set default quantity to 1 if not set
    };

    setTests(updatedTests);
    calculateTotalAmount(updatedTests, formData.gst_percent);

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = test.title;
    setSearchTerms(newSearchTerms);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = false;
    setShowDropdowns(newShowDropdowns);
  };

  const handleSearchFocus = (index) => {
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = true;
    setShowDropdowns(newShowDropdowns);
  };

  const addTest = () => {
    // Add a new empty test
    setTests([...tests, {
      title: '',
      unit: '',
      pricePerUnit: 0,
      quantity: 0,
      testId: ''
    }]);

    // Add an empty string to searchTerms array for the new test
    setSearchTerms([...searchTerms, '']);

    // Add a false value to showDropdowns array for the new test
    setShowDropdowns([...showDropdowns, false]);

    // Initialize the filtered tests for the new row
    setFilteredTests([...filteredTests, availableTests]);

    // Make sure refs are updated - this will be handled by useEffect
    searchInputRefs.current = [...searchInputRefs.current, null];
    dropdownRefs.current = [...dropdownRefs.current, null];
  };

  const removeTest = (index) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    setTests(updatedTests);

    // Update search terms and show dropdowns arrays
    const newSearchTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newSearchTerms);

    const newShowDropdowns = showDropdowns.filter((_, i) => i !== index);
    setShowDropdowns(newShowDropdowns);

    const newFilteredTests = filteredTests.filter((_, i) => i !== index);
    setFilteredTests(newFilteredTests);

    calculateTotalAmount(updatedTests, formData.gst_percent);
  };

  const generateRefNo = async () => {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) return '';

  const domainPart = userEmail.split('.')[1].split('@')[0].toUpperCase();
  
  try {
    const response = await reportAPI.getReportCount(findDepartment());
    const count = response.data.count || 0;
    const formattedCount = String(count+1).padStart(6, '0');
    console.log(`REF_${domainPart}_${formattedCount}`);
    return `REF_${domainPart}_${formattedCount}`;
  } catch (error) {
    console.error('Error fetching report count:', error);
    return `REF_${domainPart}_000001`;
  }
};

  const findDepartment = () => {
    let email = localStorage.getItem('userEmail');
    if (!email) return "";
    email = email.toLowerCase();
    let part = email.split('.')[1];
    part = part.split('@')[0];
    console.log(part);
    const departmentMap = {
      'afd': 'APPAREL AND FASHION DESIGN',
    'amcs': 'APPLIED MATHEMATICS AND COMPUTATIONAL SCIENCES',
    'apsc': 'APPLIED SCIENCE',
    'auto': 'AUTOMOBILE ENGINEERING',
    'bme': 'BIOMEDICAL ENGINEERING',
    'bio': 'BIOTECHNOLOGY',
    'civil': 'CIVIL ENGINEERING',
    'mca': 'COMPUTER APPLICATIONS',
    'cse': 'COMPUTER SCIENCE & ENGINEERING',
    'eee': 'ELECTRICAL & ELECTRONICS ENGINEERING',
    'ece': 'ELECTRONICS & COMMUNICATION ENGINEERING',
    'fashion': 'FASHION TECHNOLOGY',
    'it': 'INFORMATION TECHNOLOGY',
    'ice': 'INSTRUMENTATION & CONTROL ENGINEERING',
    'mech': 'MECHANICAL ENGINEERING',
    'metal': 'METALLURGICAL ENGINEERING',
    'prod': 'PRODUCTION ENGINEERING',
    'rae': 'ROBOTICS & AUTOMATION ENGINEERING',
    'textile': 'TEXTILE TECHNOLOGY',
    'phy': 'PHYSICS',
    'chem': 'CHEMISTRY',
    'maths': 'MATHEMATICS',
    'english': 'ENGLISH',
    'hum': 'HUMANITIES',
    'ped': 'PHYSICAL EDUCATION',
    'ac': "PHYSICS",
    'com': "PHYSICS",
    };
    return departmentMap[part] || null;
  };

  const calculateTotalAmount = (testList, gstPercent = formData.gst_percent) => {
    const subtotal = testList.reduce((sum, test) => {
      return sum + (test.pricePerUnit * test.quantity || 0);
    }, 0);

    const gstAmount = subtotal * (gstPercent / 100);
    const total = subtotal + gstAmount;

    setFormData(prev => ({
      ...prev,
      total_amount: total.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'po_file' && key !== 'gst_percent') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append file
      if (formData.po_file) {
        formDataToSend.append('po_file', formData.po_file);
      }

      // Prepare tests data - remove testId before sending
      const testsToSend = tests.map(({ testId, ...rest }) => rest);

      // Append tests as JSON string
      formDataToSend.append('test', JSON.stringify(testsToSend));
      console.log(formData);
      const response = await reportAPI.create(formDataToSend);

      alert('Report created successfully!');
      console.log(response.data);
      const newRefNo = await generateRefNo();
      // Reset form
      setFormData({
        ref_no: newRefNo,
        department: findDepartment(),
        verified_flag: 0,
        client_name: '',
        client_po_no: '',
        bill_to_be_sent_mail_address: '',
        client_po_recieved_date: '',
        gst_no: '',
        faculty_incharge: '',
        paid: false,
        payment_mode: '',
        prepared_by: '',
        po_file: null,
        total_amount: 0,
        transaction_details: '',
        transaction_date: '',
        gst_percent: 18
      });
      setCustomerSearchTerm('');
setShowCustomerDropdown(false);
setFilteredCustomers(customers);
      setTests([{
        title: '',
        unit: '',
        pricePerUnit: 0,
        quantity: 0,
        testId: ''
      }]);
      setSearchTerms(['']);
      setShowDropdowns([false]);
      setFilteredTests([[]]);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to create report'}`);
    } finally {
      // Set submitting state back to false regardless of success or failure
      setIsSubmitting(false);
    }
  };


  // Fetch customers by department
const fetchCustomers = async () => {
  try {
    setCustomerLoading(true);
    const department = findDepartment();
    if (department) {
      const response = await reportAPI.getCustomer(department);
      setCustomers(response.data.data || []);
      setFilteredCustomers(response.data.data || []);
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    setError('Failed to fetch customers');
  } finally {
    setCustomerLoading(false);
  }
};

// Handle customer form changes
const handleCustomerFormChange = (e) => {
  const { name, value } = e.target;
  setCustomerFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Handle customer search
// Handle customer search - similar to test search
const handleCustomerSearch = (e) => {
  const term = e.target.value;
  setCustomerSearchTerm(term);
  setShowCustomerDropdown(true);
  
  // Clear the form data when searching (similar to test behavior)
  setFormData(prev => ({
    ...prev,
    client_name: '',
    bill_to_be_sent_mail_address: '',
    gst_no: ''
  }));
  
  if (!term.trim()) {
    setFilteredCustomers(customers);
  } else {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.gstno.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }
};

// Handle customer selection
// Handle customer selection - similar to test selection
const handleCustomerSelect = (customer) => {
  setFormData(prev => ({
    ...prev,
    client_name: customer.name,
    bill_to_be_sent_mail_address: customer.address,
    gst_no: customer.gstno
  }));
  
  // Set the search term to show the selected customer name
  setCustomerSearchTerm(customer.name);
  setShowCustomerDropdown(false);
};

const resetCustomerSelection = () => {
  setCustomerSearchTerm('');
  setFormData(prev => ({
    ...prev,
    client_name: '',
    bill_to_be_sent_mail_address: '',
    gst_no: ''
  }));
  setShowCustomerDropdown(false);
};

// Save new customer
const handleSaveCustomer = async (e) => {
  e.preventDefault();
  try {
    const customerData = {
      ...customerFormData,
      department: findDepartment()
    };

    console.log("sample",customerData);
    await reportAPI.createCustomer(customerData);
    alert('Customer created successfully!');
    
    // Reset form and close modal
    setCustomerFormData({
      name: '',
      address: '',
      gstno: '',
      department: ''
    });
    setShowCustomerModal(false);
    
    // Refresh customers list
    await fetchCustomers();
  } catch (error) {
    console.error('Error creating customer:', error);
    alert(`Error: ${error.response?.data?.message || 'Failed to create customer'}`);
  }
};

// Handle modal open
const handleAddCustomerClick = () => {
  setCustomerFormData({
    name: '',
    address: '',
    gstno: '',
    department: findDepartment()
  });
  setShowCustomerModal(true);
};
  return (
    <div className="report-form-container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>CSRC Testing Report Form</h2>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>

        <div className="form-section">
          <h3>Report Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ref_no">Reference No :</label>
              <div className="ref-number-display">{formData.ref_no}</div>
              {/* Hidden input to ensure the ref_no is submitted with the form */}
              <input type="hidden" name="ref_no" value={formData.ref_no} />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department :</label>
              <div className="ref-number">{formData.department}</div>
              {/* Hidden input to ensure the department is submitted with the form */}
              <input type="hidden" name="department" value={formData.department} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Testing">Testing</option>
                <option value="Testing and Consultancy">Testing and Consultancy</option>
              </select>
              
            </div>
            <div className="form-group">
                <label htmlFor="lab">Lab*</label>
                <select
                  id="lab"
                  name="lab"
                  value={formData.lab || ''}
                  onChange={(e) => {
      // First update the formData state with the new lab value
      handleChange(e);
      
      // Then manually call fetchAvailableTests with the new lab value
      fetchAvailableTests(e.target.value);
    }}
                  required
                >
                  {labs.length === 0 ? (
                    <option value="">Loading labs...</option>
                  ) : (
                    <>
                      <option value="">Select Lab</option>
                      {labs.map((lab, index) => (
                        <option key={index} value={lab}>
                          {lab}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
          </div>
        </div>

        <div className="form-section">
  <h3>Client Information</h3>
  
  {/* Add Customer Button */}
  <div className="form-row">
    <div className="form-group">
      <button 
        type="button" 
        className="add-customer-btn"
        onClick={handleAddCustomerClick}
      >
        + Add New Customer
      </button>
    </div>
  </div>

<div className="form-row">
  <div className="form-group">
    <label htmlFor="client_name">Client Name*</label>
    <div className="searchable-customer-dropdown">
      <input
        type="text"
        id="client_name"
        name="client_name"
        placeholder="Search for customer..."
        value={customerSearchTerm}
        onChange={handleCustomerSearch}
        onFocus={() => setShowCustomerDropdown(true)}
        ref={customerSearchRef}
        required
      />
      {showCustomerDropdown && (
        <div 
          className="dropdown-menu customer-dropdown"
          ref={customerDropdownRef}
        >
          {customerLoading ? (
            <div className="dropdown-loading">Loading customers...</div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className={`dropdown-item ${formData.client_name === customer.name ? 'selected' : ''}`}
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="customer-item">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-gst">GST: {customer.gstno}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="dropdown-no-results">No customers found</div>
          )}
        </div>
      )}
      {/* Hidden input to store the selected customer data */}
      <input
        type="hidden"
        name="client_name"
        value={formData.client_name || ''}
      />
    </div>
  </div>
  <div className="form-group">
    <label htmlFor="client_po_no">Client PO No*</label>
    <input
      type="text"
      id="client_po_no"
      name="client_po_no"
      value={formData.client_po_no}
      onChange={handleChange}
      required
    />
  </div>
</div>
  
  {/* Rest of your existing client information fields remain the same */}
  <div className="form-row">
  <div className="form-group">
    <label htmlFor="bill_to_be_sent_mail_address">Billing Address*</label>
    <textarea
      id="bill_to_be_sent_mail_address"
      name="bill_to_be_sent_mail_address"
      value={formData.bill_to_be_sent_mail_address}
      onChange={handleChange}
      rows="4"
      required
      readOnly // Make it read-only since it's auto-filled
      className="address-textarea readonly-textarea"
      placeholder="Address will be auto-filled when customer is selected"
    ></textarea>
  </div>
  <div className="form-group">
    <label htmlFor="client_po_recieved_date">PO Received Date*</label>
    <input
      type="date"
      id="client_po_recieved_date"
      name="client_po_recieved_date"
      value={formData.client_po_recieved_date}
      onChange={handleChange}
      required
    />
  </div>
</div>
<div className="form-row">
  <div className="form-group">
    <label htmlFor="gst_no">GST No*</label>
    <input
      type="text"
      id="gst_no"
      name="gst_no"
      value={formData.gst_no}
      onChange={handleChange}
      required
      readOnly // Make it read-only since it's auto-filled
      className="readonly-input"
      placeholder="GST will be auto-filled when customer is selected"
    />
  </div>
  <div className="form-group">
    <label htmlFor="po_file">PO File</label>
    <input
      type="file"
      id="po_file"
      name="po_file"
      onChange={handleChange}
      className="file-input"
    />
  </div>
</div>
</div>

        <div className="form-section">
          <h3>Test Details</h3>
          <div className="test-table">
            <div className="test-header">
              <div>Test*</div>
              <div>Unit*</div>
              <div>Price Per Unit*</div>
              <div>Quantity*</div>
              <div>Amount</div>
              <div>Action</div>
            </div>

            {tests.map((test, index) => (
              <div className="test-row" key={index}>
                <div className="searchable-test-dropdown">
                  <input
                    type="text"
                    name="title"
                    placeholder="Search for test..."
                    value={searchTerms[index] || ''}
                    onChange={(e) => handleTestSearch(index, e)}
                    onFocus={() => handleSearchFocus(index)}
                    ref={el => searchInputRefs.current[index] = el}
                    required
                  />
                  {showDropdowns[index] && filteredTests[index] && (
                    <div
                      className="dropdown-menu test-dropdown"
                      ref={el => dropdownRefs.current[index] = el}
                    >
                      {filteredTests[index]?.length > 0 ? (
                        filteredTests[index].map((availableTest) => (
                          <div
                            key={availableTest._id}
                            className={`dropdown-item ${test.testId === availableTest._id ? 'selected' : ''}`}
                            onClick={() => handleTestSelect(index, availableTest)}
                          >
                            {availableTest.title} ({availableTest.unit}) - ₹{availableTest.pricePerUnit.toFixed(2)}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-no-results">No tests found</div>
                      )}
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="testId"
                    value={test.testId || ''}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="unit"
                    value={test.unit}
                    onChange={(e) => handleTestChange(index, e)}
                    readOnly
                    required
                    style={{ margin: '3px', width: '70%' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={test.pricePerUnit}
                    onChange={(e) => handleTestChange(index, e)}
                    readOnly
                    required
                    style={{ margin: '3px', width: '70%' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="quantity"
                    value={test.quantity}
                    onChange={(e) => handleTestChange(index, e)}
                    required
                    min="1"
                    style={{ margin: '3px', width: '60%' }}
                  />
                </div>
                <div className="amount" style={{ paddingRight: '20px', width: '70%', textAlign: "center" }}>
                  ₹{(test.pricePerUnit * test.quantity).toFixed(2)}
                </div>
                <div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeTest(index)}
                    disabled={tests.length === 1}

                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="add-test-btn" onClick={addTest}>
              Add Test
            </button>
          </div>

          <div className="summary">
            <div className="summary-row gst-input-row">
              <div>GST Percentage:</div>
              <div className="gst-input-container">
                <input
                  type="number"
                  id="gst_percent"
                  name="gst_percent"
                  value={formData.gst_percent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="gst-input"
                />
                <span className="gst-symbol">%</span>
              </div>
            </div>
            <div className="summary-row">
              <div>Subtotal:</div>
              <div>
                ₹{tests.reduce((sum, test) => sum + (test.pricePerUnit * test.quantity || 0), 0).toFixed(2)}
              </div>
            </div>
            <div className="summary-row">
              <div>GST ({formData.gst_percent}%):</div>
              <div>
                ₹{(tests.reduce((sum, test) => sum + (test.pricePerUnit * test.quantity || 0), 0) * (formData.gst_percent / 100)).toFixed(2)}
              </div>
            </div>
            <div className="summary-row total">
              <div>Total Amount:</div>
              <div>₹{formData.total_amount}</div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Faculty & Payment Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="faculty_incharge">Faculty In-charge*</label>
              <input
                type="text"
                id="faculty_incharge"
                name="faculty_incharge"
                value={formData.faculty_incharge}
                onChange={handleChange}
                required
              />
            </div>

          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepared_by">Prepared By*</label>
              <input
                type="text"
                id="prepared_by"
                name="prepared_by"
                value={formData.prepared_by}
                readOnly // Make the field unchangeable
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="paid"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleChange}
                />
                <label htmlFor="paid">Payment Received</label>
              </div>
            </div>
          </div>
          {formData.paid && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transaction_details">Transaction Details</label>
                <input
                  type="text"
                  id="transaction_details"
                  name="transaction_details"
                  value={formData.transaction_details}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="payment_mode">Payment Mode*</label>
                <select
                  id="payment_mode"
                  name="payment_mode"
                  value={formData.payment_mode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="UPI">UPI</option>
                  <option value="Not Paid">Not Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transaction_date">Transaction Date</label>
                <input
                  type="date"
                  id="transaction_date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

        </div>
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Creating...
              </>
            ) : (
              'Create Report'
            )}
          </button>
          <button type="button" className="reset-btn" onClick={() => window.location.reload()}>
            Reset Form
          </button>
        </div>
      </form>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading tests...</p>
        </div>
      )}
      {/* Customer Modal */}
{showCustomerModal && (
  <div className="modal-overlay">
    <div className="modal-content customer-modal">
      <div className="modal-header">
        <h3>Add New Customer</h3>
        <button 
          type="button" 
          className="modal-close-btn"
          onClick={() => setShowCustomerModal(false)}
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSaveCustomer} className="customer-form">
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="customer_name">Customer Name*</label>
            <input
              type="text"
              id="customer_name"
              name="name"
              value={customerFormData.name}
              onChange={handleCustomerFormChange}
              required
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customer_address">Address*</label>
            <textarea
              id="customer_address"
              name="address"
              value={customerFormData.address}
              onChange={handleCustomerFormChange}
              required
              rows="4"
              placeholder="Enter complete address"
            ></textarea>
          </div>
          
          <div className="form-group">
  <label htmlFor="customer_gst">GST Number*</label>
  <input
    type="text"
    id="customer_gst"
    name="gstno"
    value={customerFormData.gstno}
    onChange={handleCustomerFormChange}
    required
    placeholder="Enter GST number"
  />
</div>
          
          <div className="form-group">
            <label htmlFor="customer_department">Department</label>
            <input
              type="text"
              id="customer_department"
              name="department"
              value={customerFormData.department}
              readOnly
              className="readonly-input"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowCustomerModal(false)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
          >
            Save Customer
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default ReportUploadForm;
