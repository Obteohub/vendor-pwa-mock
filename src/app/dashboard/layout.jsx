/* -------------------------------------------------------------------------
File: app/dashboard/layout.jsx
Purpose: Persistent layout for dashboard with bottom navigation and auth protection
*/

"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Box, ShoppingCart, Settings, Loader2 } from 'lucide-react';
import ConnectionStatus from '@/components/ConnectionStatus';
import ResilienceDebugPanel from '@/components/ResilienceDebugPanel';
import NotificationCenter from '@/components/NotificationCenter';
import { initializeNetworkListeners } from '@/lib/apiClient';
import { isAuthenticated, redirectToLogin, getUserInfo } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Small delay to ensure cookies are set
    const checkAuth = () => {
      console.log('[DASHBOARD] Checking authentication...');
      
      // Check authentication
      if (!isAuthenticated()) {
        console.log('[DASHBOARD] Not authenticated, redirecting to login');
        if (!hasRedirected) {
          setHasRedirected(true);
          redirectToLogin();
        }
        return;
      }

      console.log('[DASHBOARD] Authenticated, loading user info');
      
      // Get user info
      const userInfo = getUserInfo();
      setUser(userInfo);
      setIsChecking(false);

      // Initialize network listeners for offline queue
      initializeNetworkListeners();
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('Service Worker registered'))
          .catch(error => console.error('Service Worker registration failed:', error));
      }
    };

    // Small delay to ensure cookies are fully set after login
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [hasRedirected]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 pb-28">
      <ConnectionStatus />
      <ResilienceDebugPanel />
      
      {/* Header with glass effect */}
      <header className="px-4 py-3 glass sticky top-0 z-20 border-b border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
              SW
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Shopwice Vendor</div>
              <div className="text-xs text-gray-600">
                {user?.display_name || user?.user_nicename || 'Vendor'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Link 
              href="/dashboard/settings"
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:shadow-sm"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto animate-fade-in">{children}</main>

      {/* Bottom nav with enhanced styling */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-3xl rounded-2xl shadow-2xl bg-white/90 backdrop-blur-xl p-2 flex items-center justify-between border border-gray-200/50">
        <NavItem href="/dashboard" icon={<Home size={18} />} label="Home" />
        <NavItem href="/dashboard/products" icon={<Box size={18} />} label="Products" />
        <Link 
          href="/dashboard/products/add" 
          className="-mt-6 bg-orange-500 hover:bg-orange-600 rounded-full p-4 shadow-2xl text-white flex items-center justify-center hover:shadow-orange-500/50 hover:scale-105 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
          </svg>
        </Link>
        <NavItem href="/dashboard/orders" icon={<ShoppingCart size={18} />} label="Orders" />
        <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }) {
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center text-xs text-slate-600 hover:text-primary-600 transition-colors duration-200 group"
    >
      <div className="p-2 group-hover:bg-primary-50 rounded-xl transition-all duration-200">
        {icon}
      </div>
      <div className="mt-1 font-medium">{label}</div>
    </Link>
  );
}
