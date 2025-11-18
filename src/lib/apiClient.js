// src/lib/apiClient.js
// Resilient API client with retry logic, caching, and offline support

/**
 * Exponential backoff retry logic
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 408, 429
      if (error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (i === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const waitTime = delay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

/**
 * Enhanced fetch with timeout, retry, and error handling
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} timeout - Request timeout in ms
 * @returns {Promise} - Response data
 */
export async function resilientFetch(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const error = new Error(`Server returned non-JSON response (${res.status})`);
        error.status = res.status;
        error.isServerError = true;
        throw error;
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        const error = new Error(data.error || data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      
      return data;
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    
    if (!navigator.onLine) {
      const offlineError = new Error('No internet connection');
      offlineError.isOffline = true;
      throw offlineError;
    }
    
    throw error;
  }
}

/**
 * Cache manager for API responses
 */
export class CacheManager {
  constructor(prefix = 'api_cache_') {
    this.prefix = prefix;
  }
  
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in ms
   * @returns {any|null} - Cached data or null
   */
  get(key, maxAge = 5 * 60 * 1000) {
    try {
      const cached = localStorage.getItem(this.prefix + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > maxAge) {
        this.delete(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }
  
  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Cache write error:', error);
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.clearOldest();
        // Try again
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (retryError) {
          console.error('Cache write failed after cleanup:', retryError);
        }
      }
    }
  }
  
  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }
  
  /**
   * Clear all cache with this prefix
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
  
  /**
   * Clear oldest cache entries
   */
  clearOldest() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => {
          try {
            const { timestamp } = JSON.parse(localStorage.getItem(key));
            return { key, timestamp };
          } catch {
            return { key, timestamp: 0 };
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest 25%
      const toRemove = Math.ceil(cacheKeys.length * 0.25);
      cacheKeys.slice(0, toRemove).forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

/**
 * Offline queue for failed requests
 */
export class OfflineQueue {
  constructor(queueKey = 'offline_queue') {
    this.queueKey = queueKey;
  }
  
  /**
   * Add request to queue
   * @param {object} request - Request details
   */
  add(request) {
    try {
      const queue = this.getAll();
      queue.push({
        ...request,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      });
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  }
  
  /**
   * Get all queued requests
   * @returns {Array} - Queued requests
   */
  getAll() {
    try {
      const queue = localStorage.getItem(this.queueKey);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.warn('Failed to read offline queue:', error);
      return [];
    }
  }
  
  /**
   * Remove request from queue
   * @param {string} id - Request ID
   */
  remove(id) {
    try {
      const queue = this.getAll();
      const filtered = queue.filter(req => req.id !== id);
      localStorage.setItem(this.queueKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from offline queue:', error);
    }
  }
  
  /**
   * Clear all queued requests
   */
  clear() {
    try {
      localStorage.removeItem(this.queueKey);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }
  
  /**
   * Process all queued requests
   * @returns {Promise} - Results of processing
   */
  async processAll() {
    const queue = this.getAll();
    const results = [];
    
    for (const request of queue) {
      try {
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          this.remove(request.id);
          results.push({ success: true, id: request.id });
        } else {
          results.push({ success: false, id: request.id, error: 'Request failed' });
        }
      } catch (error) {
        results.push({ success: false, id: request.id, error: error.message });
      }
    }
    
    return results;
  }
}

// Create singleton instances
export const cache = new CacheManager();
export const offlineQueue = new OfflineQueue();

/**
 * Fetch with cache support
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {object} cacheOptions - Cache options
 * @returns {Promise} - Response data
 */
export async function fetchWithCache(url, options = {}, cacheOptions = {}) {
  const {
    cacheKey = url,
    maxAge = 5 * 60 * 1000, // 5 minutes default
    forceRefresh = false,
    fallbackToCache = true
  } = cacheOptions;
  
  // DISABLED IN DEVELOPMENT: Skip all caching in dev mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('🚫 Cache disabled in development - fetching fresh data for:', url);
    // In development, just fetch directly without caching
    try {
      const data = await resilientFetch(url, options);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
  
  // Check cache first (unless force refresh)
  if (!forceRefresh && options.method === 'GET') {
    const cached = cache.get(cacheKey, maxAge);
    if (cached) {
      console.log('Using cached data for:', url);
      return cached;
    }
  }
  
  try {
    // Fetch fresh data
    const data = await resilientFetch(url, options);
    
    // Cache successful GET requests
    if (options.method === 'GET' || !options.method) {
      cache.set(cacheKey, data);
    }
    
    return data;
    
  } catch (error) {
    console.error('Fetch error:', error);
    
    // If offline or server error, try to use stale cache
    if (fallbackToCache && (error.isOffline || error.isServerError || error.isTimeout)) {
      const staleCache = cache.get(cacheKey, Infinity); // Get cache regardless of age
      if (staleCache) {
        console.warn('Using stale cache due to error:', error.message);
        return staleCache;
      }
    }
    
    // If it's a mutation (POST/PUT/DELETE) and we're offline, queue it
    if (error.isOffline && options.method && options.method !== 'GET') {
      console.log('Queueing request for later:', url);
      offlineQueue.add({ url, options });
      
      const queueError = new Error('Request queued for when connection is restored');
      queueError.isQueued = true;
      throw queueError;
    }
    
    throw error;
  }
}

/**
 * Initialize online/offline listeners
 */
export function initializeNetworkListeners() {
  window.addEventListener('online', async () => {
    console.log('Connection restored. Processing queued requests...');
    const results = await offlineQueue.processAll();
    const successful = results.filter(r => r.success).length;
    console.log(`Processed ${successful}/${results.length} queued requests`);
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('queue-processed', { detail: results }));
  });
  
  window.addEventListener('offline', () => {
    console.log('Connection lost. Requests will be queued.');
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('connection-lost'));
  });
}
