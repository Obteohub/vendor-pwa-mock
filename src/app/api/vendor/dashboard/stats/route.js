// src/app/api/vendor/dashboard/stats/route.js
// Fetch dashboard statistics

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;


export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Fetching dashboard stats...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            // Fetch multiple endpoints in parallel for speed
            const [ordersRes, productsRes] = await Promise.all([
                fetch(`${WC_API_URL}/orders?per_page=100&_fields=id,status,total,date_created`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    cache: 'no-store',
                    signal: controller.signal,
                }),
                fetch(`${WC_API_URL}/products?per_page=1&_fields=id`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    cache: 'no-store',
                    signal: controller.signal,
                })
            ]);

            clearTimeout(timeoutId);

            const orders = ordersRes.ok ? await ordersRes.json() : [];
            const totalProducts = parseInt(productsRes.headers.get('X-WP-Total') || '0', 10);

            // Calculate stats
            const totalOrders = parseInt(ordersRes.headers.get('X-WP-Total') || '0', 10);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const processingOrders = orders.filter(o => o.status === 'processing').length;
            const completedOrders = orders.filter(o => o.status === 'completed').length;

            // Calculate revenue (last 100 orders)
            const totalRevenue = orders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

            // Recent orders (last 5)
            const recentOrders = orders.slice(0, 5).map(o => ({
                id: o.id,
                status: o.status,
                total: o.total,
                date: o.date_created
            }));

            // Calculate today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = orders.filter(o => new Date(o.date_created) >= today);
            const todayRevenue = todayOrders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

            console.log('✓ Dashboard stats loaded');

            return NextResponse.json({
                stats: {
                    totalOrders,
                    totalProducts,
                    pendingOrders,
                    processingOrders,
                    completedOrders,
                    totalRevenue,
                    todayOrders: todayOrders.length,
                    todayRevenue
                },
                recentOrders
            }, {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
                }
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('Dashboard stats timeout');
                return NextResponse.json(
                    { error: 'Request timeout' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}

