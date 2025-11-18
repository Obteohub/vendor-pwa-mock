// src/components/ResilienceDebugPanel.jsx
// Debug panel to visualize resilience features (development only)

"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Database, Wifi, Clock, RefreshCw } from 'lucide-react';
import { cache, offlineQueue } from '@/lib/apiClient';

export default function ResilienceDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    cacheSize: 0,
    queueSize: 0,
    isOnline: true,
    cacheKeys: [],
    queueItems: []
  });

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 2000);
    
    const handleOnline = () => updateStats();
    const handleOffline = () => updateStats();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStats = () => {
    try {
      // Get cache keys
      const cacheKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('api_cache_'))
        .map(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            const age = Date.now() - data.timestamp;
            return {
              key: key.replace('api_cache_', ''),
              age: Math.floor(age / 1000),
              size: new Blob([JSON.stringify(data)]).size
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // Get queue items
      const queueItems = offlineQueue.getAll();

      setStats({
        cacheSize: cacheKeys.length,
        queueSize: queueItems.length,
        isOnline: navigator.onLine,
        cacheKeys,
        queueItems
      });
    } catch (error) {
      console.error('Failed to update debug stats:', error);
    }
  };

  const clearCache = () => {
    if (confirm('Clear all cache? This will remove cached API responses.')) {
      cache.clearAll();
      updateStats();
    }
  };

  const clearQueue = () => {
    if (confirm('Clear offline queue? Pending operations will be lost.')) {
      offlineQueue.clear();
      updateStats();
    }
  };

  const syncQueue = async () => {
    try {
      await offlineQueue.processAll();
      updateStats();
    } catch (error) {
      console.error('Failed to sync queue:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatAge = (seconds) => {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    return Math.floor(seconds / 3600) + 'h';
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
        title="Resilience Debug Panel"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed bottom-32 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h3 className="font-semibold">Resilience Debug</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-200 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${stats.isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-sm font-medium">{stats.isOnline ? 'Online' : 'Offline'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Cache</div>
                <div className="text-sm font-medium">{stats.cacheSize} items</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-500">Queue</div>
                <div className="text-sm font-medium">{stats.queueSize} pending</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-gray-500">Auto-sync</div>
                <div className="text-sm font-medium">{stats.isOnline ? 'Active' : 'Paused'}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-b border-gray-200 flex gap-2">
            <button
              onClick={clearCache}
              className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={clearQueue}
              className="flex-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200 transition-colors"
            >
              Clear Queue
            </button>
            <button
              onClick={syncQueue}
              disabled={stats.queueSize === 0 || !stats.isOnline}
              className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sync Now
            </button>
          </div>

          {/* Cache items */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Cached Items</h4>
              {stats.cacheKeys.length === 0 ? (
                <p className="text-xs text-gray-500">No cached items</p>
              ) : (
                <div className="space-y-2">
                  {stats.cacheKeys.map((item, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-900 truncate">{item.key}</div>
                      <div className="text-gray-500 flex justify-between mt-1">
                        <span>Age: {formatAge(item.age)}</span>
                        <span>{formatBytes(item.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Queue items */}
            <div className="p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Queued Operations</h4>
              {stats.queueItems.length === 0 ? (
                <p className="text-xs text-gray-500">No pending operations</p>
              ) : (
                <div className="space-y-2">
                  {stats.queueItems.map((item, index) => (
                    <div key={index} className="text-xs bg-orange-50 p-2 rounded">
                      <div className="font-medium text-gray-900">{item.options?.method || 'GET'}</div>
                      <div className="text-gray-600 truncate">{item.url}</div>
                      <div className="text-gray-500 mt-1">
                        Queued: {formatAge(Math.floor((Date.now() - item.timestamp) / 1000))} ago
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
