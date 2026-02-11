"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoadingIndicator() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading when pathname changes
    setLoading(true);
    
    // Hide loading after page loads
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Failsafe: Force hide after 2 seconds max
    const maxTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [pathname]);
  
  // Also hide on window load event
  useEffect(() => {
    const handleLoad = () => setLoading(false);
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // Also listen for link clicks to show loading immediately
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && !target.target) {
        // Check if it's an internal link
        const url = new URL(target.href);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2">
        {/* Orange dot */}
        <div 
          className="w-3 h-3 rounded-full bg-orange-500 animate-bounce shadow-lg"
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        ></div>
        
        {/* Blue dot */}
        <div 
          className="w-3 h-3 rounded-full bg-blue-600 animate-bounce shadow-lg"
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        ></div>
        
        {/* Black dot */}
        <div 
          className="w-3 h-3 rounded-full bg-gray-900 animate-bounce shadow-lg"
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        ></div>
      </div>
    </div>
  );
}
