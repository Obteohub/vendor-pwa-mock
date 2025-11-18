// src/app/api/vendor/locations/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Base WooCommerce/Dokan API URL
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;


export async function GET(request) {
  try {
    // Get authentication token from cookies
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

    // Fetch ONLY the requested page (exclude description, images, and custom fields to reduce payload)
    const wpApiUrl = WC_API_URL.replace('/dokan/v1', '/wp/v2');
    const endpoint = `${wpApiUrl}/product_location?per_page=${perPage}&page=${requestedPage}&_fields=id,name,slug,parent,count`;

    // Add timeout - longer for locations as they can be slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

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

    const data = await res.json();

    // Handle non-OK responses
    if (!res.ok) {
      console.error('External API Error (Locations):', data);
      
      // If 404, return empty array instead of error
      if (res.status === 404) {
        console.warn('Product location taxonomy not found. Returning empty array.');
        return NextResponse.json({ 
          locations: [],
          page: requestedPage,
          per_page: perPage,
          has_more: false
        }, { status: 200 });
      }
      
      return NextResponse.json(
        {
          error:
            data.message ||
            'Failed to fetch product locations. Ensure the product_location taxonomy exists.',
        },
        { status: res.status }
      );
    }

    // Format and build hierarchical structure (only essential fields, no images or custom fields)
    const formatted = data.map((loc) => ({
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      parent: loc.parent || 0,
      count: loc.count,
      // Explicitly exclude: description, image, meta, custom fields, etc.
    }));

    // Build hierarchical structure
    const buildHierarchy = (locations, parentId = 0, level = 0) => {
      const result = [];
      const children = locations.filter(loc => loc.parent === parentId);
      
      children.forEach(loc => {
        result.push({
          ...loc,
          level,
          displayName: '—'.repeat(level) + (level > 0 ? ' ' : '') + loc.name
        });
        // Recursively add children
        result.push(...buildHierarchy(locations, loc.id, level + 1));
      });
      
      return result;
    };

    const hierarchical = buildHierarchy(formatted);

    // Check if there are more pages
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const hasMore = requestedPage < totalPages;

    return NextResponse.json(
      { 
        locations: hierarchical,
        page: requestedPage,
        per_page: perPage,
        has_more: hasMore
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('--- LOCATION FETCH ERROR ---');
    console.error(`URL: ${WC_API_URL}/products/product-location`);
    console.error(`Error: ${error.message}`);
    console.error('-----------------------------');

    return NextResponse.json(
      { error: error.message || 'Internal error fetching locations.' },
      { status: 500 }
    );
  }
}

