import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { requestResetCode, verifyResetCode, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const res = await requestResetCode({ email: formData.email });
    if (res.success) {
      setStep(2);
    } else {
      setError(res.message || 'Failed to send reset code.');
    }
  };

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    const res = await verifyResetCode({ email: formData.email, code: formData.code });
    if (res.success) {
      setStep(3);
    } else {
      setError(res.message || 'Invalid verification code.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const res = await resetPassword({ email: formData.email, password: formData.password });
    if (res.success) {
      setSuccess('Password reset successfully. Redirecting to login...');
      setFormData({ email: '', code: '', password: '' });
      setTimeout(() => {
        navigate('/login');
      }, 2000)
    } else {
      setError(res.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="forgot-password-card">
      <h2>Forgot Password</h2>

      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Send Code</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCodeVerify}>
          <div>
            <label htmlFor="code">Verification Code:</label>
            <input
              type="text"
              name="code"
              id="code"
              placeholder="Enter the code sent to your email"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Verify Code</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordReset}>
          <div>
            <label htmlFor="password">New Password:</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
