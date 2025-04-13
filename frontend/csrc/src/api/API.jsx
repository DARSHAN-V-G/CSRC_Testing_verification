import axios from 'axios';
import { Navigate } from 'react-router-dom';

const API = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 30000,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Redirecting to login...");

    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  login: (credentials) => API.post('/auth/user/login', credentials),
  signup: (credentials) => API.post('/auth/user/register', credentials),
  verify: (payload) => API.post('/auth/user/register/verify', payload),
  logout: () => API.post('/auth/user/logout')
}


