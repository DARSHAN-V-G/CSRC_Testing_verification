import React, { useState, useEffect, useRef } from 'react';
import './ReportUploadForm.css';
import { useAuth } from '../context/authContext';
import { reportAPI, TestAPI } from '../api/API';

const ReportUploadForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ref_no: '',
    department: '',
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
    receipt_no: '',
    bill_no: '',
    gst_percent: 18 // Default GST percentage
  });
  
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
  
  // For search dropdown
  const [searchTerms, setSearchTerms] = useState(['']);
  const [showDropdowns, setShowDropdowns] = useState([false]);
  const [filteredTests, setFilteredTests] = useState([[]]);
  const searchInputRefs = useRef([]);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const generatedRefNo = generateRefNo();
    const dept = findDepartment();
    setFormData(prev => ({
      ...prev,
      ref_no: generatedRefNo,
      department: dept
    }));
    
    // Fetch available tests
    fetchAvailableTests();
  }, []);

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

  const fetchAvailableTests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await TestAPI.fetchAll();
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

  const generateRefNo = () => {
    const userEmail = user?.email;
    if (!userEmail) return '';

    const domainPart = userEmail.split('.')[1].split('@')[0].toUpperCase();

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milli = String(now.getMilliseconds()).padStart(2, '0');
    const timeString = `${hours}${minutes}${seconds}${milli}`;
    return `REF_${domainPart}_${dateString}${timeString}`;
  };

  const findDepartment = () => {
    let email = user?.email;
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
      'ac': "Test department",
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

      // Reset form
      setFormData({
        ref_no: generateRefNo(),
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
        receipt_no: '',
        bill_no: '',
        gst_percent: 18
      });
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
    }
  };

  return (
    <div className="report-form-container">
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
        </div>

        <div className="form-section">
          <h3>Client Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="client_name">Client Name*</label>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
              />
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bill_to_be_sent_mail_address">Billing Email Address*</label>
              <input
                type="email"
                id="bill_to_be_sent_mail_address"
                name="bill_to_be_sent_mail_address"
                value={formData.bill_to_be_sent_mail_address}
                onChange={handleChange}
                required
              />
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
                    style={{ margin: '3px' ,width:'70%'}}
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
                    style={{ margin: '3px' ,width:'70%'}}
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
                    style={{ margin: '3px' ,width:'60%'}}
                  />
                </div>
                <div className="amount" style={{ paddingRight: '20px' ,width:'70%',textAlign:"center"}}>
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
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepared_by">Prepared By*</label>
              <input
                type="text"
                id="prepared_by"
                name="prepared_by"
                value={formData.prepared_by}
                onChange={handleChange}
                required
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="receipt_no">Receipt No</label>
              <input
                type="text"
                id="receipt_no"
                name="receipt_no"
                value={formData.receipt_no}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bill_no">Bill No</label>
              <input
                type="text"
                id="bill_no"
                name="bill_no"
                value={formData.bill_no}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">Create Report</button>
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
    </div>
  );
};

export default ReportUploadForm;