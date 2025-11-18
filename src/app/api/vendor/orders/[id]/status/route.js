// src/app/api/vendor/orders/[id]/status/route.js
// Update order status

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

export async function PUT(request, { params }) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { status } = await request.json();

        console.log(`Updating order ${id} status to: ${status}`);

        // Update order status via WooCommerce API
        const res = await fetch(`${WC_API_URL}/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Order status update failed:', errorData);
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
