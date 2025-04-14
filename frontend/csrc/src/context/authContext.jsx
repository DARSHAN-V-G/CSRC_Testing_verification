import React, { createContext, useState, useEffect, useContext } from 'react';
import { userAPI } from '../api/API';

// Create the context
const AuthContext = createContext(null);

// Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Create the provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Inside Authcontext");
        
        // Get stored user info from localStorage
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');
        
        if (email && role) {
          try {
            // Try to validate with server
            const statusResponse = await userAPI.status();
            setIsAuthenticated(true);
            setUser({ email, role });
          } catch (error) {
            if (error.response && error.response.status === 401) {
              try {
                // Token expired, try to refresh
                const refreshResponse = await userAPI.getnewaccesstoken();
                setIsAuthenticated(true);
                setUser({ email, role });
              } catch (refreshError) {
                console.error('Token refresh Failed:', refreshError);
                setIsAuthenticated(false);
                setUser(null);
              }
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
      localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
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
      console.log(email,  role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
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
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const getRedirectPath = () => {
    console.log(user);
    if (!user || !user.role) return '/login';
    return '/dashboard';
    switch (user.role.toLowerCase()) {
      case 'staff':
        return '/dashboard';
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
}