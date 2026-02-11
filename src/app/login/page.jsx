/* -------------------------------------------------------------------------
File: app/login/page.jsx
Purpose: Login page (client) using useAuthStore
------------------------------------------------------------------------- */

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import LoadingDots from '@/components/LoadingDots';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const login = useAuthStore(state => state.login);
    const authLoading = useAuthStore(state => state.isLoading);

    const isSubmitting = status === 'loading' || status === 'success' || authLoading;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setStatus('loading');
        // setMessage('Attempting to log in...');

        try {
            const result = await login(formData);

            if (result && result.success) {
                setStatus('success');
                // setMessage('Login successful! Redirecting to dashboard...');

                // Use window.location for reliable redirection
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            } else {
                setStatus('error');
                setMessage(result?.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('An unexpected error occurred. Please try again.');
            console.error('[LOGIN ERROR]', err);
        }
    };

    // Determine status styles
    const statusStyles = {
        success: 'bg-green-100 text-green-700 border border-green-200',
        error: 'bg-red-100 text-red-700 border border-red-200',
        loading: 'bg-blue-100 text-blue-700 border border-blue-200',
        idle: 'bg-blue-100 text-blue-700 border border-blue-200'
    };

    const currentStatusStyle = statusStyles[status] || statusStyles.idle;

    const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">

                <div className="text-center">
                    <img src="/images/LOGO HORIZONTAL.png" alt="Shopwice" className="h-16 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Vendor Login
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">Sign in to access your dashboard.</p>
                </div>

                {/* Status Message UI */}
                {message && (
                    <div className={`p-4 rounded-xl font-medium flex items-start shadow-md ${currentStatusStyle}`}>
                        {status === 'error' && <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />}
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
                            placeholder="Enter your username or email"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <Link 
                                href="/reset-password" 
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm pr-10"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex="-1"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white transition duration-300 shadow-lg 
                                ${isSubmitting
                                    ? status === 'success' 
                                        ? 'bg-green-600 hover:bg-green-700 cursor-default' 
                                        : 'bg-indigo-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {status === 'loading' || authLoading ? (
                                <>
                                    <LoadingDots size="sm" className="mr-2" />
                                    Authenticating...
                                </>
                            ) : status === 'success' ? (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Login Successful!
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                href="/register" 
                                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Register now
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}