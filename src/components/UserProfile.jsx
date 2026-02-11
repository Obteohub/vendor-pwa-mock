// src/components/UserProfile.jsx
// Example component showing cached user profile usage

'use client';

import useAuthStore from '@/store/authStore';
import { useState } from 'react';
import { Loader2, RefreshCw, User } from 'lucide-react';

export default function UserProfile() {
  const { user, isAuthenticated, refreshUser, logout } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh profile"
        >
          <RefreshCw 
            className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">User ID:</span>
          <span className="font-medium">{user.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Username:</span>
          <span className="font-medium">{user.user_nicename}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Role:</span>
          <span className="font-medium capitalize">{user.role}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 mb-2">
          ℹ️ Profile loaded from cache - no API call needed!
        </p>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
