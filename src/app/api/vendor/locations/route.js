import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

// In-memory cache for locations
let locationsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function extractArray(obj) {
    if (Array.isArray(obj)) return obj;
    if (!obj || typeof obj !== 'object') return [];

    // Standard paths
    if (Array.isArray(obj.locations)) return obj.locations;
    if (Array.isArray(obj.data?.locations)) return obj.data.locations;
    if (Array.isArray(obj.data)) return obj.data;
    if (obj.success && Array.isArray(obj.data)) return obj.data;

    // Aggressive search: Find the first property that is an array
    const firstArray = Object.values(obj).find(val => Array.isArray(val));
    if (firstArray) return firstArray;

    console.warn('[LOCATIONS] Could not find array in response:', typeof obj);
    return [];
}

function standardizeLocations(locations) {
    if (!Array.isArray(locations)) return [];

    const standardized = locations.map(loc => {
        const id = loc.id || loc.term_id || loc.id_location || loc.ID;
        const parent = loc.parent || loc.term_parent || loc.location_parent || 0;

        return {
            id: id ? Number(id) : null,
            name: loc.name || loc.title || loc.label || 'Unnamed Location',
            parent: parent ? Number(parent) : 0,
            slug: loc.slug || '',
            count: Number(loc.count || 0)
        };
    }).filter(loc => loc.id);

    console.log(`[LOCATIONS] Standardized ${standardized.length} items from ${locations.length} raw items`);
    return standardized;
}

async function fetchAllLocations() {
    console.log('[LOCATIONS] Fetching fresh location data...');

    const PER_PAGE = 100;
    const MAX_PAGES = 10;
    
    try {
        // 1. Fetch Page 1
        console.log('[LOCATIONS] Fetching page 1...');
        const p1Res = await backendFetch("locations", {
            method: "GET",
            params: { per_page: String(PER_PAGE), page: '1' },
            next: { revalidate: 600 },
        });

        if (!p1Res.ok) return [];

        const p1Data = await p1Res.json().catch(() => ({}));
        const p1Raw = extractArray(p1Data);
        const p1Locations = standardizeLocations(p1Raw);
        
        let allLocations = [...p1Locations];

        // If less than full page, we are done
        if (p1Raw.length < PER_PAGE) {
            console.log('[LOCATIONS] Success: Found', allLocations.length, 'locations (Single page)');
            return allLocations;
        }

        // 2. Fetch remaining pages in batches (safe concurrency)
        const remainingPages = Array.from({ length: MAX_PAGES - 1 }, (_, i) => i + 2);
        const BATCH_SIZE = 3;

        console.log(`[LOCATIONS] Fetching pages ${remainingPages[0]}-${remainingPages[remainingPages.length-1]} in batches of ${BATCH_SIZE}...`);

        for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
            const batch = remainingPages.slice(i, i + BATCH_SIZE);
            console.log(`[LOCATIONS] Processing batch: ${batch.join(', ')}`);

            const batchResults = await Promise.all(
                batch.map(async (page) => {
                    try {
                        const res = await backendFetch("locations", {
                            method: "GET",
                            params: { per_page: String(PER_PAGE), page: String(page) },
                            next: { revalidate: 600 },
                        });
                        
                        if (!res.ok) return [];
                        const data = await res.json().catch(() => ({}));
                        const raw = extractArray(data);
                        return standardizeLocations(raw);
                    } catch (err) {
                        console.error(`[LOCATIONS] Error fetching page ${page}:`, err);
                        return [];
                    }
                })
            );

            // Flatten batch results
            batchResults.forEach(locs => {
                if (locs && locs.length > 0) {
                    allLocations = [...allLocations, ...locs];
                }
            });
        }

        console.log(`[LOCATIONS] Success: Found ${allLocations.length} locations total`);
        
        // Deduplicate by ID just in case
        const uniqueLocations = Array.from(
            new Map(allLocations.map(loc => [loc.id, loc])).values()
        );

        return uniqueLocations;
    } catch (err) {
        console.error('[LOCATIONS FETCH ERROR]', err);
        return [];
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';

        // Check if cache is valid
        const now = Date.now();
        const cacheIsValid = !forceRefresh && locationsCache && locationsCache.length > 0 && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);

        if (!cacheIsValid) {
            console.log('[LOCATIONS] Cache miss, expired, or forced refresh. Fetching fresh data...');
            const freshData = await fetchAllLocations();

            // Cache data if fetched (even if empty, as long as the fetch didn't fail catastrophically)
            locationsCache = freshData || [];
            cacheTimestamp = now;
        } else {
            console.log(`[LOCATIONS] Serving ${locationsCache.length} items from cache`);
        }

        return NextResponse.json({
            locations: locationsCache,
            total: locationsCache.length
        }, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
            }
        });

    } catch (error) {
        console.error('[LOCATIONS ERROR]', error);
        return NextResponse.json({ locations: [], total: 0, error: true }, { status: 200 });
    }
}
