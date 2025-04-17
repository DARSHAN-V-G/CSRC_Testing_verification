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
      const msg = error?.response?.data?.message || '401 Unauthorized';
      const innerMsg = error?.response?.data?.error?.message || 'No inner error message';
      console.error(msg);
      console.error(innerMsg);
    }

    return Promise.reject(error);
  }
);

export const userAPI = {
  login: (credentials) => API.post('/auth/user/login', credentials),
  signup: (credentials) => API.post('/auth/user/register', credentials),
  verify: (payload) => API.post('/auth/user/register/verify', payload),
  logout: () => API.post('/auth/user/logout'),
  status: () => API.get('/auth/user/status'),
  getnewaccesstoken: () => API.post('/auth/user/getnewaccesstoken'),
  requestResetCode: (payload) => API.post('/auth/user/generatecode', payload),
  verifyResetCode: (payload) => API.post('/auth/user/verifycode', payload),
  resetPassword: (payload) => API.post('/auth/user/resetpassword', payload)
}

export const reportAPI = {
  create: (formData) => API.post('/report/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // Add other report-related API methods here
  getById: (id) => API.get(`/report/${id}`), // You'll need to add this endpoint in your backend
  fetch: (verified) => API.get(`/report/fetch/${verified}`),
  verify: (ref_no) => API.post('/report/verify', { ref_no }),
  reject: (ref_no) => API.post('/report/reject', { ref_no }),
  verifyPayment: (ref_no) => API.post('/report/verify_payment', { ref_no }),
  rejectPayment: (ref_no) => API.post('/report/reject_payment', { ref_no }),
  generate: (ref_no) => API.get(`/report/generate/${ref_no}`, { responseType: 'blob' }),
  fetchRejected: () => API.get('/report/fetch/false'),
  updateRejected: (id, data) => API.put(`/report/update-rejected/${id}`, data),
  getUsername: () => API.get('/report/getusername'),
  updateUsername: (username) => API.post('/report/updateusername', { username }),
  addReceiptNo: (payload) => API.post('/report/add_receipt_no', payload),
};

export const TestAPI = {
  fetchAll: () => API.get('/test/all'),
  addTest: (testData) => API.post('/test/add', testData),
  updateTest: (id, testData) => API.put(`/test/update/${id}`, testData),
  deleteTest: (id) => API.delete(`/test/delete/${id}`)
}

export default API;
