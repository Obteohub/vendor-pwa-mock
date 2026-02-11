// src/lib/wcfmClient.js
// Client for making WCFM API calls through the proxy middleware

/**
 * WCFM API Client
 * All WCFM calls go through /api/wcfm/proxy middleware
 * Never calls WCFM REST API directly
 */
class WcfmClient {
    constructor() {
        this.proxyUrl = '/api/wcfm/proxy';
    }

    /**
     * Make a request to WCFM API through proxy
     * @param {string} endpoint - WCFM endpoint (e.g., "users/me", "products")
     * @param {object} options - Request options
     * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} options.body - Request body for POST/PUT
     * @param {object} options.params - Query parameters
     * @returns {Promise<any>} Response data
     */
    async request(endpoint, options = {}) {
        const { method = 'GET', body, params } = options;

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST', // Proxy always uses POST
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({
                    endpoint,
                    method,
                    body,
                    params,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new WcfmError(
                    data.error || 'WCFM request failed',
                    response.status,
                    data.code,
                    data.details
                );
            }

            // Extract pagination from headers if available
            const total = response.headers.get('X-WP-Total');
            const totalPages = response.headers.get('X-WP-TotalPages');

            if (total || totalPages) {
                return {
                    data,
                    pagination: {
                        total: total ? parseInt(total, 10) : undefined,
                        totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
                    },
                };
            }

            return data;
        } catch (error) {
            if (error instanceof WcfmError) {
                throw error;
            }
            throw new WcfmError(
                error.message || 'Network error',
                0,
                'network_error'
            );
        }
    }

    // Convenience methods for common endpoints

    /**
     * Get current user details
     */
    async getMe() {
        return this.request('users/me', { method: 'GET' });
    }

    /**
     * Get vendor settings
     */
    async getSettings() {
        return this.request('settings', { method: 'GET' });
    }

    /**
     * Update vendor settings
     */
    async updateSettings(settings) {
        return this.request('settings', {
            method: 'POST',
            body: settings,
        });
    }

    /**
     * Get sales statistics
     */
    async getSalesStats(params = {}) {
        return this.request('sales-stats', {
            method: 'GET',
            params,
        });
    }

    /**
     * Get products
     */
    async getProducts(params = {}) {
        return this.request('products', {
            method: 'GET',
            params: {
                page: 1,
                per_page: 10,
                ...params,
            },
        });
    }

    /**
     * Get single product
     */
    async getProduct(id) {
        return this.request(`products/${id}`, { method: 'GET' });
    }

    /**
     * Create product
     */
    async createProduct(productData) {
        return this.request('products', {
            method: 'POST',
            body: productData,
        });
    }

    /**
     * Update product
     */
    async updateProduct(id, productData) {
        return this.request(`products/${id}`, {
            method: 'PUT',
            body: productData,
        });
    }

    /**
     * Delete product
     */
    async deleteProduct(id, force = true) {
        return this.request(`products/${id}`, {
            method: 'DELETE',
            params: { force },
        });
    }

    /**
     * Get orders
     */
    async getOrders(params = {}) {
        return this.request('orders', {
            method: 'GET',
            params: {
                page: 1,
                per_page: 20,
                ...params,
            },
        });
    }

    /**
     * Get single order
     */
    async getOrder(id) {
        return this.request(`orders/${id}`, { method: 'GET' });
    }

    /**
     * Update order status
     */
    async updateOrderStatus(id, status) {
        return this.request(`orders/${id}`, {
            method: 'PUT',
            body: { status },
        });
    }

    /**
     * Get product categories
     */
    async getCategories(params = {}) {
        return this.request('products/categories', {
            method: 'GET',
            params,
        });
    }

    /**
     * Get notifications
     */
    async getNotifications(params = {}) {
        return this.request('notifications', {
            method: 'GET',
            params,
        });
    }
}

/**
 * Custom error class for WCFM API errors
 */
class WcfmError extends Error {
    constructor(message, status, code, details) {
        super(message);
        this.name = 'WcfmError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Export singleton instance
const wcfmClient = new WcfmClient();
export default wcfmClient;

// Also export the class and error for advanced usage
export { WcfmClient, WcfmError };
