// src/hooks/useAuth.js
// Custom hook for authentication with redirect logic

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

/**
 * Hook for protected routes - Redirects to login if not authenticated
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 */
export function useAuth(requireAuth = true) {
  const { user, isAuthenticated, isLoading, checkAuth, initFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialize from storage first
    initFromStorage();

    if (!requireAuth) return;

    // Check if authenticated
    if (!isAuthenticated) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else {
      // Verify token is still valid in background
      checkAuth();
    }
  }, [isAuthenticated, requireAuth, checkAuth, initFromStorage]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}

/**
 * Hook to prevent authenticated users from accessing login/register pages
 */
export function useRedirectIfAuthenticated(redirectTo = '/dashboard') {
  const { isAuthenticated, initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();

    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, redirectTo, initFromStorage]);

  return { isAuthenticated };
}

export default useAuth;
