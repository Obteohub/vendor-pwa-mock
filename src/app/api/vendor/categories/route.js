import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

// Remove edge runtime - it's causing issues with dynamic imports
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 600;

// In-memory cache for categories
let categoriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function extractArray(obj) {
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj?.categories)) return obj.categories;
  if (Array.isArray(obj?.data?.categories)) return obj.data.categories;
  if (Array.isArray(obj?.data)) return obj.data;
  return [];
}

async function fetchAllCategories() {
  console.log('[CATEGORIES] Fetching all categories from middleware...');
  
  let allCategories = [];
  let currentPage = 1;
  let hasMore = true;
  const maxPages = 100; // Increased from 50 to 100 for very large catalogs
  const seenIds = new Set(); // To prevent duplicates

  while (hasMore && currentPage <= maxPages) {
    const res = await backendFetch('categories', {
      params: {
        per_page: '100',
        page: currentPage.toString(),
        hide_empty: 'false' // Ensure we get all categories regardless of product count
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.log('[CATEGORIES] Page', currentPage, 'failed with status', res.status, 'stopping');
      break;
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      console.log('[CATEGORIES] Page', currentPage, 'returned no data, stopping');
      break;
    }

    const rawCategories = extractArray(data);
    
    if (rawCategories.length === 0) {
      hasMore = false;
      break;
    }

    // Normalize and add to collection
    const normalized = rawCategories
      .map(cat => ({
        ...cat,
        id: parseInt(cat.id || cat.term_id || 0, 10),
        parent: parseInt(cat.parent || 0, 10)
      }))
      .filter(cat => cat.id > 0 && !seenIds.has(cat.id));

    normalized.forEach(cat => seenIds.add(cat.id));
    allCategories = [...allCategories, ...normalized];
    console.log(`[CATEGORIES] Fetched page ${currentPage}: ${normalized.length} items`);
    
    // If we got less than 100, we've reached the end
    if (rawCategories.length < 100) {
      hasMore = false;
    } else {
      currentPage++;
      // Small delay to be gentle on the backend
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('[CATEGORIES] Fetched total:', allCategories.length, 'categories');
  return allCategories;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPage = parseInt(searchParams.get('page') || '1');
    const requestedPerPage = parseInt(searchParams.get('per_page') || '50');

    // Check if cache is valid
    const now = Date.now();
    const cacheIsValid = categoriesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);

    if (!cacheIsValid) {
      console.log('[CATEGORIES] Cache miss or expired, fetching fresh data');
      categoriesCache = await fetchAllCategories();
      cacheTimestamp = now;
    } else {
      console.log('[CATEGORIES] Serving from cache');
    }

    // Handle pagination from cache
    let paginatedCategories;
    if (requestedPerPage === -1) {
      paginatedCategories = categoriesCache;
      console.log('[CATEGORIES] Returning ALL:', paginatedCategories.length, 'categories');
    } else {
      const startIndex = (requestedPage - 1) * requestedPerPage;
      const endIndex = startIndex + requestedPerPage;
      paginatedCategories = categoriesCache.slice(startIndex, endIndex);
      console.log('[CATEGORIES] Returning:', paginatedCategories.length, 'categories for page', requestedPage);
    }

    const responseHeaders = new Headers();
    responseHeaders.set('X-WP-Total', categoriesCache.length.toString());
    responseHeaders.set('X-WP-TotalPages', requestedPerPage === -1 ? '1' : Math.ceil(categoriesCache.length / requestedPerPage).toString());

    return NextResponse.json(paginatedCategories, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('[CATEGORIES] Error:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
