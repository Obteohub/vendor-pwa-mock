import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define the external API base URL for WooCommerce/Dokan (MUST be set in .env)
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;


export async function GET(request) {
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
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);

    try {
        // Fetch global attributes with pagination and timeout (increased to 45 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        // Exclude description, images, and custom fields to reduce payload
        const apiRes = await fetch(`${WC_API_URL}/products/attributes?per_page=${perPage}&page=${requestedPage}&_fields=id,name,slug`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const attributes = await apiRes.json();

        if (!apiRes.ok) {
            console.error('External API Error (Attributes):', attributes);
            return NextResponse.json(
                {
                    error: attributes.message || 'Failed to fetch product attributes from the store.',
                },
                { status: apiRes.status }
            );
        }

        // Don't fetch terms during initial load - too slow!
        // Terms will be fetched on-demand when user selects an attribute
        // Only essential fields, no images or custom fields
        const attributesWithTerms = attributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            slug: attr.slug,
            terms: [], // Empty for now - fetch on demand
            // Explicitly exclude: description, type, order_by, has_archives, image, meta, custom fields, etc.
        }));

        // Check if there are more pages
        const totalPages = parseInt(apiRes.headers.get('X-WP-TotalPages') || '1', 10);
        const hasMore = requestedPage < totalPages;

        return NextResponse.json(
            { 
                attributes: attributesWithTerms,
                page: requestedPage,
                per_page: perPage,
                has_more: hasMore
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Internal Server Error fetching attributes:', error);
        return NextResponse.json(
            // **CHANGE**: Return the specific error message on network failure
            { error: error.message || 'An internal server error occurred while fetching attributes.' },
            { status: 500 }
        );
    }
}
