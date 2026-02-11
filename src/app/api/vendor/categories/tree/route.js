// src/app/api/vendor/categories/tree/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    console.log('[CATEGORIES] Fetching category tree via middleware...');
    const res = await backendFetch('vendor/categories/tree', {
      params: Object.fromEntries(searchParams.entries()),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch category tree from middleware' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('[CATEGORIES] Tree GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
