// src/components/DataSyncStatus.jsx
"use client";

import React from 'react';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataSyncStatus({ 
  lastSync, 
  syncing, 
  syncProgress, 
  onSync,
  categories = 0,
  brands = 0,
  attributes = 0,
  locations = 0
}) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const needsSync = () => {
    if (!lastSync) return true;
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return lastSync < weekAgo;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-800">Local Data Store</h3>
        </div>
        
        <button
          onClick={onSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            syncing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Sync Progress */}
      {syncing && syncProgress && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-xs text-blue-900 mb-1">
            <span className="font-medium">{syncProgress.current}</span>
            <span>{syncProgress.step}/{syncProgress.total}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(syncProgress.step / syncProgress.total) * 100}%` }}
            />
          </div>
          {syncProgress.details && (
            <p className="text-xs text-blue-700 mt-1">{syncProgress.details}</p>
          )}
        </div>
      )}

      {/* Last Sync Status */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
        <Clock className="w-3.5 h-3.5" />
        <span>Last synced: {formatDate(lastSync)}</span>
        {needsSync() && (
          <span className="flex items-center gap-1 text-orange-600">
            <AlertCircle className="w-3 h-3" />
            Needs sync
          </span>
        )}
        {!needsSync() && lastSync && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" />
            Up to date
          </span>
        )}
      </div>

      {/* Data Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Categories</div>
          <div className="text-lg font-semibold text-gray-900">{categories.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Brands</div>
          <div className="text-lg font-semibold text-gray-900">{brands.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Attributes</div>
          <div className="text-lg font-semibold text-gray-900">{attributes.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Locations</div>
          <div className="text-lg font-semibold text-gray-900">{locations.toLocaleString()}</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Data syncs automatically every 7 days. Click "Sync Now" to update manually.
      </p>
    </div>
  );
}
