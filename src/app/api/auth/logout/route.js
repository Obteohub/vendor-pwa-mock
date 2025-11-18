// src/app/api/auth/logout/route.js
// Logout endpoint - clears auth cookies

import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear auth cookies
        response.cookies.set('sw_token', '', {
            httpOnly: true,
            secure: false,
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
        });

        response.cookies.set('sw_user', '', {
            httpOnly: false,
            secure: false,
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
        });

        console.log('[AUTH DEBUG] User logged out, cookies cleared');

        return response;
    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
