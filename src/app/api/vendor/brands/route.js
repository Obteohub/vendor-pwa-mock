import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

// In-memory cache for brands
let brandsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function extractArray(obj) {
    if (Array.isArray(obj)) return obj;
    if (Array.isArray(obj?.brands)) return obj.brands;
    if (Array.isArray(obj?.data?.brands)) return obj.data.brands;
    if (Array.isArray(obj?.data)) return obj.data;
    return [];
}

async function fetchAllBrands() {
    console.log('[BRANDS] Fetching all brands from middleware...');
    
    let allBrands = [];
    let currentPage = 1;
    let hasMore = true;
    const maxPages = 50; // Reduced from 200 to prevent 20k fetch
    const PER_PAGE = 100;
    const seenIds = new Set();

    while (hasMore && currentPage <= maxPages) {
        try {
            const res = await backendFetch("brands", {
                method: "GET",
                params: { per_page: String(PER_PAGE), page: currentPage.toString() },
                next: { revalidate: 600 },
            });
            
            if (!res.ok) {
                console.log(`[BRANDS] Page ${currentPage} failed with status ${res.status}`);
                break;
            }
            
            const data = await res.json().catch(() => null);
            if (!data) break;

            const pageBrands = extractArray(data);
            
            if (pageBrands.length === 0) {
                hasMore = false;
                break;
            }

            // Normalize and deduplicate immediately
            const normalizedBrands = pageBrands
                .map(b => ({
                    ...b,
                    id: b.id || b.term_id,
                    name: b.name || b.title,
                    parent: b.parent || 0
                }))
                .filter(b => b.id && !seenIds.has(String(b.id)));

            normalizedBrands.forEach(b => seenIds.add(String(b.id)));
            allBrands = [...allBrands, ...normalizedBrands];
            
            console.log(`[BRANDS] Page ${currentPage}: fetched ${pageBrands.length} items, ${normalizedBrands.length} new. Total unique: ${allBrands.length}`);

            // STOP if we have reached a reasonable limit for unique brands to prevent runaway fetch
            if (allBrands.length >= 5000) {
                console.log('[BRANDS] Safety limit of 5000 unique brands reached. Stopping.');
                hasMore = false;
                break;
            }

            if (pageBrands.length < PER_PAGE) {
                hasMore = false;
            } else {
                currentPage++;
                await new Promise(resolve => setTimeout(resolve, 100)); // Gentle delay
            }
        } catch (err) {
            console.error(`[BRANDS] Error fetching page ${currentPage}:`, err);
            break;
        }
    }
    
    console.log('[BRANDS] Sync complete. Total unique brands:', allBrands.length);
    return allBrands;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchQuery = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();

        // Check if cache is valid
        const now = Date.now();
        const cacheIsValid = brandsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);

        if (!cacheIsValid) {
            console.log('[BRANDS] Cache miss or expired, fetching fresh data');
            const freshData = await fetchAllBrands();
            
            // If we got nothing from the middleware, return empty instead of caching null
            brandsCache = freshData && freshData.length > 0 ? freshData : [];
            cacheTimestamp = now;
        } else {
            console.log('[BRANDS] Serving from cache');
        }

        let allBrands = [...(brandsCache || [])];

        // Filter by search query if provided
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            allBrands = allBrands.filter(b => 
                b.name?.toLowerCase().includes(lowerQuery) ||
                b.slug?.toLowerCase().includes(lowerQuery)
            );
        }

        // Deduplicate + sort
        let uniqueBrands = Array.from(
            new Map(
                allBrands
                    .filter((b) => b && b.id != null)
                    .map((b) => [String(b.id), b])
            ).values()
        ).sort((a, b) => {
            const an = String(a?.name ?? "");
            const bn = String(b?.name ?? "");
            return an.localeCompare(bn, undefined, { sensitivity: "base" });
        });

        // Return flat list because clients (BrandTreeSelector, DataSyncService) expect flat list
        // and build the tree themselves.
        return NextResponse.json({
            brands: uniqueBrands,
            total: uniqueBrands.length
        }, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
                "X-Brands-Query": searchQuery || "ALL",
            }
        });

    } catch (error) {
        console.error('[BRANDS ERROR]', error);
        return NextResponse.json({ brands: [], total: 0, error: true }, { status: 200 });
    }
}
