// src/store/authStore.js
// Zustand store for authentication state management

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosClient from '@/lib/axiosClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          localStorage.setItem('sw_user', JSON.stringify(user));
        }
      },

      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('sw_token', token);
        } else {
          localStorage.removeItem('sw_token');
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axiosClient.post('/auth/login', credentials);

          const { token, user } = response.data;

          // Save token
          get().setToken(token);
          
          // Save user
          get().setUser(user);

          set({ 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });

          if (process.env.NODE_ENV !== 'production') {
            console.log('[AUTH STORE] Login successful:', { userId: user.id, email: user.email });
          }

          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message || 'Login failed';
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false 
          });

          if (process.env.NODE_ENV !== 'production') {
            console.error('[AUTH STORE] Login failed:', errorMessage);
          }

          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: async () => {
        try {
          // Call logout API endpoint
          await axiosClient.post('/auth/logout').catch(() => {
            // Ignore errors - we're logging out anyway
          });
        } catch (error) {
          console.error('[AUTH STORE] Logout API error:', error);
        }

        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        localStorage.removeItem('sw_token');
        localStorage.removeItem('sw_user');
        localStorage.removeItem('sw_remember_me');
        localStorage.removeItem('sw_username');

        // Clear cookies
        document.cookie = 'sw_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sw_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        if (process.env.NODE_ENV !== 'production') {
          console.log('[AUTH STORE] Logged out successfully');
        }

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      // Check auth - Verify token is still valid
      checkAuth: async () => {
        const token = get().token;

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          const response = await axiosClient.get('/auth/check');

          if (response.data.authenticated) {
            // If API returns user, use it; otherwise keep existing user from localStorage
            if (response.data.user) {
              get().setUser(response.data.user);
            } else {
              // User is in localStorage, ensure it's loaded
              const userJson = localStorage.getItem('sw_user');
              if (userJson) {
                try {
                  const user = JSON.parse(userJson);
                  get().setUser(user);
                } catch (e) {
                  console.error('[AUTH STORE] Error parsing stored user:', e);
                }
              }
            }
            set({ isAuthenticated: true });
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('[AUTH STORE] Check auth failed:', error);
          // Don't logout on network errors - user might be offline
          // Only logout on actual auth failures (401)
          if (error.response?.status === 401) {
            get().logout();
            return false;
          }
          // For network errors, keep current auth state
          return get().isAuthenticated;
        }
      },

      // Refresh user profile
      refreshUser: async () => {
        try {
          const response = await axiosClient.get('/auth/check');

          if (response.data.user) {
            get().setUser(response.data.user);
            return response.data.user;
          }
        } catch (error) {
          console.error('[AUTH STORE] Refresh user failed:', error);
        }
        return null;
      },

      // Initialize from localStorage
      initFromStorage: () => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('sw_token');
        const userJson = localStorage.getItem('sw_user');

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            set({
              token,
              user,
              isAuthenticated: true,
            });
            if (process.env.NODE_ENV !== 'production') {
              console.log('[AUTH STORE] Initialized from storage:', { userId: user.id });
            }
          } catch (error) {
            console.error('[AUTH STORE] Error parsing stored user:', error);
            localStorage.removeItem('sw_token');
            localStorage.removeItem('sw_user');
          }
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for logout events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;
