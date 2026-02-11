import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const data = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Forward to backend
        console.log(`[QUICK UPDATE] Updating product #${id}...`);
        
        const res = await backendFetch(`vendor/products/${id}`, {
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`[QUICK UPDATE] Failed for #${id}:`, errorData);
            return NextResponse.json(
                { error: errorData.message || 'Update failed' },
                { status: res.status }
            );
        }

        const updatedProduct = await res.json();

        return NextResponse.json({
            success: true,
            submissionId: `prod_upd_${id}_${Date.now()}`,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Quick update error:', error);
        return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 500 });
    }
}
