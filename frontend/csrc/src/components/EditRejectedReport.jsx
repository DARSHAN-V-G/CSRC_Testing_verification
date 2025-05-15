import React, { useState, useEffect, useRef } from 'react';
import { reportAPI, TestAPI } from '../api/API';
import './EditRejectedReport.css';

const EditRejectedReport = ({ report, onCancel, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_po_no: '',
    bill_to_be_sent_mail_address: '',
    client_po_recieved_date: '',
    gst_no: '',
    faculty_incharge: '',
    prepared_by: '',
    gst_percent: 18,
    total_amount: 0,
    paid: false,                  // Add this
    payment_mode: '',             // Add this
    transaction_details: '',      // Add this
    transaction_date: ''
  });

  const [tests, setTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For the search dropdown functionality
  const [searchTerms, setSearchTerms] = useState([]);
  const [showDropdowns, setShowDropdowns] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const searchInputRefs = useRef([]);
  const dropdownRefs = useRef([]);

  // Initialize form with report data
  useEffect(() => {
    if (report) {
      setFormData({
        client_name: report.client_name || '',
        client_po_no: report.client_po_no || '',
        bill_to_be_sent_mail_address: report.bill_to_be_sent_mail_address || '',
        client_po_recieved_date: report.client_po_recieved_date ? new Date(report.client_po_recieved_date).toISOString().split('T')[0] : '',
        gst_no: report.gst_no || '',
        faculty_incharge: report.faculty_incharge || '',
        payment_mode: report.payment_mode || '',
        prepared_by: report.prepared_by || '',
        gst_percent: report.gst_percent || 18,
        total_amount: parseFloat(String(report.total_amount)) || 0,
        paid: report.paid || false,
        transaction_details: report.transaction_details || '',
        transaction_date: report.transaction_date ? new Date(report.transaction_date).toISOString().split('T')[0] : ''
      });
      const fetchUsername = async () => {
        try {
          const response = await reportAPI.getUsername();
          const username = response.data.username;

          setFormData(prev => ({
            ...prev,
            prepared_by: username // Set the fetched username
          }));
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };

      // Call the async function
      fetchUsername();
      if (report.test && report.test.length > 0) {
        const initialTests = report.test.map(test => ({
          title: test.title || '',
          unit: test.unit || '',
          pricePerUnit: test.pricePerUnit || 0,
          quantity: test.quantity || 0,
          testId: test.testId || ''
        }));

        setTests(initialTests);
        // Initialize search terms for each test
        setSearchTerms(initialTests.map(test => test.title || ''));
        setShowDropdowns(Array(initialTests.length).fill(false));
      }

      // Fetch available tests
      fetchAvailableTests();
    }
  }, [report]);

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
      const response = await TestAPI.fetchByDepartment();
      setAvailableTests(response.data.tests);
    } catch (err) {
      setError('Failed to load available tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
        [name]: type === 'checkbox' ? checked : value
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
      quantity: updatedTests[index].quantity || 1
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
    setTests([...tests, {
      title: '',
      unit: '',
      pricePerUnit: 0,
      quantity: 0,
      testId: ''
    }]);

    setSearchTerms([...searchTerms, '']);
    setShowDropdowns([...showDropdowns, false]);
    setFilteredTests([...filteredTests, availableTests]);
  };

  const removeTest = (index) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    setTests(updatedTests);

    const newSearchTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newSearchTerms);

    const newShowDropdowns = showDropdowns.filter((_, i) => i !== index);
    setShowDropdowns(newShowDropdowns);

    const newFilteredTests = filteredTests.filter((_, i) => i !== index);
    setFilteredTests(newFilteredTests);

    calculateTotalAmount(updatedTests, formData.gst_percent);
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
    setError('');

    try {
      // Prepare the data
      const reportData = {
        ...formData,
        test: tests.map(({ testId, ...rest }) => rest) // Remove testId before sending
      };

      // Update the rejected report
      await reportAPI.updateRejected(report._id, reportData);

      // Notify parent component
      onUpdateSuccess();
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Failed to update report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-rejected-report">
      <div className="edit-header">
        <h2>Edit Rejected Report</h2>
        <div className="rejection-info">
          <p><strong>Rejected By:</strong> {report.rejected_by}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Report Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Reference No:</label>
              <div className="read-only-field">{report.ref_no}</div>
            </div>
            <div className="form-group">
              <label>Department:</label>
              <div className="read-only-field">{report.department}</div>
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
              <label htmlFor="bill_to_be_sent_mail_address">Address*</label>
              <input
                type="text"
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

          {/* Show payment details only if payment received is checked */}
          {formData.paid && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payment_mode">Payment Mode*</label>
                <select
                  id="payment_mode"
                  name="payment_mode"
                  value={formData.payment_mode}
                  onChange={handleChange}
                  required={formData.paid}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
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
                  required={formData.paid}
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
            {isSubmitting ? 'Updating...' : 'Update & Resubmit'}
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

export default EditRejectedReport;
