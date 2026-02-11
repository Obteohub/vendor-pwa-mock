// src/components/UploadStatus.jsx
// Shows background upload status

"use client";

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { uploadQueue } from '@/lib/uploadQueue';

export default function UploadStatus() {
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const queueStatus = await uploadQueue.getStatus();
        
        if (queueStatus.total > 0) {
          setStatus(queueStatus);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('[UPLOAD STATUS] Error getting status:', error);
      }
    };

    // Update status every 2 seconds
    const interval = setInterval(updateStatus, 2000);
    updateStatus(); // Initial update

    // Listen for upload completion
    const handleUploadComplete = () => {
      setTimeout(updateStatus, 500);
    };

    window.addEventListener('upload-completed', handleUploadComplete);

    return () => {
      clearInterval(interval);
      window.removeEventListener('upload-completed', handleUploadComplete);
    };
  }, []);

  if (!isVisible || !status || status.total === 0) {
    return null;
  }

  const hasActiveUploads = status.pending > 0 || status.processing > 0;

  const handleClick = async () => {
    if (isRetrying || status.processing > 0) return; // Prevent multiple clicks or clicks while processing
    
    try {
      setIsRetrying(true);
      
      // Reset failed uploads to pending so they can be retried
      if (status.failed > 0) {
        const retriedCount = await uploadQueue.retryFailedUploads();
        console.log(`[UPLOAD STATUS] Reset ${retriedCount} failed upload(s) to pending`);
      }
      
      // Trigger queue processing
      console.log('[UPLOAD STATUS] Retrying uploads...');
      await uploadQueue.processQueue();
      
      // Update status after a short delay
      setTimeout(async () => {
        const newStatus = await uploadQueue.getStatus();
        setStatus(newStatus);
        setIsRetrying(false);
      }, 1000);
    } catch (error) {
      console.error('[UPLOAD STATUS] Error handling click:', error);
      setIsRetrying(false);
    }
  };

  const canRetry = (status.pending > 0 || status.failed > 0) && !status.processing;

  return (
    <div 
      className={`fixed bottom-20 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 min-w-[280px] transition-all ${
        canRetry 
          ? 'border-blue-300 cursor-pointer hover:shadow-xl hover:border-blue-400 hover:bg-blue-50' 
          : 'border-gray-200'
      }`}
      onClick={canRetry ? handleClick : undefined}
      role={canRetry ? "button" : undefined}
      tabIndex={canRetry ? 0 : undefined}
      onKeyDown={canRetry ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      title={canRetry ? "Click to retry pending uploads" : "Background upload status"}
    >
      <div className="flex items-start gap-3">
        {isRetrying || status.processing > 0 ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        ) : status.failed > 0 ? (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : status.pending > 0 ? (
          <RefreshCw className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Upload className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            Background Uploads
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            {isRetrying && (
              <p className="text-blue-700 font-medium">
                Retrying uploads...
              </p>
            )}
            {!isRetrying && status.processing > 0 && (
              <p className="text-blue-700">
                Processing {status.processing} upload{status.processing > 1 ? 's' : ''}...
              </p>
            )}
            {!isRetrying && status.pending > 0 && (
              <p className={`transition-colors ${canRetry ? 'text-orange-700 hover:text-orange-800 font-medium' : ''}`}>
                {status.pending} pending {canRetry ? '• Click to retry' : ''}
              </p>
            )}
            {!isRetrying && status.failed > 0 && (
              <p className={`transition-colors ${canRetry ? 'text-red-700 hover:text-red-800 font-medium' : 'text-red-700'}`}>
                {status.failed} failed {canRetry ? '• Click to retry' : '(will retry automatically)'}
              </p>
            )}
          </div>
        </div>

        {!hasActiveUploads && !isRetrying && (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </div>
  );
}

