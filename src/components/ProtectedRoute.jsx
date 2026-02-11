// src/components/ProtectedRoute.jsx
// Component wrapper for protected routes

'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import LoadingDots from '@/components/LoadingDots';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, checkAuth, initFromStorage } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Initialize from storage
      initFromStorage();
      
      // Check auth status
      const authenticated = await checkAuth();
      
      if (!authenticated) {
        // Redirect to login
        window.location.href = '/login';
      } else {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth, initFromStorage]);

  // Show loading state while checking
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingDots size="lg" className="mb-3" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return isAuthenticated ? children : null;
}
