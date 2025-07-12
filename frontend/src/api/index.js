import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://celebal-project-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export const swapAPI = {
  // Create a swap/point request
  create: async ({ itemId, type }) => {
    const response = await api.post('/swaps', { itemId, type });
    return response.data;
  },
  // Accept a request
  accept: async (id) => {
    const response = await api.put(`/swaps/${id}/accept`);
    return response.data;
  },
  // Reject a request
  reject: async (id) => {
    const response = await api.put(`/swaps/${id}/reject`);
    return response.data;
  },
  // Get my requests
  getMy: async () => {
    const response = await api.get('/swaps/my');
    return response.data;
  },
  // Get requests for my items
  getForMyItems: async () => {
    const response = await api.get('/swaps/for-my-items');
    return response.data;
  },
};

export default api; 