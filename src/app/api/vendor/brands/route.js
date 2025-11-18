// src/app/api/vendor/brands/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// WooCommerce API base URL for brands (v2 API)
// Brands endpoint: /wp-json/wc/v2/products/brands
const WC_BRANDS_API_URL = process.env.NEXT_PUBLIC_WC_BRANDS_API_URL || 
                          'https://shopwice.com/wp-json/wc/v2';


export async function GET(request) {
    try {
        // 🔹 Retrieve authentication token
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Missing authentication token.' },
                { status: 401 }
            );
        }
        
        // Get pagination params from URL
        const { searchParams } = new URL(request.url);
        const requestedPage = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('per_page') || '50', 10);
        
        // 🔹 Fetch ONLY the requested page (exclude description, images, and custom fields to reduce payload)
        const endpoint = `${WC_BRANDS_API_URL}/products/brands?per_page=${perPage}&page=${requestedPage}&_fields=id,name,slug,parent`;

        // Add timeout (increased to 45 seconds for slow WooCommerce responses)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`, 
            },
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type');
        let brandsData = null;

        if (contentType && contentType.includes('application/json')) {
            brandsData = await res.json();
        } else {
            // HTML response - API error
            console.error('Brands API returned HTML instead of JSON');
            return NextResponse.json({ 
                brands: [], 
                page: requestedPage,
                per_page: perPage,
                has_more: false 
            }, { status: 200 });
        }

        if (!res.ok) {
            // If brands endpoint doesn't exist (404), return empty array instead of error
            if (res.status === 404) {
                console.warn('Brands endpoint not found. Brands feature may not be enabled on WooCommerce.');
                return NextResponse.json({ 
                    brands: [], 
                    page: requestedPage,
                    per_page: perPage,
                    has_more: false 
                }, { status: 200 });
            }
            
            // Forward other error details from WooCommerce
            const errorMessage = brandsData.message || 'Failed to fetch brands from WooCommerce REST API.';
            const errorDetails = brandsData.data?.details || {};
            
            return NextResponse.json(
                { 
                    error: errorMessage, 
                    details: errorDetails,
                    status: res.status 
                },
                { status: res.status }
            );
        }

        // The WooCommerce API for taxonomies returns an array directly.
        if (!Array.isArray(brandsData)) {
            return NextResponse.json(
                { error: 'Brands API returned invalid data structure.' },
                { status: 500 }
            );
        }

        // 🔹 Format and sort brand data alphabetically (only essential fields, no images or custom fields)
        const formatted = brandsData.map((brand) => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            parent: brand.parent || 0,
            // Explicitly exclude: description, image, meta, custom fields, url, etc.
        }));

        // 🔹 Build hierarchical structure for brands (if they have parent-child relationships)
        const buildHierarchy = (brands, parentId = 0, level = 0) => {
            const result = [];
            const children = brands.filter(brand => brand.parent === parentId);
            
            // Sort alphabetically
            children.sort((a, b) => a.name.localeCompare(b.name));
            
            children.forEach(brand => {
                result.push({
                    ...brand,
                    level,
                    displayName: '—'.repeat(level) + (level > 0 ? ' ' : '') + brand.name
                });
                // Recursively add children
                result.push(...buildHierarchy(brands, brand.id, level + 1));
            });
            
            return result;
        };

        const hierarchical = buildHierarchy(formatted);

        // Check if there are more pages
        const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        const hasMore = requestedPage < totalPages;

        return NextResponse.json({ 
            brands: hierarchical,
            page: requestedPage,
            per_page: perPage,
            has_more: hasMore
        }, { status: 200 });
    } catch (error) {
        console.error('Internal Server Error fetching brands:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to load vendor brands due to a network error.' },
            { status: 500 }
        );
    }
}
