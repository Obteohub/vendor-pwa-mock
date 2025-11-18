// src/app/api/vendor/attributes/[id]/terms/route.js
// Fetch terms for a specific attribute on-demand

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

export async function GET(request, { params }) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Missing authentication token.' },
                { status: 401 }
            );
        }

        // Await params in Next.js 15+
        const { id } = await params;
        const attributeId = id;
        console.log(`Fetching terms for attribute ${attributeId}`);

        // Use WooCommerce Store API endpoint for attribute terms
        const baseUrl = WC_API_URL.replace('/dokan/v1', '');
        const termsEndpoint = `${baseUrl}/wc/store/v1/products/attributes/${attributeId}/terms`;
        
        console.log(`Using endpoint: ${termsEndpoint}`);

        // Fetch ALL terms with pagination
        let allTerms = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 10) { // Max 10 pages = 1000 terms
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);

            try {
                const termsRes = await fetch(
                    `${termsEndpoint}?per_page=100&page=${page}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        cache: 'no-store',
                        signal: controller.signal,
                    }
                );

                clearTimeout(timeoutId);

                if (!termsRes.ok) {
                    const errorText = await termsRes.text();
                    console.error(`Terms fetch failed for attribute ${attributeId}, page ${page}:`, {
                        status: termsRes.status,
                        statusText: termsRes.statusText,
                        error: errorText
                    });
                    break;
                }

                const terms = await termsRes.json();
                console.log(`Raw terms response for attribute ${attributeId}:`, terms);
                
                if (Array.isArray(terms) && terms.length > 0) {
                    allTerms = [...allTerms, ...terms];
                    console.log(`Loaded ${terms.length} terms for attribute ${attributeId}, page ${page}`);
                }

                // Check if there are more pages
                const totalPages = parseInt(termsRes.headers.get('X-WP-TotalPages') || '1', 10);
                hasMore = page < totalPages && terms.length === 100;
                page++;

            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.error(`Timeout fetching terms page ${page} for attribute ${attributeId}`);
                }
                break;
            }
        }

        console.log(`Total terms loaded for attribute ${attributeId}: ${allTerms.length}`);

        return NextResponse.json({
            terms: allTerms.map(term => ({
                id: term.id,
                name: term.name,
                slug: term.slug
            })),
            total: allTerms.length
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'AbortError') {
            const { id } = await params;
            console.error(`Timeout fetching terms for attribute ${id}`);
            return NextResponse.json(
                { error: 'Request timeout', terms: [] },
                { status: 504 }
            );
        }

        console.error('Error fetching attribute terms:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error', terms: [] },
            { status: 500 }
        );
    }
}
