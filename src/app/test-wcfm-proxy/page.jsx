'use client';

import { useState } from 'react';
import wcfmClient from '@/lib/wcfmClient';

export default function WcfmProxyTest() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runTest = async (testName, testFn) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log(`Running test: ${testName}`);
            const data = await testFn();
            setResult({ testName, success: true, data });
            console.log(`✅ ${testName} passed:`, data);
        } catch (err) {
            setError({ testName, message: err.message, details: err });
            console.error(`❌ ${testName} failed:`, err);
        } finally {
            setLoading(false);
        }
    };

    const tests = [
        {
            name: 'Get Current User (users/me)',
            fn: () => wcfmClient.getMe()
        },
        {
            name: 'Get Products',
            fn: () => wcfmClient.getProducts({ page: 1, per_page: 5 })
        },
        {
            name: 'Get Orders',
            fn: () => wcfmClient.getOrders({ page: 1, per_page: 5 })
        },
        {
            name: 'Get Sales Stats',
            fn: () => wcfmClient.getSalesStats()
        },
        {
            name: 'Get Settings',
            fn: () => wcfmClient.getSettings()
        },
        {
            name: 'Get Categories',
            fn: () => wcfmClient.getCategories({ per_page: 10 })
        },
        {
            name: 'Get Notifications',
            fn: () => wcfmClient.getNotifications({ per_page: 5 })
        },
        {
            name: 'Custom Request (users/me)',
            fn: () => wcfmClient.request('users/me', { method: 'GET' })
        }
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
            <h1>🧪 WCFM Proxy Test Suite</h1>
            <p>Test the WCFM middleware proxy endpoints</p>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h3>ℹ️ Instructions</h3>
                <ol>
                    <li>Make sure you're logged in as a vendor</li>
                    <li>Open browser DevTools → Network tab</li>
                    <li>Click any test button below</li>
                    <li>Verify you see <code>POST /api/wcfm/proxy</code> in Network tab</li>
                    <li>Verify you do NOT see any direct calls to WordPress domain</li>
                </ol>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                {tests.map((test) => (
                    <button
                        key={test.name}
                        onClick={() => runTest(test.name, test.fn)}
                        disabled={loading}
                        style={{
                            padding: '12px 20px',
                            fontSize: '14px',
                            background: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? '⏳ Running...' : `▶️ ${test.name}`}
                    </button>
                ))}
            </div>

            {loading && (
                <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
                    <p>⏳ Running test... Check Network tab!</p>
                </div>
            )}

            {error && (
                <div style={{ padding: '20px', background: '#f8d7da', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>❌ Test Failed: {error.testName}</h3>
                    <p><strong>Error:</strong> {error.message}</p>
                    <details>
                        <summary>Show Details</summary>
                        <pre style={{ overflow: 'auto', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                            {JSON.stringify(error.details, null, 2)}
                        </pre>
                    </details>
                </div>
            )}

            {result && (
                <div style={{ padding: '20px', background: '#d4edda', borderRadius: '8px' }}>
                    <h3>✅ Test Passed: {result.testName}</h3>
                    <details open>
                        <summary>Show Response Data</summary>
                        <pre style={{ overflow: 'auto', background: '#fff', padding: '10px', borderRadius: '4px', maxHeight: '400px' }}>
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </details>
                </div>
            )}

            <div style={{ marginTop: '40px', padding: '20px', background: '#e7f3ff', borderRadius: '8px' }}>
                <h3>🔍 What to Check in Network Tab</h3>
                <ul>
                    <li>✅ Should see: <code>POST /api/wcfm/proxy</code></li>
                    <li>✅ Request payload should contain: <code>{`{ endpoint: "...", method: "GET" }`}</code></li>
                    <li>❌ Should NOT see: Direct calls to WordPress domain</li>
                    <li>❌ Should NOT see: <code>/wp-json/wcfmmp/v1/*</code> in URL</li>
                </ul>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>📝 Console Output</h3>
                <p>Check browser console for detailed logs:</p>
                <ul>
                    <li><code>[WCFM PROXY] GET /users/me</code></li>
                    <li><code>[WCFM PROXY] GET /products</code></li>
                    <li>etc.</li>
                </ul>
            </div>
        </div>
    );
}
