// src/app/api/vendor/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[ORDERS] Fetching order #${id} via middleware...`);

        const res = await backendFetch(`vendor/orders/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            const text = await res.text().catch(() => 'Unknown error');
            let errorMessage = `Failed to fetch order #${id}`;
            try {
                const errorData = JSON.parse(text);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.error(`[ORDERS] Middleware returned non-JSON error for order #${id}:`, text.slice(0, 200));
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('[ORDERS] Detail GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
