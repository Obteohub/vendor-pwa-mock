/* -------------------------------------------------------------------------
File: app/dashboard/settings/page.jsx
Purpose: User settings and account management
*/

"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserInfo, logout } from '@/lib/auth';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.display_name?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Display Name</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{user.display_name}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Username</span>
            </div>
            <div className="text-gray-900">{user.user_nicename}</div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Email</span>
            </div>
            <div className="text-gray-900">{user.email}</div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Role</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              {user.role || 'Vendor'}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">User ID</span>
            </div>
            <div className="text-gray-600 text-sm">#{user.id}</div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">App Information</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">App Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Platform</span>
            <span className="text-sm font-medium text-gray-900">Shopwice Vendor</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Endpoint</span>
            <span className="text-sm font-medium text-gray-900">shopwice.com</span>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Account Management</p>
            <p className="text-blue-800">
              To update your email, password, or other account details, please visit your main Shopwice account settings 
              at <span className="font-medium">shopwice.com</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Session</h2>
        </div>
        <div className="p-6">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-medium mb-1">Are you sure you want to logout?</p>
                <p className="text-sm text-red-800">You will need to login again to access the dashboard.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Data & Cache</h2>
        </div>
        <div className="p-6">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Clear Cache & Reload
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This will clear all cached data and reload the app. Useful if you're experiencing issues.
          </p>
        </div>
      </div>
    </div>
  );
}
