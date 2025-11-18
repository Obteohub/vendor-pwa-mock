import { NextResponse } from 'next/server';

// Define external URLs
const JWT_AUTH_URL = process.env.NEXT_PUBLIC_JWT_AUTH_URL;
// Dokan/WC API base: https://shop.com/wp-json/dokan/v1
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL; 
// WordPress base URL: https://shop.com
const WP_BASE_URL = process.env.WP_BASE_URL; 

// IMPORTANT: Prevents Next.js from caching the response
export const dynamic = 'force-dynamic';

// Helper to check if a role array or capabilities object contains a vendor status
const isVendorRole = (roles, capabilities) => {
    const vendorRoles = ['seller', 'vendor', 'dokan_vendor', 'wcfm_vendor'];
    
    // --- 1. Check Standard Roles Array/String ---
    if (typeof roles === 'string') { // Dokan/WC API single role check
        if (vendorRoles.includes(roles)) return true;
    }
    
    if (Array.isArray(roles) && roles.length > 0) { // Standard WP API roles array check
        if (roles.some(role => vendorRoles.includes(role))) return true;
    }

    // --- 2. Check Capabilities (Fallback for Standard WP API) ---
    // This is crucial for users where the 'roles' array is empty, but they have vendor permissions.
    if (capabilities && typeof capabilities === 'object') {
        const vendorCapabilities = [
            'dokan_view_seller_dashboard', 
            'edit_products',
            'wcfm_vendor' // Often listed as a capability as well
        ];

        // Check if the user has any of these keys set to true (or any non-zero value)
        if (vendorCapabilities.some(cap => capabilities[cap])) {
            console.log(`[AUTH DEBUG] Vendor status verified via capability: ${vendorCapabilities.find(cap => capabilities[cap])}`);
            return true;
        }
    }

    return false; 
};


