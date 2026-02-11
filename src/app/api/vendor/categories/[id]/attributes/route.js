// src/app/api/vendor/categories/[id]/attributes/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    console.log(`[CATEGORIES] Fetching attributes for category #${id} via middleware...`);

    // Attempt to fetch category-specific attributes via middleware
    // The middleware endpoint structure should ideally follow vendor/categories/[id]/attributes
    const res = await backendFetch(`vendor/categories/${id}/attributes`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      // Fallback: If category-specific attributes endpoint doesn't exist, try fetching all attributes
      console.log(`[CATEGORIES] Specific attributes not found for #${id}, falling back to all attributes`);
      const allRes = await backendFetch('vendor/attributes', {
        params: { per_page: 100 },
        cache: 'no-store'
      });

      if (!allRes.ok) {
        return NextResponse.json({ attributes: [] });
      }

      const allData = await allRes.json();
      // Handle different response formats (object with attributes array or plain array)
      const attributes = Array.isArray(allData) ? allData : (allData.attributes || []);

      return NextResponse.json({
        attributes,
        category_id: id,
        all_attributes: true
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[CATEGORIES] Attributes GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
