// src/app/api/auth/check/route.js
// Check if user is authenticated

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/backend-client';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;
        const userCookie = cookieStore.get('sw_user')?.value;

        if (!authToken) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        // If user cookie exists and is valid, use it
        if (userCookie) {
            try {
                const user = JSON.parse(userCookie);
                return NextResponse.json(
                    { authenticated: true, user },
                    { status: 200 }
                );
            } catch (e) {
                // Invalid JSON, proceed to fetch from backend
                console.warn('[AUTH CHECK] Invalid sw_user cookie, fetching from backend');
            }
        }

        // Token exists but user missing/invalid: Fetch from backend
        console.log('[AUTH CHECK] Recovering user session from backend...');
        try {
            const res = await backendFetch('vendor/account', { cache: 'no-store' });
            
            if (res.ok) {
                const data = await res.json();
                // Map account data to user object
                const user = {
                    id: data.profile?.id || data.id,
                    display_name: data.profile?.display_name || data.display_name || data.first_name + ' ' + data.last_name,
                    email: data.profile?.email || data.email,
                    role: data.profile?.role || data.role || 'vendor',
                    user_nicename: data.profile?.user_nicename || data.user_nicename || data.username
                };

                const response = NextResponse.json(
                    { authenticated: true, user },
                    { status: 200 }
                );

                // Restore sw_user cookie
                response.cookies.set('sw_user', JSON.stringify(user), {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });

                return response;
            }
        } catch (err) {
            console.error('[AUTH CHECK] Failed to recover session:', err);
        }

        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );

    } catch (error) {
        console.error('Error checking auth:', error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500 }
        );
    }
}
