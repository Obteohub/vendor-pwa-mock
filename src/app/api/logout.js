// src/app//api/logout.js
import cookie from 'cookie';
export default function handler(req, res) {
  const cookieName = process.env.COOKIE_NAME || 'sw_token';
  res.setHeader('Set-Cookie', cookie.serialize(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  }));
  res.status(200).json({ ok: true });
}
