// src/lib/uploadQueue.js
// Background upload queue system using IndexedDB for large file storage

class UploadQueue {
  constructor() {
    this.dbName = 'ProductUploadQueue';
    this.dbVersion = 1;
    this.db = null;
    this.isProcessing = false;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for upload queue
        if (!db.objectStoreNames.contains('uploads')) {
          const uploadStore = db.createObjectStore('uploads', { keyPath: 'id', autoIncrement: true });
          uploadStore.createIndex('status', 'status', { unique: false });
          uploadStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Ensure DB is initialized
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // Add upload to queue
  async addUpload(formData, metadata) {
    await this.ensureDB();
    
    console.log('[UPLOAD QUEUE] Serializing FormData...');
    // Convert FormData to serializable format first
    const serializedFormData = await this.serializeFormData(formData);
    console.log('[UPLOAD QUEUE] FormData serialized, files:', serializedFormData.files.length, 'fields:', Object.keys(serializedFormData.fields).length);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      
      const uploadData = {
        formData: serializedFormData,
        metadata: {
          ...metadata,
          status: 'pending',
          timestamp: Date.now(),
          retries: 0
        }
      };

      const request = store.add(uploadData);
      
      request.onsuccess = () => {
        const id = request.result;
        console.log('[UPLOAD QUEUE] Added upload to queue with ID:', id, 'metadata:', metadata);
        resolve(id);
        
        // Start processing immediately if not already processing
        if (!this.isProcessing) {
          console.log('[UPLOAD QUEUE] Triggering immediate queue processing...');
          // Use setTimeout(0) to ensure it runs after current execution
          setTimeout(() => {
            this.processQueue().catch(err => {
              console.error('[UPLOAD QUEUE] Error in auto-triggered processing:', err);
            });
          }, 0);
        } else {
          console.log('[UPLOAD QUEUE] Queue already processing, will pick up this upload in next cycle');
        }
      };
      
      request.onerror = () => {
        console.error('[UPLOAD QUEUE] Error adding to queue:', request.error);
        reject(request.error);
      };
    });
  }