export async function POST(request) {
    const { username, password } = await request.json();

    if (!username || !password) {
        return NextResponse.json(
            { error: 'Username and password are required.' },
            { status: 400 }
        );
    }

    // --- 1. Authenticate and Get JWT Token ---
    let jwtToken;
    try {
        console.log(`[AUTH DEBUG] Attempting JWT auth at: ${JWT_AUTH_URL}`);
        
        const authRes = await fetch(JWT_AUTH_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        // Check content type before parsing
        const contentType = authRes.headers.get('content-type');
        console.log(`[AUTH DEBUG] Response status: ${authRes.status}, content-type: ${contentType}`);
        
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await authRes.text();
            console.error('JWT endpoint returned non-JSON response:', textResponse.substring(0, 500));
            
            // Check if it's a Cloudflare challenge
            if (textResponse.includes('Just a moment') || textResponse.includes('cloudflare')) {
                return NextResponse.json(
                    { 
                        error: 'Cloudflare is blocking API access.',
                        details: 'The API subdomain may not be configured correctly. Ensure DNS is set to "DNS only" (gray cloud).'
                    },
                    { status: 503 }
                );
            }
            
            return NextResponse.json(
                { 
                    error: 'Authentication server configuration error.',
                    details: `Expected JSON but received ${contentType || 'unknown content type'}. Response preview: ${textResponse.substring(0, 100)}`
                },
                { status: 500 }
            );
        }

        const authData = await authRes.json();

        if (!authRes.ok || !authData.token) {
            console.error('JWT Auth Failed:', authData);
            return NextResponse.json(
                { error: authData.message || 'Authentication failed. Invalid credentials.' },
                { status: 401 }
            );
        }

        jwtToken = authData.token;
        console.log(`[AUTH DEBUG] Successfully retrieved JWT token.`);

    } catch (error) {
        console.error('Network Error during JWT authentication:', error);
        
        // Provide more specific error messages
        let errorDetails = error.message;
        if (error.cause) {
            errorDetails += ` (${error.cause.message || error.cause.code})`;
        }
        
        return NextResponse.json(
            { 
                error: 'Failed to connect to the authentication server.',
                details: errorDetails,
                url: JWT_AUTH_URL
            },
            { status: 500 }
        );
    }

    // --- 2. Verify User Role (Must be a Vendor) using Dokan/WP endpoints ---
    let userData = {};
    let isDokanCheck = true;
    
    try {
        let userDetailsUrl = `${WC_API_URL}/users/me`; 
        
        console.log(`[AUTH DEBUG] 2a. Attempting Dokan check: ${userDetailsUrl}`);
        
        // --- 2.1 Attempt Dokan Check (Dokan/WC Endpoint) ---
        let userRes = await fetch(userDetailsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        userData = await userRes.json();
        
        // Check if Dokan check failed with 404/rest_no_route, indicating no Dokan setup or wrong API route
        if (userRes.status === 404 || userData.code === 'rest_no_route' || userData.code === 'dokan_rest_unauthorized') {
            
            // --- 2.2 Fallback to Standard WordPress API Check (WITH context=edit) ---
            console.warn(`[AUTH DEBUG] Dokan check failed (Status: ${userRes.status}, Code: ${userData.code || 'N/A'}). Falling back to standard WP endpoint.`);
            
            // Constructs: https://shopwice.com/wp-json/wp/v2/users/me?context=edit
            userDetailsUrl = `${WP_BASE_URL}/wp-json/wp/v2/users/me?context=edit`;
            isDokanCheck = false;
            
            userRes = await fetch(userDetailsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            userData = await userRes.json();
        }

        console.log(`[AUTH DEBUG] User Data Retrieved from ${isDokanCheck ? 'Dokan/WC' : 'Standard WP (context=edit)'} API:`, userData);
        
        // --- 2.3 Process Final Result ---
        
        if (!userRes.ok) {
             console.error(`User Role Verification Failed (Status: ${userRes.status}):`, userData); 
             let errorMessage = 'Failed to verify user account. Access denied or API configuration error.';
             
             return NextResponse.json(
                 { error: errorMessage },
                 { status: 403 } 
             );
        }
        
        // --- 2.4 Check Vendor Role using the most appropriate fields ---
        
        // Extract roles/role depending on the endpoint used, defaulting to safe values
        const roles = isDokanCheck ? (userData.role || '') : (userData.roles || []);
        // Capabilities are only returned by the standard WP API with context=edit
        const capabilities = isDokanCheck ? null : userData.capabilities;

        if (!isVendorRole(roles, capabilities)) {
            // Determine the actual role(s) to show in the error message
            let actualRole = 'none';
            if (isDokanCheck) {
                actualRole = userData.role || 'none (Dokan Check)';
            } else if (Array.isArray(userData.roles) && userData.roles.length > 0) {
                actualRole = userData.roles.join(', ');
            } else if (userData.capabilities) {
                // If roles array is empty, list common non-vendor capabilities for debugging
                const caps = Object.keys(userData.capabilities).filter(c => userData.capabilities[c] === true && c.length < 25);
                actualRole = caps.length > 0 ? `Capabilities: ${caps.join(', ')}` : 'none (WP Check)';
            }
            
            // Create a response for the error
            const errorResponse = NextResponse.json(
                { error: `Account role(s) "${actualRole}" is not a recognized vendor role. Access denied.` }, 
                { status: 403 }
            );

            // Delete the token by setting maxAge: 0 on the response object
            errorResponse.cookies.set('sw_token', '', { maxAge: 0, path: '/' }); 
            
            return errorResponse;
        }
        
        console.log('[AUTH DEBUG] Vendor Role Verified.'); 

    } catch (error) {
        console.error('Network Error during vendor role verification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to connect to the Dokan/Vendor API for role check.' },
            { status: 500 }
        );
    }

    // --- 3. Set Cookie and Respond ---
    try {
        // Create the successful JSON response
        const successResponse = NextResponse.json(
            { message: 'Login successful', token: jwtToken },
            { status: 200 }
        );

        // Set the JWT token as an HTTP-only cookie on the response object
        successResponse.cookies.set('sw_token', jwtToken, {
            httpOnly: true,
            secure: false, // Set to false for localhost, true only for HTTPS in production
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/', 
            sameSite: 'lax',
        });

        // Save user info in a separate cookie (not httpOnly so client can read it)
        const userInfo = {
            id: userData.id,
            display_name: userData.display_name || userData.name,
            user_nicename: userData.user_nicename || userData.slug,
            email: userData.email,
            role: isDokanCheck ? userData.role : (userData.roles?.[0] || 'vendor')
        };

        successResponse.cookies.set('sw_user', JSON.stringify(userInfo), {
            httpOnly: false, // Allow client-side access
            secure: false,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });
        
        console.log('[AUTH DEBUG] Cookies set:', {
            token: 'sw_token (httpOnly)',
            user: 'sw_user (readable)',
            userInfo
        });

        console.log(`[AUTH DEBUG] Login successful. Token and user info saved.`);

        return successResponse;
    } catch (error) {
        console.error('Error setting cookie:', error);
        return NextResponse.json(
            { error: 'Login successful but failed to set session cookie.' },
            { status: 500 }
        );
    }
}