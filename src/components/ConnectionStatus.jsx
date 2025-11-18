// src/components/ConnectionStatus.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { offlineQueue } from '@/lib/apiClient';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);
    updateQueueCount();

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      
      // Auto-sync queued requests
      if (queuedCount > 0) {
        syncQueue();
      }
      
      // Hide banner after 5 seconds
      setTimeout(() => setShowBanner(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Queue processed listener
    const handleQueueProcessed = (event) => {
      const results = event.detail;
      const successful = results.filter(r => r.success).length;
      setLastSyncResult({ successful, total: results.length });
      updateQueueCount();
      setSyncing(false);
      
      // Hide result after 5 seconds
      setTimeout(() => setLastSyncResult(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('queue-processed', handleQueueProcessed);

    // Update queue count periodically
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('queue-processed', handleQueueProcessed);
      clearInterval(interval);
    };
  }, [queuedCount]);

  const updateQueueCount = () => {
    const queue = offlineQueue.getAll();
    setQueuedCount(queue.length);
  };

  const syncQueue = async () => {
    setSyncing(true);
    try {
      const results = await offlineQueue.processAll();
      const successful = results.filter(r => r.success).length;
      setLastSyncResult({ successful, total: results.length });
      updateQueueCount();
    } catch (error) {
      console.error('Failed to sync queue:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Don't show anything if online and no queued items
  if (isOnline && queuedCount === 0 && !showBanner && !lastSyncResult) {
    return null;
  }

  return (
    <>
      {/* Fixed banner at top */}
      {(showBanner || !isOnline || queuedCount > 0) && (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isOnline ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Back Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">No Internet Connection</span>
                </>
              )}
              
              {queuedCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {queuedCount} pending
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {queuedCount > 0 && isOnline && (
                <button
                  onClick={syncQueue}
                  disabled={syncing}
                  className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-white text-sm transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              
              <button
                onClick={() => setShowBanner(false)}
                className="text-white hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync result notification */}
      {lastSyncResult && (
        <div className="fixed top-14 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            {lastSyncResult.successful === lastSyncResult.total ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">Sync Complete</h4>
              <p className="text-sm text-gray-600 mt-1">
                {lastSyncResult.successful} of {lastSyncResult.total} operations synced successfully
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating indicator (bottom right) */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-40 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CloudOff className="w-4 h-4" />
          <span className="text-sm font-medium">Working Offline</span>
          {queuedCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
              {queuedCount}
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
