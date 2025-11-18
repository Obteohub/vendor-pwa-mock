// File: pages/api/vendor/store.js
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
 * Handle POST request to update vendor store settings via Dokan API.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate the request
  const token = authenticate(req, res);
  if (!token) return; // Authentication failed, response already sent

  // 2. Extract data from the request body
  const { name, location } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Store name is required.' });
  }

  // 3. Prepare data structure for the Dokan Store Settings endpoint
  // Note: Dokan's settings API often expects nested data or specific fields.
  // We'll map the simple form fields to common Dokan store fields.
  const storeData = {
    store_name: name,
    address: {
      street_1: '', // Assuming client will update full address later
      city: location, // Using location as city for simplicity
      country: '',
      state: '',
      postcode: ''
    }
    // Dokan might also require 'phone', 'social', etc.
  };

  // 4. Set the Dokan endpoint for vendor settings
  // The Dokan /settings endpoint generally allows the authenticated vendor to update their own store settings.
  const endpoint = `${WP_BASE_URL}/wp-json/dokan/v1/settings`; 

  try {
    const response = await fetch(endpoint, {
      method: 'POST', // Dokan often uses POST for updates
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(storeData)
    });

    const json = await response.json();

    if (!response.ok || json.code) {
      // Handle errors from the Dokan API (e.g., store name already taken, invalid data)
      return res.status(response.status).json({ 
        error: json.message || 'Failed to save store settings.', 
        details: json 
      });
    }

    // 5. Success: Return confirmation
    return res.status(200).json({ 
      ok: true, 
      message: 'Store settings saved successfully.',
      data: json // Returns the updated settings object
    });

  } catch (err) {
    console.error('Store setup error:', err);
    return res.status(500).json({ error: 'Server error during store setup.' });
  }
}