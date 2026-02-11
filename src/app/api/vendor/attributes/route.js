import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";

export const dynamic = 'force-dynamic';
export const revalidate = 600;

// In-memory cache for attributes
let attributesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function extractArray(obj) {
    if (Array.isArray(obj)) return obj;
    if (Array.isArray(obj?.attributes)) return obj.attributes;
    if (Array.isArray(obj?.data?.attributes)) return obj.data.attributes;
    if (Array.isArray(obj?.data)) return obj.data;
    return [];
}

async function fetchAllAttributes() {
    console.log('[ATTRIBUTES] Fetching all attributes from middleware...');
    
    let allAttributes = [];
    let currentPage = 1;
    let hasMore = true;
    const maxPages = 50; // Increased limit
    const PER_PAGE = 100;

    while (hasMore && currentPage <= maxPages) {
        try {
            const res = await backendFetch("attributes", {
                method: "GET",
                params: { per_page: String(PER_PAGE), page: currentPage.toString() },
                next: { revalidate: 600 },
            });
            
            if (!res.ok) {
                console.log(`[ATTRIBUTES] Page ${currentPage} failed with status ${res.status}`);
                break;
            }
            
            const data = await res.json().catch(() => null);
            if (!data) {
                console.log(`[ATTRIBUTES] Page ${currentPage} returned invalid JSON`);
                break;
            }

            console.log(`[ATTRIBUTES] Page ${currentPage} raw data keys:`, Object.keys(data));
            const pageItems = extractArray(data);
            
            if (pageItems.length === 0) {
                console.log(`[ATTRIBUTES] Page ${currentPage} extracted 0 items. Full data:`, JSON.stringify(data).substring(0, 200));
                hasMore = false;
                break;
            }

            allAttributes = [...allAttributes, ...pageItems];
            console.log(`[ATTRIBUTES] Fetched page ${currentPage}: ${pageItems.length} items`);

            if (pageItems.length < PER_PAGE) {
                hasMore = false;
            } else {
                currentPage++;
                // Small delay to be gentle
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (err) {
            console.error(`[ATTRIBUTES] Error fetching page ${currentPage}:`, err);
            break;
        }
    }

    console.log('[ATTRIBUTES] Fetched total:', allAttributes.length, 'attributes');
    return allAttributes;
}

export async function GET(request) {
    try {
        // Check if cache is valid
        const now = Date.now();
        const cacheIsValid = attributesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);

        if (!cacheIsValid) {
            console.log('[ATTRIBUTES] Cache miss or expired, fetching fresh data');
            const freshData = await fetchAllAttributes();
            
            // Ensure we cache an empty array if nothing is returned, instead of null
            attributesCache = freshData && freshData.length > 0 ? freshData : [];
            cacheTimestamp = now;
        } else {
            console.log('[ATTRIBUTES] Serving from cache');
        }

        return NextResponse.json({
            attributes: attributesCache || [],
            total: (attributesCache || []).length
        }, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
            }
        });

    } catch (error) {
        console.error('[ATTRIBUTES ERROR]', error);
        return NextResponse.json({ attributes: [], total: 0, error: true }, { status: 200 });
    }
}
