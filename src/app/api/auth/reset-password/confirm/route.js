/* -------------------------------------------------------------------------
File: app/api/auth/reset-password/confirm/route.js
Purpose: Proxy the password reset confirmation to WordPress.
         Expects: { key, login, password }
------------------------------------------------------------------------- */

import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export async function POST(request) {
    try {
        const body = await request.json();
        const { key, login, password } = body;

        // Validation
        if (!key || !login || !password) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        console.log(`[RESET CONFIRM] Attempting to reset password for user: ${login} via middleware`);

        try {
            // Using backendFetch which routes to direct middleware api.shopwice.com/api/reset-password/confirm
            const res = await backendFetch('reset-password/confirm', {
                method: 'POST',
                body: { key, login, password }
            });

            const data = await res.json();

            if (res.ok) {
                return NextResponse.json({
                    success: true,
                    message: data.message || 'Password has been set successfully.'
                });
            } else {
                console.warn('[RESET CONFIRM] Middleware API returned error:', data);
                return NextResponse.json(
                    { error: data.message || 'Failed to reset password. The link may be expired.' },
                    { status: res.status }
                );
            }
        } catch (apiError) {
            console.error('[RESET CONFIRM] Fetch error:', apiError.message);
            return NextResponse.json(
                { error: 'Failed to connect to authentication service.' },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error('[RESET CONFIRM] Fatal error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
