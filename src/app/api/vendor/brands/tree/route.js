// src/app/api/vendor/brands/tree/route.js
// Returns brands in tree structure for lazy loading

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_BRANDS_API_URL = process.env.NEXT_PUBLIC_WC_BRANDS_API_BASE_URL;

// Cache the response for 5 minutes
let cachedResponse = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  // Return cached response if still valid
  if (cachedResponse && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Returning cached brand tree');
    return NextResponse.json(cachedResponse, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sw_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Missing authentication token.' },
        { status: 401 }
      );
    }

    // Fetch ALL brands to build proper tree (resilient loading)
    let allBrands = [];
    let page = 1;
    let hasMore = true;
    const perPage = 20; // Moderate batch size
    let retries = 0;
    const maxRetries = 2;

    while (hasMore && page <= 50) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for slow servers

        // Only fetch minimal fields: id, name, slug, parent
        const res = await fetch(`${WC_BRANDS_API_URL}/products/brands?per_page=${perPage}&page=${page}&_fields=id,name,slug,parent`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          console.warn(`Brands tree page ${page} failed with status ${res.status}`);
          // Retry on failure
          if (retries < maxRetries) {
            retries++;
            console.log(`Retrying brands tree page ${page} (attempt ${retries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          break;
        }

        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log(`Brands tree page ${page} returned no data, stopping`);
          break;
        }

        allBrands = [...allBrands, ...data];
        console.log(`✓ Brands tree page ${page}: ${data.length} items (Total: ${allBrands.length})`);
        retries = 0; // Reset retries on success

        const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        hasMore = page < totalPages;
        page++;
        
        // Delay between requests
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Error fetching brands tree page ${page}:`, error.message);
        // Retry on timeout
        if (retries < maxRetries) {
          retries++;
          console.log(`Retrying brands tree page ${page} (attempt ${retries})...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        break;
      }
    }

    console.log(`✓ Total brands fetched: ${allBrands.length}`);

    if (allBrands.length === 0) {
      console.warn('⚠ No brands found in WooCommerce');
      return NextResponse.json({
        brands: [],
        total: 0,
        rootCount: 0,
        message: 'No brands found'
      }, { status: 200 });
    }

    // Build tree structure
    const buildTree = (brands, parentId = 0) => {
      return brands
        .filter(brand => (brand.parent || 0) === parentId)
        .map(brand => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          parent: brand.parent || 0,
          children: buildTree(brands, brand.id)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    const tree = buildTree(allBrands, 0);
    console.log(`✓ Built brand tree with ${tree.length} root brands`);

    const responseData = {
      brands: tree,
      total: allBrands.length,
      rootCount: tree.length
    };

    // Cache the response
    cachedResponse = responseData;
    cacheTimestamp = Date.now();

    return NextResponse.json(responseData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error fetching brand tree:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error fetching brands.' },
      { status: 500 }
    );
  }
}
