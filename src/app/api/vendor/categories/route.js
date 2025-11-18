import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Base WooCommerce/Dokan API URL
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

// Caching handled by Next.js

export async function GET(request) {
  try {
    // 🔹 Get authentication token from cookies
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
    const parentId = searchParams.get('parent'); // For lazy loading children
    const search = searchParams.get('search'); // For search functionality

    // 🔹 Try multiple endpoints (Dokan first, then WC v3)
    const baseEndpoints = [
      `${WC_API_URL}/products/categories`,
      `${WC_API_URL.replace('/dokan/v1', '/wc/v3')}/products/categories`
    ];

    let workingEndpoint = null;
    let allCategories = [];
    
    // Find working endpoint
    for (const baseEndpoint of baseEndpoints) {
      try {
        let testUrl = `${baseEndpoint}?per_page=10&page=1&_fields=id,name,slug,parent,count`;
        if (parentId) {
          testUrl += `&parent=${parentId}`;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const testRes = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = testRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && testRes.ok) {
          const testData = await testRes.json();
          if (Array.isArray(testData)) {
            workingEndpoint = baseEndpoint;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!workingEndpoint) {
      return NextResponse.json(
        { 
          categories: [], 
          page: requestedPage,
          per_page: perPage,
          has_more: false,
          error: 'Failed to connect to WooCommerce categories API'
        },
        { status: 200 }
      );
    }

    // If parentId is specified, fetch children of that parent (lazy loading)
    if (parentId) {
      try {
        const parentIdNum = parseInt(parentId, 10);
        
        // Try to fetch with parent filter (WooCommerce v3 supports this)
        let endpoint = `${workingEndpoint}?per_page=100&parent=${parentIdNum}&_fields=id,name,slug,parent,count`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
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

        if (res.ok) {
          const data = await res.json();
          const children = Array.isArray(data) ? data : [];
          
          // Filter to ensure we only get direct children
          const directChildren = children.filter(cat => (cat.parent || 0) === parentIdNum);
          
          const formatted = directChildren.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent: cat.parent || 0,
            count: cat.count || 0,
          }));

          return NextResponse.json(
            { 
              categories: formatted,
              page: 1,
              per_page: perPage,
              total: formatted.length,
              has_more: false
            },
            { status: 200 }
          );
        }
        
        // If parent filter doesn't work, fetch all and filter (fallback)
        // This is less efficient but works as fallback
        console.warn('Parent filter not supported, fetching all categories to filter');
        const allCats = [];
        const maxPages = 30;
        const fetchPerPage = 100;
        
        for (let page = 1; page <= maxPages; page++) {
          const fallbackEndpoint = `${workingEndpoint}?per_page=${fetchPerPage}&page=${page}&_fields=id,name,slug,parent,count`;
          const fallbackController = new AbortController();
          const fallbackTimeout = setTimeout(() => fallbackController.abort(), 30000);
          
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
            signal: fallbackController.signal,
          });

          clearTimeout(fallbackTimeout);

          if (!fallbackRes.ok) break;

          const pageData = await fallbackRes.json();
          if (!Array.isArray(pageData) || pageData.length === 0) break;
          
          allCats.push(...pageData);
          
          if (pageData.length < fetchPerPage) break;
        }
        
        // Filter by parent
        const directChildren = allCats.filter(cat => (cat.parent || 0) === parentIdNum);
        
        const formatted = directChildren.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parent: cat.parent || 0,
          count: cat.count || 0,
        }));

        return NextResponse.json(
          { 
            categories: formatted,
            page: 1,
            per_page: perPage,
            total: formatted.length,
            has_more: false
          },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error fetching children:', error);
        return NextResponse.json(
          { 
            categories: [], 
            page: 1,
            per_page: perPage,
            has_more: false,
            error: error.message
          },
          { status: 200 }
        );
      }
    }

    // For root categories (parent=0), fetch with pagination
    // Fetch requested page only (server-side pagination)
    const fetchPerPage = 100; // Fetch more per page to reduce requests
    
    try {
      // Fetch root categories (parent=0) - WooCommerce API supports this
      let endpoint = `${workingEndpoint}?per_page=${fetchPerPage}&page=${requestedPage}&parent=0&_fields=id,name,slug,parent,count`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
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

      if (!res.ok) {
        // If parent=0 doesn't work, try without it
        const fallbackEndpoint = `${workingEndpoint}?per_page=${fetchPerPage}&page=${requestedPage}&_fields=id,name,slug,parent,count`;
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-store',
        });
        
        if (!fallbackRes.ok) {
          throw new Error(`Failed to fetch: ${fallbackRes.status}`);
        }
        
        const fallbackData = await fallbackRes.json();
        if (!Array.isArray(fallbackData)) {
          throw new Error('Invalid response format');
        }
        
        // Filter root categories (parent=0) from the response
        const rootCategories = fallbackData.filter(cat => (cat.parent || 0) === 0);
        
        const formatted = rootCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parent: cat.parent || 0,
          count: cat.count || 0,
        }));

        const totalPages = parseInt(fallbackRes.headers.get('X-WP-TotalPages') || '1', 10);
        const hasMore = requestedPage < totalPages;

        return NextResponse.json(
          { 
            categories: formatted,
            page: requestedPage,
            per_page: perPage,
            total: formatted.length,
            has_more: hasMore
          },
          { status: 200 }
        );
      }

      const pageData = await res.json();
      if (!Array.isArray(pageData)) {
        throw new Error('Invalid response format');
      }

      // Format categories
      const formatted = pageData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent || 0,
        count: cat.count || 0,
      }));

      // Check if there are more pages
      const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
      const hasMore = requestedPage < totalPages;

      console.log(`Categories API: Page ${requestedPage}, returning ${formatted.length} root categories (has_more: ${hasMore})`);

      return NextResponse.json(
        { 
          categories: formatted,
          page: requestedPage,
          per_page: perPage,
          total: formatted.length,
          has_more: hasMore
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { 
          categories: [], 
          page: requestedPage,
          per_page: perPage,
          has_more: false,
          error: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // 🔹 Detailed logging for debugging
    console.error('--- CATEGORY FETCH ERROR ---');
    console.error(`URL: ${WC_API_URL}/products/categories`);
    console.error(`Error: ${error.message}`);
    console.error('Potential causes: bad WC_API_BASE_URL, server auth issue, or blocked REST access.');
    console.error('-----------------------------');

    return NextResponse.json(
      { error: error.message || 'Internal error fetching categories.' },
      { status: 500 }
    );
  }
}
