import { create } from 'zustand';
import { loginApi, registerApi, verifyEmailApi } from '../api/auth.api';
import { updateUserProfileApi } from '../api/user.api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user_info')) || null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginApi(email, password);
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await registerApi(username, email, password);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const data = await verifyEmailApi(email, code);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      await updateUserProfileApi(profileData);
      set((state) => {
        const updatedUser = { ...state.user, ...profileData };
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
        return { user: updatedUser, isLoading: false };
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;