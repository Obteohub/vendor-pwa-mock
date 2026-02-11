import { NextResponse } from 'next/server';

const getBaseUrl = () => {
    const url = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
    return (url || '').replace(/\/$/, '');
};

const BASE_URL = getBaseUrl();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const perPage = searchParams.get('per_page') || '10';
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        const queryParams = new URLSearchParams({
            page,
            offset: ((parseInt(page) - 1) * parseInt(perPage)).toString(),
            per_page: perPage,
            ...(search && { search }),
            ...(status && { status })
        });

        // WCFM Store Vendors endpoint
        const endpoint = `${BASE_URL}/wp-json/wcfmmp/v1/store-vendors?${queryParams}`;

        const res = await fetch(endpoint, { cache: 'no-store' });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: res.status });
        }

        const data = await res.json();

        // Return standard paginated format
        return NextResponse.json({
            vendors: data,
            pagination: {
                total: parseInt(res.headers.get('X-WP-Total') || '0'),
                totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '1'),
                currentPage: parseInt(page),
                perPage: parseInt(perPage)
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
