// Example: Using WCFM Client in a React Component
// This demonstrates how to use the WCFM proxy in your application

'use client';

import { useState, useEffect } from 'react';
import wcfmClient from '@/lib/wcfmClient';

export default function ProductsExample() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // All WCFM calls go through middleware - never direct to WCFM
            const result = await wcfmClient.getProducts({
                page: 1,
                per_page: 20,
                status: 'any'
            });

            setProducts(result.data || result);
            console.log('Pagination:', result.pagination);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async () => {
        try {
            const newProduct = await wcfmClient.createProduct({
                name: 'New Product',
                type: 'simple',
                regular_price: '99.99',
                status: 'pending'
            });

            console.log('Product created:', newProduct);
            loadProducts(); // Reload list
        } catch (err) {
            console.error('Error creating product:', err);
            alert(err.message);
        }
    };

    const updateProduct = async (id) => {
        try {
            const updated = await wcfmClient.updateProduct(id, {
                name: 'Updated Product Name',
                regular_price: '89.99'
            });

            console.log('Product updated:', updated);
            loadProducts(); // Reload list
        } catch (err) {
            console.error('Error updating product:', err);
            alert(err.message);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm('Are you sure?')) return;

        try {
            await wcfmClient.deleteProduct(id, true);
            console.log('Product deleted');
            loadProducts(); // Reload list
        } catch (err) {
            console.error('Error deleting product:', err);
            alert(err.message);
        }
    };

    if (loading) return <div>Loading products...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Products</h1>
            <button onClick={createProduct}>Create New Product</button>

            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        {product.name} - ${product.price}
                        <button onClick={() => updateProduct(product.id)}>Edit</button>
                        <button onClick={() => deleteProduct(product.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ============================================
// Example: Using WCFM Client for Orders
// ============================================

export function OrdersExample() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const result = await wcfmClient.getOrders({
                page: 1,
                per_page: 10,
                status: 'processing'
            });

            setOrders(result.data || result);
        } catch (err) {
            console.error('Error loading orders:', err);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await wcfmClient.updateOrderStatus(orderId, newStatus);
            loadOrders(); // Reload
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    return (
        <div>
            <h1>Orders</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        Order #{order.id} - {order.status}
                        <button onClick={() => updateOrderStatus(order.id, 'completed')}>
                            Mark Complete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ============================================
// Example: Using WCFM Client for Stats
// ============================================

export function StatsExample() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await wcfmClient.getSalesStats();
            setStats(data);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div>
            <h1>Sales Statistics</h1>
            <p>Total Sales: ${stats.total_sales}</p>
            <p>Total Orders: {stats.total_orders}</p>
            <p>Total Products: {stats.total_products}</p>
        </div>
    );
}

// ============================================
// Example: Using WCFM Client for Settings
// ============================================

export function SettingsExample() {
    const [settings, setSettings] = useState({
        store_name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await wcfmClient.getSettings();
            setSettings(data);
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };

    const saveSettings = async () => {
        try {
            await wcfmClient.updateSettings(settings);
            alert('Settings saved!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert(err.message);
        }
    };

    return (
        <div>
            <h1>Store Settings</h1>
            <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                placeholder="Store Name"
            />
            <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="Phone"
            />
            <button onClick={saveSettings}>Save Settings</button>
        </div>
    );
}

// ============================================
// Example: Advanced - Custom WCFM Endpoint
// ============================================

export function CustomEndpointExample() {
    const [data, setData] = useState(null);

    const callCustomEndpoint = async () => {
        try {
            // For any WCFM endpoint not covered by convenience methods
            const result = await wcfmClient.request('custom-endpoint', {
                method: 'GET',
                params: {
                    custom_param: 'value'
                }
            });

            setData(result);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <button onClick={callCustomEndpoint}>Call Custom Endpoint</button>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}

// ============================================
// Example: Error Handling
// ============================================

import { WcfmError } from '@/lib/wcfmClient';

export function ErrorHandlingExample() {
    const handleRequest = async () => {
        try {
            const products = await wcfmClient.getProducts();
            console.log('Success:', products);
        } catch (error) {
            if (error instanceof WcfmError) {
                // WCFM API error
                console.error('WCFM Error:', {
                    message: error.message,
                    status: error.status,
                    code: error.code,
                    details: error.details
                });

                // Handle specific errors
                if (error.status === 401) {
                    // Redirect to login
                    window.location.href = '/login';
                } else if (error.status === 404) {
                    alert('Resource not found');
                } else {
                    alert(`Error: ${error.message}`);
                }
            } else {
                // Network or other error
                console.error('Network error:', error);
                alert('Network error. Please check your connection.');
            }
        }
    };

    return <button onClick={handleRequest}>Make Request</button>;
}

// ============================================
// Example: Server-Side Usage (API Route)
// ============================================

// In an API route: /api/my-custom-endpoint/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Call WCFM proxy from server-side
        const response = await fetch('http://localhost:3000/api/wcfm/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('Cookie') // Forward auth cookies
            },
            body: JSON.stringify({
                endpoint: 'products',
                method: 'GET',
                params: { per_page: 10 }
            })
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
