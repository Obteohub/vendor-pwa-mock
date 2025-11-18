// File: pages/api/vendor/products.js (Final Version with GET, POST, PUT, DELETE)
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

// --- Handler for GET (Fetch Products - single or multiple) ---
async function handleGet(req, res, token) {
  const { id } = req.query;
  // If ID exists, fetch single product; otherwise, fetch all vendor products.
  let endpointPath = id ? `/wp-json/dokan/v1/products/${id}` : '/wp-json/dokan/v1/products';
  const endpoint = `${WP_BASE_URL}${endpointPath}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const json = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: json.message || `Failed to fetch product${id ? ' ' + id : 's'} from WP/Dokan.` 
      });
    }
    return res.status(200).json(json);
  } catch (err) {
    console.error('Product fetch error:', err);
    return res.status(500).json({ error: 'Server error while fetching products.' });
  }
}

// --- Handler for POST (Create Product) ---
async function handlePost(req, res, token) {
  const endpoint = `${WP_BASE_URL}/wp-json/dokan/v1/products`;
  const productData = req.body; 

  if (!productData || !productData.title || !productData.price) {
    return res.status(400).json({ error: 'Missing required product data (title and price).' });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    const json = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: json.message || 'Failed to create product in WP/Dokan.', 
        details: json
      });
    }
    return res.status(201).json(json);
  } catch (err) {
    console.error('Product creation error:', err);
    return res.status(500).json({ error: 'Server error while creating product.' });
  }
}

// --- Handler for PUT (Update Product) ---
async function handlePut(req, res, token) {
  const { id } = req.query;
  const productData = req.body;
  
  if (!id) { return res.status(400).json({ error: 'Missing product ID for update.' }); }
  if (!productData || Object.keys(productData).length === 0) {
     return res.status(400).json({ error: 'Missing product data for update.' });
  }

  const endpoint = `${WP_BASE_URL}/wp-json/dokan/v1/products/${id}`; 

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const json = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: json.message || `Failed to update product #${id} in WP/Dokan.`, 
        details: json
      });
    }
    return res.status(200).json(json); 

  } catch (err) {
    console.error(`Product update error for #${id}:`, err);
    return res.status(500).json({ error: 'Server error while updating product.' });
  }
}

// --- Handler for DELETE (Delete Product) ---
async function handleDelete(req, res, token) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing product ID for deletion.' });
  }

  // To permanently delete in WooCommerce, the 'force' parameter must be true.
  // Dokan often respects this.
  const endpoint = `${WP_BASE_URL}/wp-json/dokan/v1/products/${id}?force=true`; 

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Note: A successful DELETE usually returns a 200/204 status and the deleted object
    // or a simple success message. We return a standard success response.
    if (!response.ok) {
      const json = await response.json();
      return res.status(response.status).json({ 
        error: json.message || `Failed to delete product #${id}.`, 
        details: json
      });
    }

    // Return a success response, often the deleted item is returned by the API
    return res.status(200).json({ 
        ok: true, 
        message: `Product #${id} deleted successfully.`
    }); 

  } catch (err) {
    console.error(`Product deletion error for #${id}:`, err);
    return res.status(500).json({ error: 'Server error while deleting product.' });
  }
}


// --- Main Handler ---
export default async function handler(req, res) {
  const token = authenticate(req, res);
  if (!token) return;

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, token);
    case 'POST':
      return handlePost(req, res, token);
    case 'PUT':
      return handlePut(req, res, token);
    case 'DELETE':
      return handleDelete(req, res, token); // NEW: Handle product deletion
    default:
      return res.status(405).end(); // Method Not Allowed
  }
}