  // Serialize FormData to store in IndexedDB
  async serializeFormData(formData) {
    const serialized = {
      fields: {},
      files: []
    };

    // Extract all fields
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Convert File to ArrayBuffer for storage
        const arrayBuffer = await value.arrayBuffer();
        serialized.files.push({
          key,
          name: value.name,
          type: value.type,
          size: value.size,
          data: arrayBuffer
        });
      } else {
        serialized.fields[key] = value;
      }
    }

    return serialized;
  }

  // Reconstruct FormData from serialized data
  reconstructFormData(serialized) {
    const formData = new FormData();

    console.log('[UPLOAD QUEUE] Reconstructing FormData from serialized data...');
    console.log('[UPLOAD QUEUE] Fields to add:', Object.keys(serialized.fields || {}).length);
    console.log('[UPLOAD QUEUE] Files to add:', (serialized.files || []).length);

    // Add fields
    for (const [key, value] of Object.entries(serialized.fields || {})) {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }

    // Add files - handle both single files and arrays
    for (const fileData of (serialized.files || [])) {
      try {
        const blob = new Blob([fileData.data], { type: fileData.type });
        const file = new File([blob], fileData.name, { type: fileData.type });
        
        // Handle array notation (images[])
        if (fileData.key.endsWith('[]')) {
          formData.append(fileData.key, file);
        } else {
          formData.append(fileData.key, file);
        }
        console.log(`[UPLOAD QUEUE] Reconstructed file: ${fileData.name} (${file.size} bytes)`);
      } catch (err) {
        console.error(`[UPLOAD QUEUE] Error reconstructing file ${fileData.name}:`, err);
      }
    }

    // Verify FormData contents
    const entries = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        entries.push(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        entries.push(`${key}: ${value}`);
      }
    }
    console.log('[UPLOAD QUEUE] Reconstructed FormData entries:', entries.length);
    if (entries.length > 0) {
      console.log('[UPLOAD QUEUE] Sample entries:', entries.slice(0, 5));
    }

    return formData;
  }

  // Get pending uploads
  async getPendingUploads() {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readonly');
      const store = transaction.objectStore('uploads');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get failed uploads
  async getFailedUploads() {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readonly');
      const store = transaction.objectStore('uploads');
      const request = store.getAll();

      request.onsuccess = () => {
        const failed = request.result.filter(u => u.metadata.status === 'failed');
        resolve(failed);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Retry failed uploads by resetting them to pending
  async retryFailedUploads() {
    const failedUploads = await this.getFailedUploads();
    
    for (const upload of failedUploads) {
      await this.updateUploadStatus(upload.id, 'pending');
    }
    
    return failedUploads.length;
  }

  // Update upload status
  async updateUploadStatus(id, status, error = null) {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const upload = getRequest.result;
        if (upload) {
          upload.metadata.status = status;
          if (error) {
            upload.metadata.error = error;
            upload.metadata.retries = (upload.metadata.retries || 0) + 1;
          }
          
          const updateRequest = store.put(upload);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Remove completed upload
  async removeUpload(id) {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readwrite');
      const store = transaction.objectStore('uploads');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Process queue in background
  async processQueue() {
    if (this.isProcessing) {
      console.log('[UPLOAD QUEUE] Already processing, skipping...');
      return;
    }
    
    this.isProcessing = true;
    console.log('[UPLOAD QUEUE] ========== STARTING QUEUE PROCESSING ==========');

    try {
      const pending = await this.getPendingUploads();
      console.log(`[UPLOAD QUEUE] Found ${pending.length} pending upload(s)`);
      
      if (pending.length === 0) {
        this.isProcessing = false;
        console.log('[UPLOAD QUEUE] No pending uploads');
        return;
      }

      for (const upload of pending) {
        try {
          console.log(`[UPLOAD QUEUE] Processing upload ${upload.id}...`);
          
          // Update status to processing
          await this.updateUploadStatus(upload.id, 'processing');

          // Reconstruct FormData
          const formData = this.reconstructFormData(upload.formData);
          
          // Log what we're sending
          const formDataEntries = [];
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              formDataEntries.push(`${key}: File(${value.name}, ${value.size} bytes)`);
            } else {
              formDataEntries.push(`${key}: ${value}`);
            }
          }
          console.log(`[UPLOAD QUEUE] FormData entries:`, formDataEntries.length);

          // Upload to server
          console.log(`[UPLOAD QUEUE] Sending to /api/vendor/products...`);
          const response = await fetch('/api/vendor/products', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Important: include cookies for auth
          });

          console.log(`[UPLOAD QUEUE] Response status: ${response.status}`);

          if (response.ok) {
            const responseData = await response.json().catch(() => ({}));
            console.log('[UPLOAD QUEUE] Upload successful:', responseData);
            
            // Success - remove from queue
            await this.removeUpload(upload.id);
            console.log('[UPLOAD QUEUE] Upload completed and removed from queue:', upload.id);
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('upload-completed', {
              detail: { id: upload.id, metadata: upload.metadata, response: responseData }
            }));
          } else {
            // Failed - mark as failed (will retry later)
            const errorData = await response.json().catch(() => ({}));
            console.error('[UPLOAD QUEUE] Upload failed:', upload.id, {
              status: response.status,
              error: errorData
            });
            
            await this.updateUploadStatus(upload.id, 'failed', errorData.error || `Upload failed with status ${response.status}`);
            
            // Retry logic - only retry up to 3 times
            if (upload.metadata.retries < 3) {
              console.log(`[UPLOAD QUEUE] Will retry upload ${upload.id} (attempt ${upload.metadata.retries + 1}/3)`);
              await this.updateUploadStatus(upload.id, 'pending', errorData.error || 'Upload failed');
            }
          }
        } catch (error) {
          console.error('[UPLOAD QUEUE] Error processing upload:', upload.id, error);
          
          // Retry logic - only retry up to 3 times
          if (upload.metadata.retries < 3) {
            console.log(`[UPLOAD QUEUE] Will retry upload ${upload.id} after error (attempt ${upload.metadata.retries + 1}/3)`);
            await this.updateUploadStatus(upload.id, 'pending', error.message);
          } else {
            await this.updateUploadStatus(upload.id, 'failed', error.message);
          }
        }
      }
    } catch (error) {
      console.error('[UPLOAD QUEUE] Queue processing error:', error);
    } finally {
      this.isProcessing = false;
      
      // Check if there are more pending uploads
      const remaining = await this.getPendingUploads();
      if (remaining.length > 0) {
        console.log(`[UPLOAD QUEUE] ${remaining.length} upload(s) still pending, will retry in 2s...`);
        // Wait a bit before processing next batch
        setTimeout(() => this.processQueue(), 2000);
      } else {
        console.log('[UPLOAD QUEUE] Queue processing complete');
      }
    }
  }

  // Get queue status
  async getStatus() {
    await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uploads'], 'readonly');
      const store = transaction.objectStore('uploads');
      const request = store.getAll();

      request.onsuccess = () => {
        const uploads = request.result;
        resolve({
          total: uploads.length,
          pending: uploads.filter(u => u.metadata.status === 'pending').length,
          processing: uploads.filter(u => u.metadata.status === 'processing').length,
          failed: uploads.filter(u => u.metadata.status === 'failed').length
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueue();

// Initialize on load and start processing
if (typeof window !== 'undefined') {
  uploadQueue.init()
    .then(() => {
      console.log('[UPLOAD QUEUE] Initialized successfully');
      // Check for pending uploads and process them
      uploadQueue.getPendingUploads()
        .then(pending => {
          if (pending.length > 0) {
            console.log(`[UPLOAD QUEUE] Found ${pending.length} pending upload(s) on init, starting processing...`);
            uploadQueue.processQueue();
          }
        })
        .catch(err => console.error('[UPLOAD QUEUE] Error checking pending uploads:', err));
    })
    .catch(err => {
      console.error('[UPLOAD QUEUE] Failed to initialize:', err);
    });
  
  // Also process queue when page becomes visible (user comes back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      uploadQueue.getPendingUploads()
        .then(pending => {
          if (pending.length > 0 && !uploadQueue.isProcessing) {
            console.log(`[UPLOAD QUEUE] Page visible, found ${pending.length} pending upload(s), processing...`);
            uploadQueue.processQueue();
          }
        })
        .catch(err => console.error('[UPLOAD QUEUE] Error checking pending on visibility change:', err));
    }
  });
}

