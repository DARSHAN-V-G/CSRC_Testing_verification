import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import AddLabForm from '../components/Labs/AddLabForm';
import LabsList from '../components/Labs/LabsList';
import { reportAPI } from '../api/API';
import './LabsPage.css';

const LabsPage = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.fetchAllLabs();
      setLabs(response.data.lab || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch labs. Please try again.');
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = (newLab) => {
    fetchLabs(); // Refresh the entire list to ensure accuracy
    setSuccess('Lab added successfully!');
    setShowAddForm(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteLab = async (department, lab) => {
    if (window.confirm(`Are you sure you want to delete "${lab}" from "${department}"?`)) {
      try {
        await reportAPI.deleteLab({ department, lab });
        // Refresh labs list
        fetchLabs();
        setSuccess(`Successfully deleted "${lab}" from "${department}"`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete lab');
        console.error('Error deleting lab:', err);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  return (
    <Container className="labs-page-container">
      <h1>Labs Management</h1>
      
      {error && <Alert variant="danger" className="page-error">{error}</Alert>}
      {success && <Alert variant="success" className="page-success">{success}</Alert>}
      
      <div className="labs-page-actions">
        <Button 
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add New Lab'}
        </Button>
      </div>
      
      {showAddForm && (
        <Card className="add-form-card">
          <Card.Body>
            <AddLabForm 
              onAddSuccess={handleAddSuccess} 
              existingDepartments={labs.map(lab => lab.department)}
            />
          </Card.Body>
        </Card>
      )}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading labs...</p>
        </div>
      ) : (
        <LabsList 
          labs={labs} 
          onDeleteLab={handleDeleteLab}
        />
      )}
    </Container>
  );
};

export default LabsPage;