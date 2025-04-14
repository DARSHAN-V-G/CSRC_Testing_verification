import React, { useState } from 'react';
import './TestForms.css';

const DeleteTest = ({ test, onCancel, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  const handleDelete = async () => {
    if (!test || !test._id) {
      setError('No test selected for deletion');
      return;
    }
    
    try {
      setIsDeleting(true);
      setError('');
      
      // Make API call to delete test
      const response = await fetch(`http://localhost:4000/test/delete/${test._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete test');
      }
      
      // Notify parent component
      if (onDeleteSuccess) {
        onDeleteSuccess(test._id);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to delete test');
      console.error('Error deleting test:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-confirmation">
      <h3>Confirm Deletion</h3>
      
      {error && <div className="form-error">{error}</div>}
      
      <div className="confirmation-message">
        <p>Are you sure you want to delete the following test?</p>
        <div className="test-info">
          <p><strong>Title:</strong> {test?.title}</p>
          <p><strong>Unit:</strong> {test?.unit}</p>
          <p><strong>Price Per Unit:</strong> ₹{test?.pricePerUnit?.toFixed(2)}</p>
          <p><strong>Department:</strong> {test?.department}</p>
        </div>
        <p className="warning">This action cannot be undone!</p>
      </div>
      
      <div className="confirmation-actions">
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Test'}
        </button>
        <button
          className="cancel-btn"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteTest;