// File: src/app/dashboard/products/[id]/page.jsx

import { cookies } from 'next/headers';
import ProductEditForm from './ProductEditForm';

/**
 * Fetch a single vendor product from the internal API
 * - Uses JWT token stored in cookies
 * - Handles 401/404 gracefully
 * - Normalizes WooCommerce/Dokan data for editing
 */
async function getProduct(productId) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('sw_token')?.value;

  if (!authToken) {
    throw new Error('Authentication required. Please log in again.');
  }

  // Always ensure your BASE_URL env variable is defined
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_BASE_URL in environment variables.');
  }

  // Fetch directly from WooCommerce API since we have the token
  const wcV3Url = process.env.NEXT_PUBLIC_WC_API_BASE_URL.replace('/dokan/v1', '/wc/v3');
  const API_URL = `${wcV3Url}/products/${productId}`;

  const res = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Accept': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh data for editing
  });

  // Handle possible response errors
  if (!res.ok) {
    let errorMsg = `Failed to fetch product #${productId}.`;
    try {
      const errorData = await res.json();
      errorMsg = errorData?.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await res.json();

  // ✅ Normalize fields to match edit form requirements
  return {
    id: data.id,
    title: data.name || 'Untitled Product',
    price: data.regular_price || data.price || '',
    stock: data.stock_quantity ?? '',
    status: data.status || 'draft',
    sku: data.sku || '',
    description: data.description || '',
    short_description: data.short_description || '',
    categories: data.categories || [],
    images: (data.images || []).map(img => ({
      id: img.id,
      src: img.src,
      alt: img.alt || '',
    })),
  };
}

/**
 * Product Edit Page (Server Component)
 * Renders the client component once data is loaded
 */
export default async function ProductDetailPage({ params }) {
  const { id: productId } = await params;
  let initialProductData = null;
  let fetchError = null;

  try {
    initialProductData = await getProduct(productId);
  } catch (error) {
    fetchError = error.message;
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mt-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Error Loading Product</h2>
        <p className="text-sm">{fetchError}</p>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
      <ProductEditForm productId={productId} initialData={initialProductData} />
    </section>
  );
}
