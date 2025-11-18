// File: src/app/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handle POST requests for vendor login.
 */
export async function POST(request) {
  // 1. Parse the request body (username and password)
  const { username, password } = await request.json();

  // 2. Mock Authentication Logic
  // IMPORTANT: Replace this with actual database/auth service validation.
  if (username === 'vendor@shopwice.com' && password === 'password123') {
    // 3. Successful Login Simulation: Set a mock authentication cookie
    const token = 'mock_jwt_vendor_12345'; // In a real app, this would be a JWT

    // Set a secure, httpOnly cookie for session management
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'strict',
    });

    // Return a success response
    return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });

  } else if (username === 'fail' && password === 'fail') {
    // 4. Simulated Server Validation Error (for testing error state)
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } else {
    // 5. General Failure
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }
}