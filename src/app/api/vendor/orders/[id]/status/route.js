// src/app/api/vendor/orders/[id]/status/route.js
// Update order status

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        console.log(`[ORDERS] Updating order ${id} status to: ${status} via middleware`);

        // Update order status via middleware
        const res = await backendFetch(`vendor/orders/${id}`, {
            method: 'PUT',
            body: { status }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('[ORDERS] Update failed:', errorData);
            return NextResponse.json(
                { error: errorData.message || 'Failed to update order status' },
                { status: res.status }
            );
        }

        const order = await res.json();
        console.log(`✓ Order ${id} status updated to ${status}`);

        return NextResponse.json(
            { message: 'Order status updated successfully', order },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}
