// src/app/api/vendor/orders/[id]/route.js
// Fetch single order details - OPTIMIZED

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
        const orderId = id;

        console.log(`Fetching order details for order ${orderId}`);

        // Fetch order with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

        try {
            const orderRes = await fetch(
                `${WC_API_URL}/orders/${orderId}`,
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

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                console.error(`Order fetch failed:`, {
                    status: orderRes.status,
                    statusText: orderRes.statusText,
                    error: errorText
                });
                return NextResponse.json(
                    { error: 'Failed to fetch order' },
                    { status: orderRes.status }
                );
            }

            const order = await orderRes.json();
            console.log(`✓ Loaded order ${orderId}`);

            return NextResponse.json({ order }, { 
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
                }
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Order fetch timeout');
                return NextResponse.json(
                    { error: 'Request timeout' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}
