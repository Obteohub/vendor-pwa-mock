import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";

// Remove edge runtime - it's causing issues with dynamic imports
// export const runtime = "edge";
export const revalidate = 600;

/**
 * GET /api/attributes/:id/terms
 * Optimized for Vendor selection (e.g., choosing specific colors or sizes)
 * - Super fast search: fetch 1–2 pages only
 * - Full list: batch parallel + early stop
 * - Edge cached
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ terms: [], total: 0 }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const searchQuery = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();

        // Prepare query params (remove keys we control)
        const queryParams = Object.fromEntries(searchParams.entries());
        delete queryParams.page;
        delete queryParams.per_page;
        delete queryParams.search;
        delete queryParams.q;

        const PER_PAGE = 100;
        const MAX_PAGES = 50; // Increased from 10
        const SEARCH_PAGES = 2; // still super fast, but better results than page 1 only

        const extractArray = (data) => {
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.terms)) return data.terms;
            if (Array.isArray(data?.data)) return data.data;
            if (Array.isArray(data?.data?.terms)) return data.data.terms;
            return [];
        };

        const fetchPage = async (page) => {
            try {
                const res = await backendFetch(`attributes/${id}/terms`, {
                    method: "GET",
                    params: {
                        ...queryParams,
                        per_page: String(PER_PAGE),
                        page: String(page),
                        ...(searchQuery ? { search: searchQuery } : {}),
                    },
                    next: { revalidate: 600 },
                });

                if (!res.ok) {
                    console.log(`[TERMS] Page ${page} failed: ${res.status}`);
                    return [];
                }
                const data = await res.json().catch(() => ({}));
                return extractArray(data);
            } catch (err) {
                console.error(`[TERMS] Error fetching page ${page}:`, err);
                return [];
            }
        };

        let allTerms = [];

        if (searchQuery) {
            // ✅ SUPER FAST SEARCH (1–2 pages max)
            const first = await fetchPage(1);
            if (first.length === 0) {
                allTerms = [];
            } else if (first.length < PER_PAGE) {
                allTerms = first;
            } else {
                const second = await fetchPage(2);
                allTerms = [...first, ...second];
            }
        } else {
            // ✅ FULL LIST (sequential + safe)
            let currentPage = 1;
            let hasMore = true;

            while (hasMore && currentPage <= MAX_PAGES) {
                const pageItems = await fetchPage(currentPage);
                
                if (pageItems.length === 0) {
                    hasMore = false;
                    break;
                }

                allTerms.push(...pageItems);
                console.log(`[TERMS] Fetched page ${currentPage}: ${pageItems.length} items`);

                if (pageItems.length < PER_PAGE) {
                    hasMore = false;
                } else {
                    currentPage++;
                    // Small delay to be gentle
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }

        // Deduplicate + sort for UX
        const uniqueTerms = Array.from(
            new Map(
                allTerms
                    .filter((t) => t && t.id != null)
                    .map((t) => [String(t.id), t])
            ).values()
        ).sort((a, b) => {
            const an = String(a?.name ?? a?.label ?? "");
            const bn = String(b?.name ?? b?.label ?? "");
            return an.localeCompare(bn, undefined, { sensitivity: "base", numeric: true });
        });

        return NextResponse.json(
            {
                terms: uniqueTerms,
                total: uniqueTerms.length,
                stats: { attributeId: id, mode: searchQuery ? "search" : "batch" },
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
                    "X-Attribute-Id": String(id),
                    "X-Terms-Query": searchQuery || "ALL",
                },
            }
        );
    } catch (error) {
        console.error("[ATTRIBUTE TERMS ERROR]", error?.message || error);
        return NextResponse.json({ terms: [], total: 0, error: true }, { status: 502 });
    }
}
