import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://invoiceflow-pue2.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 100000, // 100 seconds to allow Render free tier to wake up
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
