import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`[RESET] Attempting password reset for ${email} via middleware`);

    try {
      // Use backendFetch to call the middleware's reset-password endpoint
      // This routes to api.shopwice.com/api/reset-password
      const res = await backendFetch('reset-password', {
        method: 'POST',
        body: { user_login: email }
      });

      console.log('[RESET] Middleware response status:', res.status);

      if (res.ok) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link shortly. Please check your inbox and spam folder.',
        });
      }
    } catch (apiError) {
      console.log('[RESET] API error:', apiError.message);
    }

    // Fallback: Return message to contact admin
    return NextResponse.json({
      success: true,
      message: 'Password reset request received. If the email is registered, you should receive a reset link. If not received within 5 minutes, please contact support at admin@api.shopwice.com',
    });

  } catch (error) {
    console.error('[RESET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
