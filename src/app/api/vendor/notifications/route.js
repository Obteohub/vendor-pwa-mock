// src/app/api/vendor/notifications/route.js
// Fetch vendor notifications

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        // Fetch recent orders via middleware
        console.log('[NOTIFICATIONS] Fetching recent orders via backendFetch...');
        const ordersRes = await backendFetch('vendor/orders', {
            params: {
                per_page: 20
            },
            cache: 'no-store'
        });

        const notifications = [];

        if (ordersRes.ok) {
            const orders = await ordersRes.json();

            // Create notifications for recent orders (last 24 hours)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            if (Array.isArray(orders)) {
                orders.forEach(order => {
                    const orderDate = new Date(order.date_created || order.date);
                    if (orderDate > oneDayAgo) {
                        notifications.push({
                            id: `order-${order.id}`,
                            type: 'order',
                            title: 'New Order Received',
                            message: `Order #${order.id} - GH₵${order.total}`,
                            timestamp: order.date_created || order.date,
                            read: false,
                            link: `/dashboard/orders/${order.id}`,
                            icon: 'shopping-cart'
                        });
                    }
                });
            }
        } else {
            console.error('[NOTIFICATIONS] Orders fetch failed:', ordersRes.status);
        }

        // Add sample admin announcements
        const announcements = [
            {
                id: 'announcement-1',
                type: 'announcement',
                title: 'Platform Update',
                message: 'New features added to vendor dashboard. Check them out!',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false,
                link: null,
                icon: 'megaphone'
            },
            {
                id: 'announcement-2',
                type: 'info',
                title: 'Keep Products Updated',
                message: 'Remember to update your product prices and stock regularly.',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                read: false,
                link: '/dashboard/products',
                icon: 'info'
            }
        ];

        notifications.push(...announcements);

        // Sort by timestamp (newest first)
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Filter unread if requested
        const filteredNotifications = unreadOnly
            ? notifications.filter(n => !n.read)
            : notifications;

        return NextResponse.json({
            notifications: filteredNotifications,
            unread_count: notifications.filter(n => !n.read).length,
            total: notifications.length
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error', notifications: [], unread_count: 0 },
            { status: 500 }
        );
    }
}

// Mark notification as read
export async function PUT(request) {
    try {
        const { notificationId } = await request.json();
        console.log(`Marking notification ${notificationId} as read`);

        return NextResponse.json(
            { message: 'Notification marked as read' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}
