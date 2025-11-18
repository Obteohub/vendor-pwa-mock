import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Get attributes for a specific category
export async function GET(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('sw_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

    // Get category details to check for attribute meta
    const categoryRes = await fetch(`${WC_API_URL}/products/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!categoryRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: categoryRes.status }
      );
    }

    const category = await categoryRes.json();

    // Check if category has attribute_ids in meta_data
    const attributeIds = category.meta_data?.find(
      meta => meta.key === 'category_attribute_ids'
    )?.value || [];

    // If no specific attributes defined, return all attributes
    if (!attributeIds || attributeIds.length === 0) {
      // Fetch all attributes
      const allAttributesRes = await fetch(`${WC_API_URL}/../wp/v2/products/attributes?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!allAttributesRes.ok) {
        return NextResponse.json({ attributes: [] });
      }

      const allAttributes = await allAttributesRes.json();
      return NextResponse.json({ 
        attributes: allAttributes,
        category_id: id,
        category_name: category.name,
        all_attributes: true // Flag indicating all attributes returned
      });
    }

    // Fetch specific attributes for this category
    const attributePromises = attributeIds.map(attrId =>
      fetch(`${WC_API_URL}/../wp/v2/products/attributes/${attrId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.ok ? res.json() : null)
    );

    const attributes = (await Promise.all(attributePromises)).filter(Boolean);

    return NextResponse.json({
      attributes,
      category_id: id,
      category_name: category.name,
      all_attributes: false
    });

  } catch (error) {
    console.error('Error fetching category attributes:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
