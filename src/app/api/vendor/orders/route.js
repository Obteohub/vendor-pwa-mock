// src/app/api/vendor/orders/route.js
// Fetch vendor orders from Dokan - OPTIMIZED for fast loading

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;


export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Missing authentication token.' },
                { status: 401 }
            );
        }

        // Get pagination and filter params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('per_page') || '20', 10);
        const status = searchParams.get('status') || ''; // all, pending, processing, completed, etc.

        console.log(`Fetching orders: page=${page}, per_page=${perPage}, status=${status}`);

        // Build query params - ONLY fetch essential fields for list view
        const queryParams = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            // Exclude heavy fields to reduce payload size
            _fields: 'id,status,date_created,total,billing.first_name,billing.last_name,billing.email,currency'
        });

        if (status && status !== 'all') {
            queryParams.append('status', status);
        }

        // Fetch orders with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            const ordersRes = await fetch(
                `${WC_API_URL}/orders?${queryParams.toString()}`,
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

            if (!ordersRes.ok) {
                const errorText = await ordersRes.text();
                console.error(`Orders fetch failed:`, {
                    status: ordersRes.status,
                    statusText: ordersRes.statusText,
                    error: errorText
                });
                return NextResponse.json(
                    { error: 'Failed to fetch orders', orders: [] },
                    { status: ordersRes.status }
                );
            }

            const orders = await ordersRes.json();
            console.log(`✓ Loaded ${orders.length} orders (minimal fields)`);

            // Get pagination info from headers
            const totalOrders = parseInt(ordersRes.headers.get('X-WP-Total') || '0', 10);
            const totalPages = parseInt(ordersRes.headers.get('X-WP-TotalPages') || '1', 10);

            // Return minimal data for fast rendering
            const minimalOrders = orders.map(order => ({
                id: order.id,
                status: order.status,
                date_created: order.date_created,
                total: order.total,
                currency: order.currency || 'GHS',
                billing: {
                    first_name: order.billing?.first_name || '',
                    last_name: order.billing?.last_name || '',
                    email: order.billing?.email || ''
                }
            }));

            return NextResponse.json({
                orders: minimalOrders,
                pagination: {
                    page,
                    per_page: perPage,
                    total: totalOrders,
                    total_pages: totalPages,
                    has_more: page < totalPages
                }
            }, { 
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
                }
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Orders fetch timeout');
                return NextResponse.json(
                    { error: 'Request timeout', orders: [] },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error', orders: [] },
            { status: 500 }
        );
    }
}

