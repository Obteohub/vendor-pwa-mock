// File: src/app/api/vendor/data.js
import fetch from 'node-fetch';
import cookie from 'cookie';

const WP_BASE_URL = process.env.WP_BASE_URL;
const COOKIE_NAME = process.env.COOKIE_NAME || 'sw_token';

// --- Helper function to get token and handle auth failure ---
function authenticate(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Missing token.' });
    return null;
  }
  return token;
}

/**
 * Handles GET requests to fetch Orders or Earnings based on the 'type' query parameter.
 * Example calls:
 * - /api/vendor/data?type=orders
 * - /api/vendor/data?type=earnings
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate the request
  const token = authenticate(req, res);
  if (!token) return; // Authentication failed, response already sent

  // 2. Determine which data endpoint to hit
  const { type } = req.query;
  let endpointPath;

  switch (type) {
    case 'orders':
      // Dokan endpoint for vendor orders
      endpointPath = '/wp-json/dokan/v1/orders'; 
      break;
    case 'earnings':
      // Dokan endpoint for vendor summary/balance. Adjust path based on your Dokan version.
      // This path is often needed to get summary data like balance and withdrawal history.
      endpointPath = '/wp-json/dokan/v1/withdraw'; 
      break;
    default:
      return res.status(400).json({ error: 'Invalid data type requested. Must be "orders" or "earnings".' });
  }

  const endpoint = `${WP_BASE_URL}${endpointPath}`;

  // 3. Proxy the request to the Dokan API
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const json = await response.json();

    if (!response.ok) {
      // Relay Dokan/WP errors
      return res.status(response.status).json({ 
        error: json.message || `Failed to fetch ${type} data from WP/Dokan.`, 
        details: json 
      });
    }

    // 4. Return the data
    return res.status(200).json(json);
  } catch (err) {
    console.error(`Data fetch error for ${type}:`, err);
    return res.status(500).json({ error: `Server error while fetching ${type} data.` });
  }
}