import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export async function POST(request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, store_name, phone } = body;

    // Validation
    if (!email || !password || !store_name || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields: first name, last name, email, password, and store_name' },
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

    // Generate username from name
    const cleanName = `${first_name}${last_name}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    const generatedUsername = `${cleanName}${randomSuffix}`;

    console.log(`[REGISTER] Creating vendor account for: ${email} (Username: ${generatedUsername})`);

    // Call the enterprise API
    const res = await backendFetch('vendor/register', {
      method: 'POST',
      body: {
        first_name,
        last_name,
        email,
        password,
        shop_name: store_name,
        shop_url: '', // Removed from frontend, sending empty
        username: generatedUsername,
        phone: phone || ''
      }
    });

    const text = await res.text();
    let data;
    
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('[REGISTER] API Error (Non-JSON):', text);
        return NextResponse.json(
            { 
                error: 'Registration failed (Backend Error)', 
                details: text.includes('<!DOCTYPE') ? 'Backend returned HTML (likely 502 Bad Gateway)' : text.substring(0, 200) 
            },
            { status: res.status >= 400 ? res.status : 502 }
        );
    }

    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: data.message || 'Account created successfully',
        user: data.user
      });
    } else {
      console.error('[REGISTER] API Error:', data);
      return NextResponse.json(
        {
          error: data.message || data.error || 'Registration failed.',
          code: data.code
        },
        { status: res.status }
      );
    }

  } catch (error) {
    console.error('[REGISTER] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
