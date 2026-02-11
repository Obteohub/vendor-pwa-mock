// src/app/api/vendor/products/[id]/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Use context=edit to ensure the enterprise middleware returns the full dataset
        // This is critical for the editing screen to have descriptions, categories, etc.
        console.log(`[PRODUCTS DEBUG] Fetching product #${id} for EDIT via middleware...`);

        const res = await backendFetch(`vendor/products/${id}`, {
            params: { context: 'edit' },
            cache: 'no-store'
        });

        console.log(`[PRODUCTS DEBUG] Middleware Response Status: ${res.status}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`[PRODUCTS DEBUG] Failed to fetch product #${id}:`, errorData);
            return NextResponse.json(
                { error: errorData.message || `Failed to fetch product #${id}` },
                { status: res.status }
            );
        }

        const fullProduct = await res.json();

        // Prune unwanted fields as requested by user
        const allowedKeys = [
            'id', 'name', 'slug', 'status', 'description', 'short_description',
            'sku', 'price', 'regular_price', 'sale_price', 'manage_stock',
            'stock_quantity', 'stock_status', 'weight', 'dimensions',
            'categories', 'brands', 'tags', 'images', 'attributes',
            'default_attributes', 'variations', 'menu_order'
        ];

        const product = Object.fromEntries(
            Object.entries(fullProduct).filter(([key]) => allowedKeys.includes(key))
        );

        console.log(`[PRODUCTS DEBUG] Successfully retrieved and PRUNED product #${id}. Keys: ${Object.keys(product).join(', ')}`);

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error(`[PRODUCTS DEBUG] GET Detail Error (#${id}):`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const contentType = request.headers.get('content-type') || '';

        let productData = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            productData = {
                name: formData.get('name'),
                type: formData.get('productType'),
                regular_price: formData.get('regular_price'),
                sale_price: formData.get('sale_price'),
                stock_quantity: formData.get('stock_quantity') ? parseInt(formData.get('stock_quantity'), 10) : undefined,
                description: formData.get('description'),
                short_description: formData.get('short_description'),
                sku: formData.get('sku'),
                weight: formData.get('weight'),
                manage_stock: true
            };

            const parseJson = (key) => {
                const val = formData.get(key);
                try { return val ? JSON.parse(val) : []; } catch (e) { return []; }
            };

            productData.categories = parseJson('category_ids_json').map(catId => ({ id: parseInt(catId, 10) }));
            productData.brands = parseJson('brand_ids_json').map(brandId => ({ id: parseInt(brandId, 10) }));
            productData.locations = parseJson('location_ids_json').map(locId => ({ id: parseInt(locId, 10) }));
            productData.attributes = parseJson('attributes_json');
            productData.variations = parseJson('variations_json');

            productData.dimensions = {
                length: formData.get('length') || '',
                width: formData.get('width') || '',
                height: formData.get('height') || ''
            };

            // Handle Images
            const existingImages = parseJson('existing_images_json');
            const newImageFiles = formData.getAll('images[]');
            const uploadResults = [...existingImages];

            if (newImageFiles && newImageFiles.length > 0) {
                console.log(`[PRODUCTS DEBUG] Uploading ${newImageFiles.length} new images for product #${id}`);
                for (const file of newImageFiles) {
                    if (!(file instanceof File)) continue;
                    const mediaForm = new FormData();
                    mediaForm.append('file', file);
                    const mediaRes = await backendFetch('media', { method: 'POST', body: mediaForm });
                    if (mediaRes.ok) {
                        const mediaData = await mediaRes.json();
                        uploadResults.push({ id: mediaData.id, src: mediaData.source_url });
                    }
                }
            }
            productData.images = uploadResults;

        } else {
            // Fallback for JSON requests
            productData = await request.json();
        }

        console.log(`[PRODUCTS DEBUG] Updating product #${id} via middleware...`);

        const res = await backendFetch(`vendor/products/${id}`, {
            method: 'PUT',
            body: productData
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`[PRODUCTS DEBUG] Middleware update failed for product #${id}:`, errorData);
            return NextResponse.json(
                { error: errorData.message || `Failed to update product #${id}` },
                { status: res.status }
            );
        }

        const updatedProduct = await res.json();
        return NextResponse.json({
            message: 'Product updated successfully',
            product: updatedProduct
        }, { status: 200 });

    } catch (error) {
        console.error(`[PRODUCTS DEBUG] PUT Error (#${id}):`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Handle POST requests as PUT (Method Override for FormData)
 * Client uses POST with _method="PUT" because FormData cannot be sent via PUT in some environments.
 */
export async function POST(request, context) {
    return PUT(request, context);
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[PRODUCTS] Deleting product #${id} via middleware...`);

        const res = await backendFetch(`vendor/products/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || `Failed to delete product #${id}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json({
            message: 'Product deleted successfully',
            details: data
        }, { status: 200 });
    } catch (error) {
        console.error('[PRODUCTS] DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
