import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/analysis/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const getAnalysisHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/analysis/history', {
    params: { page, limit }
  });
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const deleteAnalysis = async (id) => {
  const response = await api.delete(`/analysis/${id}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/analysis/stats/summary');
  return response.data;
};

export default api;
