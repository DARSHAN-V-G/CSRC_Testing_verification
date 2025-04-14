import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { useAuth } from '../context/authContext';

const Register = () => {
  const { signup, verifyAndLogin, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: ''
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 Load email from localStorage if verification was pending
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setFormData((prev) => ({ ...prev, email: pendingEmail }));
      setStep(2);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signup({
      email: formData.email,
      password: formData.password
    });

    setLoading(false);
    if (res.success) {
      // 👇 Save to localStorage for persistence
      localStorage.setItem('pendingVerificationEmail', formData.email);
      setStep(2);
    } else {
      setError(res.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await verifyAndLogin({
      email: formData.email,
      code: formData.code
    });

    setLoading(false);
    if (res.success) {
      // 👇 Clear verification state
      localStorage.removeItem('pendingVerificationEmail');
      navigate(getRedirectPath());
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>PSG College of Technology</h2>
        <h3>Register for CSRC Testing Portal</h3>

        <form onSubmit={step === 1 ? handleRegister : handleVerify}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={step === 2}
            />
          </div>

          {step === 1 && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="form-group">
              <label>Enter the verification code sent to your email</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="register-button" disabled={loading}>
            {loading
              ? step === 1
                ? 'Registering...'
                : 'Verifying...'
              : step === 1
                ? 'Register'
                : 'Verify'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

