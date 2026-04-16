import { create } from 'zustand';
import { authAPI } from '../services/api';

const parse = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

const useAuthStore = create((set, get) => ({
  user: parse('af_user'),
  token: localStorage.getItem('af_token'),
  loading: false,

  login: async (creds) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login(creds);
      localStorage.setItem('af_token', data.token);
      localStorage.setItem('af_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (e) {
      set({ loading: false });
      throw new Error(e.response?.data?.message || 'Login failed');
    }
  },

  register: async (creds) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register(creds);
      localStorage.setItem('af_token', data.token);
      localStorage.setItem('af_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (e) {
      set({ loading: false });
      throw new Error(e.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
    set({ user: null, token: null });
  },

  updateUser: (u) => {
    const updated = { ...get().user, ...u };
    localStorage.setItem('af_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));

export default useAuthStore;
