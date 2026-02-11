import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor/account
 * Returns: Authenticated vendor's profile and marketplace statistics.
 * Optimized: Uses the high-speed Shopwice Unified API.
 */
export async function GET(request) {
    try {
        console.log('[ACCOUNT API] Fetching account data (via Middleware)...');

        const res = await backendFetch('vendor/account', { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Failed to load account' }, { status: res.status });
        }

        // Standardize response for the frontend
        // If data already has profile and stats, return as is or map accordingly.
        const responseData = {
            profile: data.profile || data,
            stats: data.stats || { total_sales: 0, total_orders: 0, product_count: 0 }
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('[ACCOUNT API ERROR]', error);
        return NextResponse.json({ error: 'Failed to load account data' }, { status: 500 });
    }
}

/**
 * PUT /api/vendor/account
 * Updates the authenticated vendor's profile.
 */
export async function PUT(request) {
    try {
        const body = await request.json();

        console.log('[ACCOUNT API] Updating vendor profile...');

        const res = await backendFetch('vendor/account', {
            method: 'PUT',
            body: body,
            cache: 'no-store'
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Update failed' }, { status: res.status });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: data
        }, { status: 200 });

    } catch (error) {
        console.error('[ACCOUNT UPDATE ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
