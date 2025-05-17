import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { reportAPI } from '../../api/API';
import './LabsForms.css';

const availableDepartments = [
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

const AddLabForm = ({ onAddSuccess, existingDepartments }) => {
  const [formData, setFormData] = useState({
    department: '',
    labs: [''] // Start with one empty lab input
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Available departments (excluding existing ones)
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLabChange = (index, value) => {
    const updatedLabs = [...formData.labs];
    updatedLabs[index] = value;
    setFormData({
      ...formData,
      labs: updatedLabs
    });
  };

  const addLabInput = () => {
    setFormData({
      ...formData,
      labs: [...formData.labs, '']
    });
  };

  const removeLabInput = (index) => {
    const updatedLabs = formData.labs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      labs: updatedLabs
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate fields
    if (!formData.department) {
      setError('Please select a department');
      return;
    }
    
    // Filter out empty lab inputs
    const filteredLabs = formData.labs.filter(lab => lab.trim() !== '');
    
    if (filteredLabs.length === 0) {
      setError('Please add at least one lab');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await reportAPI.addLabs({
        department: formData.department,
        labs: filteredLabs
      });
      
      if (onAddSuccess) {
        onAddSuccess(response.data.data);
      }
      
      // Reset form
      setFormData({
        department: '',
        labs: ['']
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add labs');
      console.error('Error adding labs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="lab-form">
      {error && <Alert variant="danger" className="form-alert">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Department</Form.Label>
        <Form.Select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {availableDepartments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </Form.Select>
        {availableDepartments.length === 0 && (
          <Form.Text className="text-warning">
            All departments have been added. To modify labs, please use the edit function below.
          </Form.Text>
        )}
      </Form.Group>
      
      <Form.Label>Labs</Form.Label>
      {formData.labs.map((lab, index) => (
        <Row key={index} className="lab-input-row">
          <Col>
            <Form.Control
              type="text"
              value={lab}
              onChange={(e) => handleLabChange(index, e.target.value)}
              placeholder="Enter lab name"
              required
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="danger"
              className="remove-lab-btn"
              onClick={() => removeLabInput(index)}
              disabled={formData.labs.length <= 1}
            >
              Remove
            </Button>
          </Col>
        </Row>
      ))}
      
      <Button
        variant="secondary"
        className="add-lab-btn"
        type="button"
        onClick={addLabInput}
      >
        <i className="fas fa-plus"></i> Add Another Lab
      </Button>
      
      <Button 
        className="submit-btn"
        type="submit"
        disabled={loading || availableDepartments.length === 0}
      >
        {loading ? 'Adding...' : 'Save Labs'}
      </Button>
    </Form>
  );
};

export default AddLabForm;