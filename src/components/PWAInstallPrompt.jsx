"use client";

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://')
      || localStorage.getItem('pwa-installed'); // Also check localStorage flag
    
    setIsStandalone(!!standalone);

    // Don't show if already installed
    if (standalone) {
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Check if this is first visit (never seen prompt before)
    const promptShown = localStorage.getItem('pwa-prompt-shown');
    const firstVisit = !promptShown;
    
    // Check if user dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = dismissed ? (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24) : Infinity;

    // Check if user accepted install (but might not be installed yet)
    const installAccepted = localStorage.getItem('pwa-install-accepted');
    const installAcceptedTime = installAccepted ? parseInt(installAccepted) : 0;
    const daysSinceAccepted = installAccepted ? (Date.now() - installAcceptedTime) / (1000 * 60 * 60 * 24) : Infinity;

    // Show if:
    // 1. First visit (never shown before) - show immediately
    // 2. Or dismissed more than 7 days ago - show again
    // 3. Or accepted but not installed (maybe installation failed) - show again after 1 day
    const shouldShow = firstVisit || 
                      (dismissed && daysSinceDismissed >= 7) ||
                      (installAccepted && daysSinceAccepted >= 1 && !standalone);

    if (!shouldShow) {
      return;
    }

    // Mark that we've shown the prompt (only once per session)
    if (firstVisit) {
      localStorage.setItem('pwa-prompt-shown', Date.now().toString());
    }

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt immediately for first visit, or after delay for returning users
      const delay = firstVisit ? 2000 : 5000; // 2s for first visit, 5s for returning
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual instructions
    if (ios && shouldShow) {
      const delay = firstVisit ? 2000 : 5000;
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    }

    // Also check if user has been on site for a while (engagement-based prompt)
    // Show after 30 seconds if they haven't dismissed and are still on page
    if (!firstVisit && daysSinceDismissed >= 7) {
      const engagementTimer = setTimeout(() => {
        // Only show if they're still on the page and haven't dismissed
        if (!localStorage.getItem('pwa-install-dismissed') || 
            (Date.now() - parseInt(localStorage.getItem('pwa-install-dismissed') || '0')) > 7 * 24 * 60 * 60 * 1000) {
          setShowPrompt(true);
        }
      }, 30000); // 30 seconds

      return () => {
        clearTimeout(engagementTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Mark as installed
      localStorage.setItem('pwa-installed', Date.now().toString());
      localStorage.removeItem('pwa-install-dismissed'); // Clear dismissal
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no deferred prompt (iOS or browser doesn't support it), just show instructions
      setShowPrompt(true);
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Mark as installed (will be checked on next load)
        localStorage.setItem('pwa-install-accepted', Date.now().toString());
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Install Shopwice Vendor App
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                Add to your home screen for quick access and offline support
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <ol className="text-xs text-blue-900 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Tap the Share button <span className="inline-block">📤</span> in Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Scroll down and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Tap "Add" to confirm</span>
                  </li>
                </ol>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Maybe later
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">
              Install Shopwice Vendor App
            </h3>
            <p className="text-xs text-indigo-100 mb-3">
              Get quick access and work offline. Install our app for the best experience.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-xs font-medium text-white/90 hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
