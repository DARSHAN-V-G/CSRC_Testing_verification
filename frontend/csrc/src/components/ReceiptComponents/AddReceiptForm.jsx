import React, { useState } from 'react';
import { reportAPI } from '../../api/API';
import './AddReceiptForm.css';

const AddReceiptForm = ({ report, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ref_no: report.ref_no,
    receipt_no: '',
    receipt_date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.receipt_no.trim()) {
      setError('Receipt number is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await reportAPI.addReceiptNo({
        ref_no: formData.ref_no,
        receipt_no: formData.receipt_no,
        receipt_date: formData.receipt_date
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error adding receipt number:', err);
      setError(err.response?.data?.message || 'Failed to add receipt number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-receipt-form-container">
      <div className="add-receipt-form">
        <h2>Add Receipt Number</h2>
        
        <div className="report-details">
          <div className="detail-row">
            <span className="detail-label">Reference No:</span>
            <span className="detail-value">{report.ref_no}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Client:</span>
            <span className="detail-value">{report.client_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value">
              ₹{typeof report.total_amount === 'object' && report.total_amount.$numberDecimal 
                ? report.total_amount.$numberDecimal 
                : (typeof report.total_amount === 'string' 
                  ? report.total_amount 
                  : report.total_amount?.toFixed(2) || '0.00')}
            </span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="receipt_no">Receipt Number*</label>
            <input
              type="text"
              id="receipt_no"
              name="receipt_no"
              value={formData.receipt_no}
              onChange={handleChange}
              placeholder="Enter receipt number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="receipt_date">Receipt Date*</label>
            <input
              type="date"
              id="receipt_date"
              name="receipt_date"
              value={formData.receipt_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Receipt Number'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReceiptForm;