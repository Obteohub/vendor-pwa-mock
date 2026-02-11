import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let productData = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            // Extract basic fields
            productData = {
                name: formData.get('name'),
                regular_price: formData.get('regular_price'),
                sale_price: formData.get('sale_price'),
                stock_quantity: formData.get('stock_quantity'),
                description: formData.get('description'),
                short_description: formData.get('short_description'),
                sku: formData.get('sku'),
                status: 'pending' // Default to pending
            };

            // Handle images if any
            const imageFiles = formData.getAll('images[]');
            if (imageFiles && imageFiles.length > 0) {
                 const uploadResults = [];
                 for (const file of imageFiles) {
                    if (!(file instanceof File)) continue;
                    const mediaForm = new FormData();
                    mediaForm.append('file', file);
                    const mediaRes = await backendFetch('vendor/media', { method: 'POST', body: mediaForm });
                    if (mediaRes.ok) {
                        const mediaData = await mediaRes.json();
                        uploadResults.push({ id: mediaData.id, src: mediaData.source_url });
                    }
                }
                productData.images = uploadResults;
            }

        } else {
            productData = await request.json();
        }

        if (!productData.name) {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        console.log('[QUICK SUBMIT] Creating product...', productData.name);

        const res = await backendFetch('vendor/products', {
            method: 'POST',
            body: productData,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('[QUICK SUBMIT] Failed:', errorData);
            return NextResponse.json({ error: errorData.message || 'Creation failed' }, { status: res.status });
        }

        const newProduct = await res.json();

        return NextResponse.json({
            success: true,
            submissionId: `prod_sub_${newProduct.id}`,
            message: 'Product created successfully',
            product: newProduct
        });

    } catch (error) {
        console.error('Quick submit error:', error);
        return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 500 });
    }
}
