//src/app/api/products/route.js
import { NextResponse } from "next/server";

// IMPORTANT: Prevents Next.js from caching the response (but client-side cache still works)
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 🔐 Get JWT token from cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/sw_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: missing token" },
        { status: 401 }
      );
    }

    // ✅ Fetch Dokan REST API vendor products with timeout
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20'; // Increased default from 10 to 20
    
    // Use multiple fallbacks for the base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.NEXT_PUBLIC_WORDPRESS_URL || 
                    process.env.NEXT_PUBLIC_WC_API_BASE_URL?.replace('/wp-json/dokan/v1', '') ||
                    'https://shopwice.com';
    
    const apiUrl = `${baseUrl}/wp-json/dokan/v1/products?page=${page}&per_page=${perPage}`;
    
    // Debug logging for production
    console.log('Products API - Base URL:', baseUrl);
    console.log('Products API - Full URL:', apiUrl);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced to 8s for faster failure

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Allow Next.js to cache for a short time (client-side cache handles the rest)
        next: { revalidate: 30 }, // Revalidate every 30 seconds
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Dokan API Error:", errorData);
        return NextResponse.json(
          { message: errorData.message || "Failed to fetch products" },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Ensure we return an array
      const products = Array.isArray(data) ? data : [];
      
      return NextResponse.json(products, { 
        status: 200,
        headers: {
          // Add cache headers for client-side caching
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("WooCommerce API timeout");
        return NextResponse.json(
          { message: "Request timeout. The WooCommerce server is taking too long to respond." },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
