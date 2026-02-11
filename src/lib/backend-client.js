const BASE_URL = (
    process.env.WP_BASE_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    "https://api.shopwice.com" // REMOVED extra backticks and spaces
).replace(/\/$/, "");

/**
 * Edge-safe cookie token retrieval:
 * - Dynamic import so this file can be used in Edge routes safely.
 * - cookies() is sync (do NOT await).
 */
async function getAuthTokenSafe() {
    try {
        const { cookies, headers } = await import("next/headers");

        // 1. Try cookies (HttpOnly)
        const cookieStore = await cookies();
        const tokenFromCookie = cookieStore.get("sw_token")?.value;
        if (tokenFromCookie) return tokenFromCookie;

        // 2. Fallback: Authorization Header
        const headersList = await headers();
        const authHeader = headersList.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
    } catch (err) {
        // This might fail in non-request contexts (e.g. static build)
        return undefined;
    }
    return undefined;
}

export async function backendFetch(endpoint, options = {}) {
    const {
        method = "GET",
        body,
        params,
        headers,
        token: manualToken,
        ...rest
    } = options;

    // 1) Build URL
    const cleanEndpoint = endpoint.replace(/^\//, "");
    
    // Check if we should use the direct middleware path (api.shopwice.com/api/)
    // instead of the standard WordPress REST paths
    // FIXED: Added locations, brands, attributes, reset-password, and categories
    const directMiddlewarePrefixes = [
        'vendor/', 'vendors/', 'categories', 'locations', 
        'brands', 'attributes', 'reset-password', 'auth'
    ];
    
    const isDirectMiddleware = directMiddlewarePrefixes.some(prefix => cleanEndpoint.startsWith(prefix));
    
    let url;
    if (isDirectMiddleware) {
        // Direct middleware endpoint: `https://api.shopwice.com/api/vendor/...` 
        const middlewareBase = "https://api.shopwice.com/api"; // REMOVED extra backticks/spaces
        url = new URL(`${middlewareBase}/${cleanEndpoint}`);
    } else {
        // Standard WordPress REST API path
        // FIXED: Removed shopwice/v1 as default since we want everything through direct middleware
        // or other specific namespaces like wcfm or wc
        let apiPath = 'wp-json/wp/v2'; // Default to standard WP
        
        if (cleanEndpoint.startsWith('wcfm/')) {
            apiPath = 'wp-json/wcfmmp/v1';
        } else if (cleanEndpoint.startsWith('wc/')) {
            apiPath = 'wp-json/wc/v3';
        }
        
        // Construct standard URL
        // Using BASE_URL which defaults to https://api.shopwice.com if env not set
        url = new URL(`${BASE_URL}/${apiPath}/${cleanEndpoint.replace(/^(wcfm|wc)\//, '')}`);
    }

    if (params) {
        for (const [key, val] of Object.entries(params)) {
            if (val === undefined || val === null) continue;
            url.searchParams.append(key, String(val));
        }
    }

    const upperMethod = method.toUpperCase();
    const canHaveBody = ["POST", "PUT", "PATCH"].includes(upperMethod);
    const isFormData = body instanceof FormData;

    // 2) Auth
    const token = manualToken ?? (await getAuthTokenSafe());

    // 3) Headers & Body
    const finalHeaders = new Headers(headers || {});
    finalHeaders.set("Accept", "application/json, text/plain, */*");
    finalHeaders.set("Accept-Language", "en-US,en;q=0.9");
    finalHeaders.set("Accept-Encoding", "gzip, deflate, br");
    finalHeaders.set("Cache-Control", "no-cache");
    finalHeaders.set("Pragma", "no-cache");
    finalHeaders.set("X-Shopwice-Client", "ShopwiceVendorPWA/2.0");
    
    // Add browser-like headers to avoid blocking
    if (!finalHeaders.has("User-Agent")) {
        finalHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }
    
    // Add Referer to make it look like a browser request
    if (!finalHeaders.has("Referer") && typeof url !== 'undefined') {
        finalHeaders.set("Referer", `${BASE_URL}/`);
    }

    if (token) {
        finalHeaders.set("Authorization", `Bearer ${token}`);
    }

    if (process.env.NODE_ENV !== "production") {
        console.log(`[BACKEND FETCH] ${upperMethod} ${url.toString()} | Auth: ${token ? 'YES (Masked)' : 'NO'}`);
    }

    // Only set Content-Type when sending JSON body
    if (canHaveBody && body != null && !isFormData && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
    }

    const requestInit = {
        method: upperMethod,
        headers: finalHeaders,
        body: 
            canHaveBody && body != null 
                ? isFormData 
                    ? body 
                    : typeof body === "string" 
                        ? body 
                        : JSON.stringify(body) 
                : undefined, 
        ...rest, 
    };

    try {
        const res = await fetch(url.toString(), requestInit);

        if (process.env.NODE_ENV !== "production") {
            console.log(`[BACKEND RES] ${res.status} ${res.statusText} | ${url.pathname}`);
        }

        if (!res.ok && process.env.NODE_ENV !== "production") {
            try {
                const cloned = res.clone();
                const ct = cloned.headers.get("content-type") || "";
                if (ct.includes("application/json")) {
                    const j = await cloned.json();
                    console.error("[BACKEND ERROR BODY]:", j);
                } else {
                    const t = await cloned.text();
                    console.error("[BACKEND ERROR TEXT]:", t.slice(0, 400));
                }
            } catch (ignore) { }
        }

        return res;
    } catch (err) {
        console.error(`[FETCH FAIL] ${upperMethod} ${endpoint}:`, err?.message || err);
        throw err;
    }
}