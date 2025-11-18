import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define the external API base URL for WooCommerce/Dokan
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

// IMPORTANT: Prevents Next.js from caching the response
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    // Get product ID from params
    const { id } = await params;
    
    // Authentication check
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sw_token')?.value;

    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized. Missing authentication token.' },
            { status: 401 }
        );
    }

    try {
        // Fetch product from WooCommerce/Dokan API
        const wcV3Url = WC_API_URL.replace('/dokan/v1', '/wc/v3');
        const res = await fetch(`${wcV3Url}/products/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('WooCommerce API Error:', errorData);
            return NextResponse.json(
                {
                    error: errorData.message || `Failed to fetch product #${id}`,
                },
                { status: res.status }
            );
        }

        const product = await res.json();

        // Return the product data
        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('Internal Server Error fetching product:', error);
        return NextResponse.json(
            { error: error.message || 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    // Get product ID from params
    const { id } = await params;
    
    // Authentication check
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sw_token')?.value;

    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized. Missing authentication token.' },
            { status: 401 }
        );
    }

    try {
        // Parse JSON body
        const body = await request.json();
        
        // Build comprehensive update payload
        const updateData = {
            name: body.name,
            type: body.productType || 'simple',
            regular_price: body.regular_price,
            sale_price: body.sale_price || '',
            description: body.description || '',
            short_description: body.short_description || '',
            sku: body.sku || '',
            manage_stock: true,
            stock_quantity: parseInt(body.stock_quantity, 10) || 0,
            categories: body.category_ids?.map(id => ({ id })) || [],
            weight: body.weight || '',
            dimensions: {
                length: body.length || '',
                width: body.width || '',
                height: body.height || ''
            }
        };

        // Add attributes if present
        if (body.attributes && body.attributes.length > 0) {
            updateData.attributes = body.attributes;
        }

        // Add variations if variable product
        if (body.productType === 'variable' && body.variations) {
            updateData.variations = body.variations;
        }

        console.log(`Updating product ${id}:`, updateData);

        // Update product via WooCommerce API
        const wcV3Url = WC_API_URL.replace('/dokan/v1', '/wc/v3');
        const res = await fetch(`${wcV3Url}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(updateData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('WooCommerce API Error:', errorData);
            return NextResponse.json(
                {
                    error: errorData.message || `Failed to update product #${id}`,
                },
                { status: res.status }
            );
        }

        const product = await res.json();

        console.log(`✓ Product ${id} updated successfully`);

        // Return success
        return NextResponse.json(
            { message: 'Product updated successfully', product },
            { status: 200 }
        );
    } catch (error) {
        console.error('Internal Server Error updating product:', error);
        return NextResponse.json(
            { error: error.message || 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}
