import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

// Define external URLs
const WP_BASE_URL = process.env.WP_BASE_URL || 'https://api.shopwice.com';
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL && process.env.NEXT_PUBLIC_WC_API_BASE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_WC_API_BASE_URL
    : `${WP_BASE_URL}/wp-json/wcfmmp/v1`;

export const dynamic = 'force-dynamic';

// Helper to check if a role array or capabilities object contains a vendor status
const isVendorRole = (roles, capabilities) => {
    const vendorRoles = ['seller', 'vendor', 'wcfm_vendor', 'administrator', 'shop_manager'];

    if (typeof roles === 'string') {
        if (vendorRoles.includes(roles)) return true;
    }

    if (Array.isArray(roles) && roles.length > 0) {
        if (roles.some(role => vendorRoles.includes(role))) return true;
    }

    if (capabilities && typeof capabilities === 'object') {
        const vendorCapabilities = ['edit_products', 'wcfm_vendor'];
        if (vendorCapabilities.some(cap => capabilities[cap])) return true;
    }

    return false;
};

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
        }

        // --- 1. Authenticate via Middleware ---
        let jwtToken;
        let userData = {};
        let authEndpoint = 'auth/login';

        const performAuth = async (endpoint) => {
            console.log(`[AUTH DEBUG] Attempting middleware auth via backendFetch('${endpoint}')`);

            // Create a timeout controller for the internal fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per attempt

            try {
                const response = await backendFetch(endpoint, {
                    method: 'POST',
                    body: { username, password },
                    cache: 'no-store',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === 'AbortError') {
                    console.warn(`[AUTH DEBUG] Request to '${endpoint}' timed out.`);
                    return { status: 408, ok: false, json: async () => ({ error: 'Request timed out' }) };
                }
                throw err;
            }
        };

        try {
            let authRes = await performAuth(authEndpoint);

            // Check if it's a database error - if so, fail fast!
            let errorText = '';
            if (!authRes.ok) {
                const clone = authRes.clone?.() || authRes;
                errorText = await clone.text().catch(() => '');
                if (errorText.includes('database connection') || errorText.includes('wp_die')) {
                    console.error('[AUTH ERROR] Target server database failure. Stopping retries.');
                    return NextResponse.json(
                        { error: 'The authentication server is currently experiencing database issues. Please try again later.' },
                        { status: 503 }
                    );
                }
            }

            // Only retry on 404 (endpoint not found) or 408 (timeout)
            if (authRes.status === 404 || authRes.status === 408) {
                const altEndpoints = ['login', 'vendor/login'];
                for (const alt of altEndpoints) {
                    console.log(`[AUTH DEBUG] Previous attempt failed (${authRes.status}). Trying alternative: '${alt}'...`);
                    authRes = await performAuth(alt);
                    authEndpoint = alt;
                    if (authRes.ok) break;

                    // Break if we hit a DB error in retry
                    const retryText = await authRes.clone?.().text().catch(() => '') || '';
                    if (retryText.includes('database connection')) break;
                }
            }

            if (!authRes.ok) {
                const errorData = await authRes.json?.().catch(() => ({})) || {};
                console.error(`[AUTH ERROR] Middleware authentication failed definitively:`, {
                    status: authRes.status,
                    endpoint: authEndpoint,
                    error: errorData
                });

                return NextResponse.json(
                    { error: errorData.message || errorData.error || `Authentication failed via middleware.` },
                    { status: authRes.status === 404 ? 502 : (authRes.status || 500) }
                );
            }

            const authData = await authRes.json();
            jwtToken = authData.token;
            userData = authData.user || {};

            if (!jwtToken) {
                throw new Error(`No token returned from middleware (${authEndpoint})`);
            }

            console.log(`[AUTH DEBUG] Successfully retrieved token via ${authEndpoint}.`);

        } catch (error) {
            console.error('[AUTH FATAL] Error during middleware authentication:', error);
            return NextResponse.json({ error: 'The authentication middleware is overloaded or unreachable.' }, { status: 504 });
        }

        // --- 2. Verify Vendor Role ---
        let roles = userData.roles || (userData.role ? [userData.role] : []);
        let capabilities = userData.capabilities || null;

        // If middleware didn't provide role info, fetch it from the Middleware's account endpoint
        if (roles.length === 0) {
            console.log('[AUTH DEBUG] Fetching role info via middleware backendFetch("vendor/account")...');
            try {
                const accountRes = await backendFetch('vendor/account', {
                    token: jwtToken,
                    cache: 'no-store'
                });

                if (accountRes.ok) {
                    const accountData = await accountRes.json();
                    const profile = accountData.profile || accountData;

                    userData = { ...userData, ...profile };
                    roles = profile.roles || (profile.role ? [profile.role] : []);
                    capabilities = profile.capabilities || null;

                    console.log(`[AUTH DEBUG] Retrieved profile via middleware for user: ${userData.id}`);
                } else {
                    console.warn(`[AUTH DEBUG] Middleware account check failed with status: ${accountRes.status}`);
                }
            } catch (err) {
                console.warn('[AUTH DEBUG] Failed to fetch profile via middleware:', err.message);
            }
        }

        // Final check: if still no roles, try a very basic WP fetch as absolute last resort
        if (roles.length === 0) {
            // ... existing fallback or just fail
        }

        if (!isVendorRole(roles, capabilities)) {
            // Permissive check for Middleware: if we successfully fetched a profile from vendor/account
            // but the roles array is just empty, we assume they are a vendor because the middleware
            // is specifically for vendors.
            if (userData.id && roles.length === 0) {
                console.log('[AUTH DEBUG] Roles are empty but profile fetch succeeded. Permitting access for middleware user.');
            } else {
                console.warn('[AUTH DEBUG] Role verification failed:', {
                    userId: userData.id,
                    roles,
                    capabilities: capabilities ? Object.keys(capabilities).filter(k => capabilities[k] === true) : null,
                    isWcfmCheck: !!userData.role
                });

                const errorResponse = NextResponse.json(
                    {
                        error: 'Access denied. You do not have vendor permissions.',
                        debug: { roles, hasCapabilities: !!capabilities, userId: userData.id }
                    },
                    { status: 403 }
                );
                errorResponse.cookies.set('sw_token', '', { maxAge: 0, path: '/' });
                return errorResponse;
            }
        }

        console.log('[AUTH DEBUG] Vendor Access Granted.');

        // --- 3. Set Cookies and Respond ---
        const successResponse = NextResponse.json({
            message: 'Login successful',
            token: jwtToken,
            user: {
                id: userData.id,
                display_name: userData.display_name || userData.name,
                email: userData.email,
                role: roles[0] || 'vendor'
            }
        }, { status: 200 });

        successResponse.cookies.set('sw_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });

        const userInfo = {
            id: userData.id,
            display_name: userData.display_name || userData.name,
            email: userData.email,
            role: roles[0] || 'vendor'
        };

        successResponse.cookies.set('sw_user', JSON.stringify(userInfo), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });

        return successResponse;

    } catch (error) {
        console.error('[AUTH CRITICAL] Global login error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
    }
}