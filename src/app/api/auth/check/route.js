// src/app/api/auth/check/route.js
// Check if user is authenticated

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sw_token')?.value;
        const userCookie = cookieStore.get('sw_user')?.value;

        if (!authToken || !userCookie) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        const user = JSON.parse(userCookie);

        return NextResponse.json(
            { 
                authenticated: true,
                user 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking auth:', error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500 }
        );
    }
}
