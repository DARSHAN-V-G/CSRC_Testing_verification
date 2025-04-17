import React, { useState } from 'react';
import { reportAPI } from '../api/API';
import './ChangeUsernamePage.css';

const ChangeUsernamePage = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangeUsername = async () => {
    try {
      const response = await reportAPI.updateUsername({ username });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
      setMessage('');
    }
  };

  return (
    <div className="change-username-container">
      <h2>Change Username</h2>
      <input
        type="text"
        placeholder="Enter new username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleChangeUsername}>Update Username</button>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ChangeUsernamePage;