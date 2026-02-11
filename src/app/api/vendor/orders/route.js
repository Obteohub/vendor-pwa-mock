import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // 1. Prepare Backend Params
        const backendParams = {};

        // Forward all query params from frontend to backend
        searchParams.forEach((value, key) => {
            backendParams[key] = value;
        });

        // 2. Apply Defaults/Overrides
        
        // Map frontend "all" to backend "any"
        if (backendParams.status === 'all' || !backendParams.status) {
            backendParams.status = 'any';
        }

        // Default pagination
        if (!backendParams.per_page) {
            backendParams.per_page = '20';
        }

        // Force specific fields to ensure frontend has what it needs (and reduce payload)
        // Note: WCFM/WooCommerce might ignore this if not fully supported on custom endpoints, 
        // but it's good practice for standard REST endpoints.
        // We append to existing fields if any, or set defaults.
        // backendParams._fields = 'id,status,total,date_created,billing,line_items,currency,customer_id,vendor_order_details'; 

        console.log(`[ORDERS DEBUG] Proxied GET to vendor/orders. Params:`, backendParams);

        // 3. Call Backend
        const res = await backendFetch('vendor/orders', {
            params: backendParams,
            cache: 'no-store'
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'No error body');
            console.error(`[ORDERS ERROR] Backend returned ${res.status}:`, errorText);

            return NextResponse.json(
                { error: 'Backend order retrieval failed', status: res.status, details: errorText.slice(0, 200) },
                { status: res.status }
            );
        }

        const data = await res.json();
        console.log(`[ORDERS DEBUG] Backend returned ${Array.isArray(data) ? data.length : 'object'} orders`);

        // 4. Safe Data Extraction
        let orders = [];
        if (Array.isArray(data)) {
            orders = data;
        } else if (data && typeof data === 'object') {
            // WCFM or some WP plugins might wrap the response
            orders = data.orders || data.items || data.results || (data.data && Array.isArray(data.data) ? data.data : []);
        }

        // 5. Pagination Headers
        // WCFM/WP usually returns these headers. If missing, we calculate fallback.
        const totalHeader = res.headers.get('X-WP-Total');
        const totalPagesHeader = res.headers.get('X-WP-TotalPages');

        const total = totalHeader ? parseInt(totalHeader, 10) : orders.length;
        const perPage = parseInt(backendParams.per_page, 10);
        const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : (total > 0 ? Math.ceil(total / perPage) : 1);
        const currentPage = parseInt(backendParams.page || '1', 10);

        return NextResponse.json({
            orders: orders,
            pagination: {
                total: total,
                total_pages: totalPages,
                page: currentPage,
                per_page: perPage,
                has_more: currentPage < totalPages
            }
        }, {
            status: 200
        });

    } catch (error) {
        console.error('[ORDERS FATAL] Service Error:', error);
        return NextResponse.json({
            error: 'Internal service error fetching orders',
            message: error.message
        }, { status: 500 });
    }
}