import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportUploadForm.css';
import { useAuth } from '../context/authContext';
import { reportAPI } from '../api/API';
const ReportUploadForm = () => {
  const {user} = useAuth();
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
    bill_no: ''
  });
  useEffect(() => {
    const generatedRefNo = generateRefNo();
    const dept = findDepartment();
    setFormData(prev => ({
      ...prev,
      ref_no: generatedRefNo,
      department: dept
    }));
  }, []);
  const [tests, setTests] = useState([{
    title: '',
    unit: '',
    pricePerUnit: 0,
    quantity: 0
  }]);



  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked :
        type === 'file' ? files[0] :
          name === 'client_po_recieved_date' ? value :
            value
    });
  };

  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTests = [...tests];
    updatedTests[index] = {
      ...updatedTests[index],
      [name]: name === 'pricePerUnit' || name === 'quantity' ? Number(value) : value
    };
    setTests(updatedTests);
    calculateTotalAmount(updatedTests);
  };

  const addTest = () => {
    setTests([...tests, {
      title: '',
      unit: '',
      pricePerUnit: 0,
      quantity: 0
    }]);
  };

  const removeTest = (index) => {
    const updatedTests = tests.filter((_, i) => i !== index);
    setTests(updatedTests);
    calculateTotalAmount(updatedTests);
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

  const calculateTotalAmount = (testList) => {
    const subtotal = testList.reduce((sum, test) => {
      return sum + (test.pricePerUnit * test.quantity || 0);
    }, 0);

    const gstAmount = subtotal * 0.18;
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
        if (key !== 'po_file') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append file
      if (formData.po_file) {
        formDataToSend.append('po_file', formData.po_file);
      }

      // Append tests as JSON string
      formDataToSend.append('test', JSON.stringify(tests));
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
        bill_no: ''
      });
      setTests([{
        title: '',
        unit: '',
        pricePerUnit: 0,
        quantity: 0
      }]);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to create report'}`);
    }
  };

  return (
    <div className="report-form-container">
      <h2>CSRC Testing Report Form</h2>
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
              {/* Hidden input to ensure the ref_no is submitted with the form */}
              <input type="hidden" name="ref_no" value={formData.department} />
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
              <div>Title*</div>
              <div>Unit*</div>
              <div>Price Per Unit*</div>
              <div>Quantity*</div>
              <div>Amount</div>
              <div>Action</div>
            </div>

            {tests.map((test, index) => (
              <div className="test-row" key={index}>
                <div>
                  <input
                    type="text"
                    name="title"
                    value={test.title}
                    onChange={(e) => handleTestChange(index, e)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="unit"
                    value={test.unit}
                    onChange={(e) => handleTestChange(index, e)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={test.pricePerUnit}
                    onChange={(e) => handleTestChange(index, e)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="quantity"
                    value={test.quantity}
                    onChange={(e) => handleTestChange(index, e)}
                    required
                  />
                </div>
                <div className="amount">
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
            <div className="summary-row">
              <div>Subtotal:</div>
              <div>
                ₹{tests.reduce((sum, test) => sum + (test.pricePerUnit * test.quantity || 0), 0).toFixed(2)}
              </div>
            </div>
            <div className="summary-row">
              <div>GST (18%):</div>
              <div>
                ₹{(tests.reduce((sum, test) => sum + (test.pricePerUnit * test.quantity || 0), 0) * 0.18).toFixed(2)}
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
    </div>
  );
};

export default ReportUploadForm;
