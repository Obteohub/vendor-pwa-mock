// src/app/api/vendor/[id]/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
        }

        console.log(`[VENDOR] Fetching public profile for vendor #${id} via middleware...`);
        const res = await backendFetch(`vendor/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            if (res.status === 404) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
            return NextResponse.json({ error: 'Failed to load vendor profile' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('[VENDOR] Public Profile GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
