// src/app/api/wcfm/proxy/route.js
// Universal WCFM API proxy middleware
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getBaseUrl = () => {
    const url = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (!url) {
        console.error('[WCFM PROXY] WP_BASE_URL or NEXT_PUBLIC_WORDPRESS_URL is missing');
    }
    return url || '';
};

const BASE_URL = getBaseUrl();
const WCFM_BASE = `${BASE_URL}/wp-json/wcfmmp/v1`;

export const dynamic = 'force-dynamic';

/**
 * Universal WCFM API Proxy
 * Handles all requests to WCFM endpoints through a single middleware
 * 
 * Usage: POST /api/wcfm/proxy
 * Body: {
 *   endpoint: string (e.g., "users/me", "products", "orders")
 *   method: "GET" | "POST" | "PUT" | "DELETE"
 *   body?: any (for POST/PUT requests)
 *   params?: object (query parameters)
 * }
 */
export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Missing authentication token.' },
                { status: 401 }
            );
        }

        const { endpoint, method = 'GET', body, data, params, type = 'wcfm' } = await request.json();

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { status: 400 }
            );
        }

        // Determine base URL based on type
        let apiBase = WCFM_BASE;
        if (type === 'wc') {
            apiBase = `${BASE_URL}/wp-json/wc/v3`;
        } else if (type === 'wp') {
            apiBase = `${BASE_URL}/wp-json/wp/v2`;
        } else if (type === 'jwt') {
            apiBase = `${BASE_URL}/wp-json/jwt-auth/v1`;
        } else if (type === 'custom') {
            apiBase = `${BASE_URL}/wp-json`;
        }

        // Build URL with query parameters
        const urlRequest = new URL(`${apiBase}/${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlRequest.searchParams.append(key, String(value));
                }
            });
        }

        console.log(`[WCFM PROXY] 🔒 Server-side request (${type}): ${method} ${urlRequest.pathname}${urlRequest.search}`);

        // Set up request options
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'User-Agent': 'VendorPWA/1.0 (Next.js Proxy)',
            },
            cache: 'no-store',
        };

        // Add body for POST/PUT requests
        const payload = body || data;
        if ((method === 'POST' || method === 'PUT') && payload) {
            fetchOptions.body = JSON.stringify(payload);
        }

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        fetchOptions.signal = controller.signal;

        try {
            const response = await fetch(urlRequest.toString(), fetchOptions);
            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.warn('[WCFM PROXY] Non-JSON response:', text.substring(0, 200));
                data = { message: text };
            }

            if (!response.ok) {
                console.error('[WCFM PROXY] Request failed:', {
                    status: response.status,
                    endpoint,
                    error: data
                });

                return NextResponse.json(
                    {
                        error: data.message || 'WCFM API request failed',
                        code: data.code,
                        details: data,
                        status: response.status
                    },
                    { status: response.status }
                );
            }

            // Get pagination headers if available
            const headers = {};
            const total = response.headers.get('X-WP-Total');
            const totalPages = response.headers.get('X-WP-TotalPages');

            if (total) headers['X-WP-Total'] = total;
            if (totalPages) headers['X-WP-TotalPages'] = totalPages;

            return NextResponse.json(data, {
                status: 200,
                headers
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'WCFM API request timed out' },
                    { status: 504 }
                );
            }

            throw fetchError;
        }

    } catch (error) {
        console.error('[WCFM PROXY] Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error in WCFM proxy',
                details: error.message
            },
            { status: 500 }
        );
    }
}
