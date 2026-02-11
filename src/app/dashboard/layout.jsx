/* -------------------------------------------------------------------------
File: app/dashboard/layout.jsx
Purpose: Persistent layout for dashboard with bottom navigation and auth protection
*/

"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Box, ShoppingCart, Settings } from 'lucide-react';
import ConnectionStatus from '@/components/ConnectionStatus';
import ResilienceDebugPanel from '@/components/ResilienceDebugPanel';
import NotificationCenter from '@/components/NotificationCenter';
import LoadingDots from '@/components/LoadingDots';
import { initializeNetworkListeners } from '@/lib/apiClient';
import { checkAuth, logout } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('[DASHBOARD] Checking authentication...');
      
      // Check authentication via API (more robust than client-side cookie check)
      const result = await checkAuth();

      if (!result.authenticated) {
        console.log('[DASHBOARD] Not authenticated, redirecting to login');
        if (!hasRedirected) {
          setHasRedirected(true);
          // Use logout() to ensure cookies are cleared (prevents redirect loop if token is invalid but present)
          logout();
        }
        return;
      }

      console.log('[DASHBOARD] Authenticated, loading user info');
      
      // Use user info from API
      setUser(result.user);
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

    verifyAuth();
  }, [hasRedirected]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingDots size="lg" className="mb-3" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation configuration
  const navItems = [
    { href: "/dashboard", icon: <Home size={18} />, label: "Home" },
    { href: "/dashboard/products", icon: <Box size={18} />, label: "Products" },
    { href: "/dashboard/orders", icon: <ShoppingCart size={18} />, label: "Orders" },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 pb-20 md:pb-8">
      <ConnectionStatus />
      <ResilienceDebugPanel />
      
      {/* Header with glass effect */}
      <header className="px-4 py-3 glass sticky top-0 z-20 border-b border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              SW
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Shopwice Vendor</div>
              <div className="text-xs text-gray-600">
                {user?.display_name || user?.user_nicename || 'Vendor'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Link 
              href="/dashboard/products/add" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
              </svg>
              Add Product
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            {/* Mobile Settings Link (only if needed, but we have it in bottom nav too) */}
            <Link 
              href="/dashboard/settings"
              className="md:hidden p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:shadow-sm"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto animate-fade-in">{children}</main>

      {/* Bottom nav - Mobile Only, Full Width */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl pb-safe flex items-center justify-around border-t border-gray-200/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <NavItem href="/dashboard" icon={<Home size={20} />} label="Home" />
        <NavItem href="/dashboard/products" icon={<Box size={20} />} label="Products" />
        
        {/* Floating Add Button Wrapper */}
        <div className="relative -top-5">
          <Link 
            href="/dashboard/products/add" 
            className="bg-indigo-600 hover:bg-indigo-700 rounded-full p-4 shadow-xl text-white flex items-center justify-center transform transition-transform active:scale-95 border-4 border-slate-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
            </svg>
          </Link>
        </div>

        <NavItem href="/dashboard/orders" icon={<ShoppingCart size={20} />} label="Orders" />
        <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }) {
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center text-[10px] text-slate-600 hover:text-indigo-600 transition-colors duration-200 group w-16 py-2"
    >
      <div className="p-1.5 group-hover:bg-indigo-50 rounded-xl transition-all duration-200 mb-0.5">
        {icon}
      </div>
      <div className="font-medium">{label}</div>
    </Link>
  );
}
