import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.url.startsWith('/admin')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Registration API
export const validatePassbook = (passbookNo) => {
  return api.post('/registration/validate', { passbook_no: passbookNo });
};

export const registerMember = (passbookNo, deviceInfo) => {
  return api.post('/registration/register', { 
    passbook_no: passbookNo,
    device_info: deviceInfo 
  });
};

export const getRegistrationStatus = (passbookNo) => {
  return api.get(`/registration/status/${passbookNo}`);
};

// Admin API
export const uploadMembers = (formData) => {
  return api.post('/admin/upload-members', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getRegistrations = () => {
  return api.get('/admin/registrations');
};

export const getStats = () => {
  return api.get('/admin/stats');
};

export const exportRegistrations = () => {
  return api.get('/admin/export-registrations', {
    responseType: 'blob',
  });
};

export const getMembers = () => {
  return api.get('/admin/members');
};

export default api;
