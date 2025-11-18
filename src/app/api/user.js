// src/app/api/user.js
import fetch from 'node-fetch';
import cookie from 'cookie';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[process.env.COOKIE_NAME || 'sw_token'];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const r = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: user.message || 'Failed to fetch user' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error('user fetch error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
