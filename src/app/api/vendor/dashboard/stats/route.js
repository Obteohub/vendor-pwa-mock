
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        console.log('[DASHBOARD STATS] Fetching optimized stats (Sequential Batches)...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        // Helper to safe fetch
        const safeFetch = async (endpoint, options) => {
            try {
                return await backendFetch(endpoint, { ...options, cache: 'no-store' });
            } catch (e) {
                console.error(`[STATS] Error fetching ${endpoint}:`, e);
                return { ok: false, headers: new Headers() };
            }
        };

        // --- BATCH 1: Sales Stats (Heaviest) ---
        const salesStatsRes = await safeFetch('vendor/sales-stats', {});
        
        // --- BATCH 2: Orders Lists (Medium) ---
        const [recentOrdersRes, todayOrdersRes] = await Promise.all([
            safeFetch('vendor/orders', {
                params: { 
                    per_page: 5, 
                    _fields: 'id,status,total,date_created,date_modified,currency' 
                }
            }),
            safeFetch('vendor/orders', {
                params: { 
                    after: todayIso, 
                    per_page: 50, 
                    _fields: 'id,total,status' 
                }
            })
        ]);

        // --- BATCH 3: Status Counts (Lighter, but grouped to 2 concurrent max) ---
        const [pendingRes, processingRes] = await Promise.all([
            safeFetch('vendor/orders', { params: { status: 'pending', per_page: 1, _fields: 'id' } }),
            safeFetch('vendor/orders', { params: { status: 'processing', per_page: 1, _fields: 'id' } })
        ]);

        const [completedRes, productsRes] = await Promise.all([
            safeFetch('vendor/orders', { params: { status: 'completed', per_page: 1, _fields: 'id' } }),
            safeFetch('vendor/products', { params: { per_page: 1, _fields: 'id' } })
        ]);

        // --- Process Results ---

        // Helper to get total from header
        const getHeaderTotal = (res) => {
            if (!res || !res.headers) return 0;
            const total = res.headers.get('X-WP-Total') || res.headers.get('x-wp-total');
            return total ? parseInt(total, 10) : 0;
        };

        // 1. Sales Stats
        let statsData = {};
        if (salesStatsRes.ok) {
            statsData = await salesStatsRes.json().catch(() => ({}));
        }

        // 2. Recent Orders
        let recentOrders = [];
        if (recentOrdersRes.ok) {
            const data = await recentOrdersRes.json().catch(() => []);
            const list = Array.isArray(data) ? data : (data.data || []);
            // Map to simplified format expected by frontend
            recentOrders = list.map(o => ({
                id: o.id,
                status: o.status,
                total: o.total,
                date: o.date_created || o.date_modified
            }));
        }

        // 3. Today's Revenue Calculation
        let todayRevenue = 0;
        let todayCount = 0;
        if (todayOrdersRes.ok) {
            const todayData = await todayOrdersRes.json().catch(() => []);
            const list = Array.isArray(todayData) ? todayData : (todayData.data || []);
            todayCount = list.length;
            todayRevenue = list.reduce((sum, order) => {
                // Only count paid/valid orders for revenue
                if (['completed', 'processing', 'on-hold'].includes(order.status)) {
                    return sum + parseFloat(order.total || 0);
                }
                return sum;
            }, 0);
        }

        // 4. Counts from Headers
        const pendingCount = getHeaderTotal(pendingRes);
        const processingCount = getHeaderTotal(processingRes);
        const completedCount = getHeaderTotal(completedRes);
        const productsCount = getHeaderTotal(productsRes);
        
        // Total orders is sum of main statuses or just header total if we did a general query (we didn't)
        // We can just sum the specific ones we care about for the dashboard "Total Orders" badge if needed, 
        // or if salesStats returns it.
        // salesStats usually has total_orders.

        const responseData = {
            sales: {
                total_sales: statsData.total_sales || 0,
                net_sales: statsData.net_sales || 0,
                average_sales: statsData.average_sales || 0,
                total_orders: statsData.total_orders || (pendingCount + processingCount + completedCount),
                total_items: statsData.total_items || 0,
            },
            orders: {
                recent: recentOrders,
                pending: pendingCount,
                processing: processingCount,
                completed: completedCount,
                today_count: todayCount,
                today_revenue: todayRevenue
            },
            products: {
                total: productsCount
            }
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('[STATS] Fatal error:', error);
        return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
    }
}
