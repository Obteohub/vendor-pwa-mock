

/* -------------------------------------------------------------------------
File: app/login/page.jsx
Purpose: Login page (client) using /api/login
*/


"use client";

import React, { useState } from 'react';
import { Loader2, AlertTriangle, LogIn } from 'lucide-react';

// Use client-side redirection as Next.js router imports may fail compilation
const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
        window.location.href = path;
    }
};

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const isSubmitting = status === 'loading';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        setStatus('loading');
        setMessage('Attempting to log in...');

        try {
            // Using the assumed local Next.js proxy route for authentication
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            // Log the raw response status before trying to parse JSON
            console.log(`[AUTH DEBUG] Response Status: ${res.status}`);

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Login successful! Redirecting to dashboard...');
                
                console.log('[LOGIN] Login successful, cookies should be set');
                console.log('[LOGIN] Current cookies:', document.cookie);
                
                // Redirect on success with a longer delay to ensure cookies are set
                setTimeout(() => {
                    console.log('[LOGIN] Redirecting to dashboard');
                    navigateTo('/dashboard');
                }, 1500); 

            } else if (res.status === 401) {
                setStatus('error');
                setMessage('Invalid credentials. Please check your username and password.');
            } else {
                setStatus('error');
                setMessage(data.error || `Login failed with status ${res.status}. Check server logs.`);
            }

        } catch (err) {
            console.error('[AUTH DEBUG] Network/Fetch Error:', err);
            // This is the specific error that results in "Network error" on the client
            setStatus('error');
            setMessage('Network Error: Could not connect to the login server. Please ensure the Next.js server is running and the API route is correct.');
        }
    };

    const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center">
                        <LogIn className="w-7 h-7 mr-2 text-indigo-600" /> Vendor Login
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">Sign in to access the vendor dashboard.</p>
                </div>

                {/* Status Message UI */}
                {message && (
                    <div className={`p-4 rounded-xl font-medium flex items-start shadow-md ${
                        status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                        status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                        {(status === 'error' && <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />) ||
                        (status === 'loading' && <Loader2 className="w-5 h-5 mr-3 mt-0.5 animate-spin flex-shrink-0" />) || null}
                        <span className="flex-1">{message}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username or Email</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white transition duration-300 shadow-lg 
                                ${isSubmitting
                                    ? 'bg-indigo-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                 'Sign In'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}