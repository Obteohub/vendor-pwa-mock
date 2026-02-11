/* -------------------------------------------------------------------------
File: app/reset-password/confirm/page.jsx
Purpose: Actual password reset page where user enters new password.
         Triggered by clicking the link in the reset email.
------------------------------------------------------------------------- */

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import LoadingDots from '@/components/LoadingDots';

function ConfirmForm() {
    const searchParams = useSearchParams();
    const key = searchParams.get('key');
    const login = searchParams.get('login');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const isSubmitting = status === 'loading';

    // Check if we have the necessary params
    useEffect(() => {
        if (!key || !login) {
            setStatus('error');
            setMessage('Invalid or expired password reset link. Please request a new one.');
        }
    }, [key, login]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validation
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        setMessage('Updating your password...');

        try {
            const res = await fetch('/api/auth/reset-password/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key,
                    login,
                    password
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Your password has been successfully reset. You can now log in with your new password.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password. The link may have expired.');
            }
        } catch (err) {
            console.error('[RESET CONFIRM] Network error:', err);
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-2">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <KeyRound className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
                    <p className="text-white/90">Create a secure password for your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">

                    {status !== 'success' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Reset Info (Hidden or read-only) */}
                            <div className="bg-gray-50 border p-3 rounded-lg flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                    {login ? login[0].toUpperCase() : '?'}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Resetting account</p>
                                    <p className="text-sm font-semibold text-gray-900">{login}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`${inputStyle} pr-10`}
                                        disabled={isSubmitting || status === 'error' && !key}
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={inputStyle}
                                    disabled={isSubmitting || status === 'error' && !key}
                                    placeholder="Repeat new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || status === 'error' && !key}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-base font-semibold text-white transition-all ${isSubmitting || (status === 'error' && !key)
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingDots size="sm" className="mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>

                            {/* Status Message */}
                            {message && status === 'error' && (
                                <div className="p-4 rounded-lg flex items-start animate-in fade-in slide-in-from-top-2 duration-300 bg-red-100 text-red-900 border border-red-300">
                                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span className="text-sm font-medium">{message}</span>
                                </div>
                            )}

                            {!key && (
                                <Link href="/reset-password" class="block text-center text-sm font-semibold text-indigo-600 hover:underline">
                                    Request a new link
                                </Link>
                            )}
                        </form>
                    ) : (
                        // Success State
                        <div className="text-center py-6 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-200 rounded-full mb-2">
                                <CheckCircle className="w-8 h-8 text-green-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Password Updated!</h3>
                            <div className="p-4 rounded-lg bg-green-100 text-green-900 border border-green-300">
                                <p className="text-sm font-medium">{message}</p>
                            </div>
                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg transition-all"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600">
                <div className="flex flex-col items-center text-white">
                    <LoadingDots size="lg" className="mb-4" />
                    <p className="text-lg font-medium">Loading...</p>
                </div>
            </div>
        }>
            <ConfirmForm />
        </Suspense>
    );
}
