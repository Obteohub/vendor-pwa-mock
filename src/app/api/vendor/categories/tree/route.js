// src/app/api/vendor/categories/tree/route.js
// Returns categories in tree structure for lazy loading

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

// Cache the response for 5 minutes
let cachedResponse = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  // Return cached response if still valid
  if (cachedResponse && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Returning cached category tree');
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

    // Get parent parameter (default to 0 for root categories)
    const { searchParams } = new URL(request.url);
    const parentId = parseInt(searchParams.get('parent') || '0', 10);

    // Fetch ALL categories to build proper tree
    let allCategories = [];
    let page = 1;
    let hasMore = true;

    const endpoints = [
      `${WC_API_URL}/products/categories`,
      `${WC_API_URL.replace('/dokan/v1', '/wc/v3')}/products/categories`
    ];

    while (hasMore && page <= 20) {
      let data = null;
      let res = null;

      for (const baseEndpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000);

          // Only fetch minimal fields: id, name, slug, parent, count
          res = await fetch(`${baseEndpoint}?per_page=100&page=${page}&_fields=id,name,slug,parent,count`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (error) {
          console.error(`Error fetching categories page ${page}:`, error.message);
          continue;
        }
      }

      if (!res || !res.ok || !data || !Array.isArray(data)) {
        break;
      }

      allCategories = [...allCategories, ...data];
      console.log(`Loaded categories page ${page}: ${data.length} items (Total: ${allCategories.length})`);

      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    }

    console.log(`Total categories fetched: ${allCategories.length}`);

    // Build tree structure
    const buildTree = (categories, parentId = 0) => {
      return categories
        .filter(cat => cat.parent === parentId)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parent: cat.parent,
          count: cat.count || 0,
          children: buildTree(categories, cat.id)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    const tree = buildTree(allCategories, parentId);
    console.log(`Built tree with ${tree.length} root categories`);

    const responseData = {
      categories: tree,
      total: allCategories.length,
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
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error fetching categories.' },
      { status: 500 }
    );
  }
}

