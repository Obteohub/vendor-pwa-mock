"use client";

import { useState } from 'react';
import { AlertTriangle, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import LoadingDots from '@/components/LoadingDots';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('Sending password reset link...');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset link has been sent to your email. Please check your inbox and spam folder.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('[RESET] Network error:', err);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-2">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link 
          href="/login"
          className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-white/90">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
          
          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputStyle}
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                />
                <p className="mt-2 text-xs text-gray-500">
                  We'll send you a password reset link to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-base font-semibold text-white transition-all ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <LoadingDots size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Status Message - Below button */}
              {message && status === 'error' && (
                <div className="p-4 rounded-lg flex items-start animate-in fade-in slide-in-from-top-2 duration-300 bg-red-100 text-red-900 border border-red-300">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}
            </form>
          ) : (
            // Success State
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-200 rounded-full mb-2">
                <CheckCircle className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Check Your Email</h3>
              <div className="p-4 rounded-lg bg-green-100 text-green-900 border border-green-300">
                <p className="text-sm font-medium">{message}</p>
              </div>
              <div className="text-sm text-gray-700 space-y-2 pt-4">
                <p className="font-medium">Didn't receive the email?</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure the email is correct</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setMessage('');
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    Try again
                  </button>
                </div>
                <div className="pt-2 border-t mt-3">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Still having issues?</p>
                  <a 
                    href="mailto:admin@shopwice.com?subject=Password Reset Request" 
                    className="text-indigo-600 hover:text-indigo-700 font-bold underline"
                  >
                    Contact Support: info@shopwice.com
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
