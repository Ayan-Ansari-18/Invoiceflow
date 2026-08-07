import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach token from storage if not already set
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('invoice-auth');
  if (stored && !config.headers['Authorization']) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers['Authorization'] = `Bearer ${state.token}`;
      }
    } catch (_) {}
  }
  return config;
});

// Response interceptor — handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('invoice-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
