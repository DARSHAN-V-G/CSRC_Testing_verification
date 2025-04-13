import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { userAPI } from '../api/API';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const email = Cookies.get('userEmail');
        const role = Cookies.get('userRole');

        if (email && role) {
          setIsAuthenticated(true);
          setUser({ email, role });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('userEmail');
        Cookies.remove('userRole');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (credentials) => {
    try {
      await userAPI.signup(credentials);
      return { success: true, message: 'Verification code sent to email' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const verifyAndLogin = async ({ email, code }) => {
    try {
      const response = await userAPI.verify({ email, code });
      const { role } = response.data;

      Cookies.set('userEmail', email, { expires: 7 });
      Cookies.set('userRole', role, { expires: 7 });

      setIsAuthenticated(true);
      setUser({ email, role });

      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  };
  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials);
      const { email, role } = response.data.user;
      console.log(email, role)
      Cookies.set('userEmail', email, { expires: 7 });
      Cookies.set('userRole', role, { expires: 7 });

      setIsAuthenticated(true);
      setUser({ email, role });

      return { success: true, role };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await userAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      Cookies.remove('userEmail');
      Cookies.remove('userRole');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const getRedirectPath = () => {
    if (!user || !user.role) return '/login';

    switch (user.role.toLowerCase()) {
      case 'staff':
        return '/createReport';
      case 'faculty':
        return '/checkPayment';
      default:
        return '/dashboard';
    }
  };

  // --- Forgot Password Functions ---
  const requestResetCode = async ({ email }) => {
    try {
      const res = await userAPI.requestResetCode({ email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset code'
      };
    }
  };

  const verifyResetCode = async ({ email, code }) => {
    try {
      const res = await userAPI.verifyResetCode({ email, code });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid reset code'
      };
    }
  };

  const resetPassword = async ({ email, password }) => {
    try {
      const res = await userAPI.resetPassword({ email, password });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    signup,
    verifyAndLogin,
    login,
    logout,
    getRedirectPath,
    requestResetCode,
    verifyResetCode,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
