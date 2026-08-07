import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        const { data } = await api.post('/auth/login', credentials);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        return data;
      },

      register: async (userData) => {
        set({ isLoading: true });
        const { data } = await api.post('/auth/register', userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        return data;
      },

      googleLogin: async (credential) => {
        set({ isLoading: true });
        const { data } = await api.post('/auth/google', { credential });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        return data;
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),

      initAuth: async () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          try {
            const { data } = await api.get('/auth/me');
            set({ user: data.user, isAuthenticated: true });
          } catch (err) {
            console.error('Failed to fetch user on init:', err);
          }
        }
      },
    }),
    {
      name: 'invoice-auth',
      partialize: (state) => {
        const userToSave = state.user ? { ...state.user, logo: undefined } : null;
        return { token: state.token, user: userToSave, isAuthenticated: state.isAuthenticated };
      },
    }
  )
);

export default useAuthStore;
