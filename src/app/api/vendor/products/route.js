// src/app/api/vendor/products/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

// In-memory cache for products by user
const productsCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchAllProducts(token) {
    console.log('[PRODUCTS] Fetching all products from middleware...');
    
    let allProducts = [];
    let currentPage = 1;
    let hasMore = true;
    const maxPages = 100; // Increased safety limit

    while (hasMore && currentPage <= maxPages) {
        console.log(`[PRODUCTS] Fetching page ${currentPage} for token ${token.substring(0, 10)}...`);
        const fetchUrl = `vendor/products?per_page=100&page=${currentPage}`;
        console.log(`[PRODUCTS] Calling backend: ${fetchUrl}`);
        
        const res = await backendFetch('vendor/products', {
            params: {
                per_page: '100',
                page: String(currentPage),
                // status: 'any' is already handled by shopwice_vendor_get_products in shopwice-unified-api.php
                // but we can pass it anyway just in case.
                status: 'any',
                _fields: 'id,name,slug,status,price,regular_price,sale_price,stock_status,stock_quantity,images,date_created,categories,type,sku,image'
            },
            cache: 'no-store'
        });

        console.log(`[PRODUCTS] Backend response status: ${res.status}`);

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'No error body');
            console.log(`[PRODUCTS] Page ${currentPage} failed with status ${res.status}: ${errorText.slice(0, 100)}`);
            break;
        }

        const data = await res.json();
        
        if (data && data.message && !Array.isArray(data)) {
            console.log(`[PRODUCTS] Backend returned error message: ${data.message}`);
            // If it's a "no products found" type of message, we should just stop
            if (data.code === 'woocommerce_rest_cannot_view' || data.code === 'wcfm_rest_cannot_view') {
                console.log('[PRODUCTS] Permission denied or cannot view products');
                break;
            }
        }

        const products = Array.isArray(data) ? data : (data.products || data.items || data.data || []);
        
        console.log(`[PRODUCTS] Page ${currentPage} returned ${products.length} items`);
        
        if (products.length === 0) {
            console.log(`[PRODUCTS] No more products found on page ${currentPage}`);
            hasMore = false;
            break;
        }

        allProducts = [...allProducts, ...products];
        
        if (products.length < 100) {
            hasMore = false;
        } else {
            currentPage++;
            await new Promise(resolve => setTimeout(resolve, 100)); // Gentle delay
        }
    }

    console.log('[PRODUCTS] Fetched total:', allProducts.length, 'products');
    return allProducts;
}

/**
 * Handle GET requests for product lists through the middleware.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const requestedPage = parseInt(searchParams.get('page') || '1');
        const requestedPerPage = parseInt(searchParams.get('per_page') || '20');
        const forceRefresh = searchParams.get('refresh') === 'true';

        // Extract token
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('sw_token')?.value;
        console.log(`[PRODUCTS GET] Request for page ${requestedPage}, per_page ${requestedPerPage}. Token present: ${!!token}, Force: ${forceRefresh}`);

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Create cache key based on a hash of the token to ensure uniqueness per user
        // but avoid using the full token string as a key if it's extremely long.
        // We use the first 50 chars which is usually enough to include the unique payload part of a JWT.
        const cacheKey = token.length > 50 ? token.substring(token.length - 50) : token;
        const now = Date.now();
        const cached = productsCache.get(cacheKey);

        let allProducts;

        // Check if cache is valid (bypass if forceRefresh is true)
        if (!forceRefresh && cached && (now - cached.timestamp < CACHE_DURATION)) {
            console.log('[PRODUCTS] Serving from cache');
            allProducts = cached.data;
        } else {
            console.log(`[PRODUCTS] ${forceRefresh ? 'Forced refresh' : 'Cache miss'}, fetching fresh data`);
            allProducts = await fetchAllProducts(token);
            
            // Cache the products if we got something (or if we want to cache empty results)
            productsCache.set(cacheKey, {
                data: allProducts,
                timestamp: now
            });

            // Clean old cache entries (keep last 20 users)
            if (productsCache.size > 20) {
                const entries = Array.from(productsCache.entries());
                entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                entries.slice(0, entries.length - 20).forEach(([key]) => productsCache.delete(key));
            }
        }

        // Handle pagination on server side
        const startIndex = (requestedPage - 1) * requestedPerPage;
        const endIndex = startIndex + requestedPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        console.log(`[PRODUCTS] Returning ${paginatedProducts.length} products for page ${requestedPage}. Total products in memory: ${allProducts.length}`);

        const responseHeaders = new Headers();
        responseHeaders.set('X-WP-Total', allProducts.length.toString());
        responseHeaders.set('X-WP-TotalPages', Math.ceil(allProducts.length / requestedPerPage).toString());

        return NextResponse.json(paginatedProducts, {
            status: 200,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('[PRODUCTS] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Handle POST requests to create new products via middleware.
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        // --- 1. Construct Product Data ---
        // We transform the FormData into a JSON object for the middleware
        // This avoids complex multipart forwarding unless necessary for the enterprise API.
        const productData = {
            name: formData.get('name'),
            type: formData.get('productType') || 'simple',
            regular_price: formData.get('regular_price'),
            sale_price: formData.get('sale_price'),
            stock_quantity: parseInt(formData.get('stock_quantity') || '0', 10),
            description: formData.get('description'),
            short_description: formData.get('short_description'),
            sku: formData.get('sku'),
            status: 'pending',
            manage_stock: true
        };

        // Handle JSON-stringified fields
        const parseJson = (key) => {
            const val = formData.get(key);
            try { return val ? JSON.parse(val) : []; } catch (e) { return []; }
        };

        productData.categories = parseJson('category_ids_json').map(id => ({ id: parseInt(id, 10) }));
        productData.brands = parseJson('brand_ids_json').map(id => ({ id: parseInt(id, 10) }));
        productData.locations = parseJson('location_ids_json').map(id => ({ id: parseInt(id, 10) }));
        productData.attributes = parseJson('attributes_json');
        productData.variations = parseJson('variations_json');

        productData.dimensions = {
            length: formData.get('length') || '',
            width: formData.get('width') || '',
            height: formData.get('height') || ''
        };
        productData.weight = formData.get('weight') || '';

        // Handle images separately
        const imageFiles = formData.getAll('images[]');
        if (imageFiles && imageFiles.length > 0) {
            console.log(`[PRODUCTS] ${imageFiles.length} images found in request. Processing...`);
            const uploadResults = [];
            for (const file of imageFiles) {
                if (!(file instanceof File)) continue;
                const mediaForm = new FormData();
                mediaForm.append('file', file);
                const mediaRes = await backendFetch('vendor/media', { method: 'POST', body: mediaForm });
                if (mediaRes.ok) {
                    const mediaData = await mediaRes.json();
                    uploadResults.push({ id: mediaData.id, src: mediaData.source_url });
                }
            }
            productData.images = uploadResults;
        }

        console.log('[PRODUCTS] Sending creation request to middleware...');
        const res = await backendFetch('vendor/products', {
            method: 'POST',
            body: productData
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('[PRODUCTS] Creation failed:', errorData);
            return NextResponse.json(
                { error: errorData.message || 'Failed to create product via middleware' },
                { status: res.status }
            );
        }

        const newProduct = await res.json();
        return NextResponse.json({ message: 'Product created successfully', product: newProduct }, { status: 201 });

    } catch (error) {
        console.error('[PRODUCTS] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}