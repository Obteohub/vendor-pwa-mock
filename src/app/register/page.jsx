"use client";

import { useState } from 'react';
import { AlertTriangle, UserPlus, ArrowLeft, Store, User, Mail, Phone, Lock, Info, Eye, EyeOff, RefreshCw, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import LoadingDots from '@/components/LoadingDots';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    phone: '',
    agreeToTerms: false,
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // { username: '...', email: '...', etc. }
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Helper to calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 6) score += 1;
    if (pass.length >= 10) score += 1; // Length bonus
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1; // Mixed case
    if (/[0-9]/.test(pass)) score += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Symbols
    return score;
  };

  const generateStrongPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    // Ensure at least one of each type for better strength
    newPassword += "A"; // Uppercase placeholder (will be shuffled/overwritten mostly but guarantees non-empty start logic if needed, actually rely on random loop)

    // Better random generation
    const crypto = window.crypto || window.msCrypto;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setFormData(prev => ({ ...prev, password: newPassword, confirmPassword: newPassword }));
    setPasswordStrength(calculateStrength(newPassword));
    setFieldErrors(prev => ({ ...prev, password: null }));
    setShowPassword(true); // Show it so user can see it
  };

  const isSubmitting = status === 'loading';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
    // Clear error for this field when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    // Also clear general message if needed, or keep it
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validation
    if (!formData.agreeToTerms) {
      setStatus('error');
      setMessage('Please agree to the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setMessage('Creating your account...');
    setFieldErrors({}); // Clear previous errors

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          store_name: formData.storeName,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you for creating an account at Shopwice! Your account is pending and awaiting admin approval. You will be notified once your account is activated.');

        // Don't auto-redirect, let user read the message
        // They can click "Sign in" link when ready
      } else {
        setStatus('error');
        setMessage(data.error || 'Registration failed. Please try again.');

        // Handle specific field errors based on returned code
        if (data.code === 'username_taken') {
          setMessage(data.error); // Show global error since we don't have username field
        } else if (data.code === 'email_taken') {
          setFieldErrors(prev => ({ ...prev, email: data.error }));
        } else if (data.code === 'store_name_taken') {
          setFieldErrors(prev => ({ ...prev, storeName: data.error }));
        } else if (data.code === 'store_url_taken') {
           // Ignored as field removed
        } else if (data.code === 'weak_password') {
          setFieldErrors(prev => ({ ...prev, password: data.error }));
        }

        // Status update to 'error' already handles isSubmitting (derived from status)
      }
    } catch (err) {
      console.error('[REGISTER] Network error:', err);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  // Added relative and z-10 to ensure input is above any potential background overlaps
  const inputStyle = "mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm relative z-10";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Branding & Illustration (Desktop only) */}
        <div className="hidden lg:flex flex-col text-white space-y-10 p-4">
          <div className="space-y-6">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>

            <div className="space-y-4">
              <img src="/images/LOGO HORIZONTAL.png" alt="Shopwice" className="h-16 -ml-2 brightness-0 invert" />
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Launch Your <br />
                <span className="text-indigo-200">Digital Store</span>
              </h1>
              <p className="text-xl text-white/90 font-medium max-w-md leading-relaxed">
                Join thousands of professional vendors on Shopwice. Get your products in front of millions of customers today.
              </p>
            </div>
          </div>

          {/* Illustration/Image Section */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/30 rounded-[40px] blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500"></div>
            <div className="relative bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xl transform hover:-rotate-1 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                alt="Vendor Marketplace"
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Stats Card */}
              <div className="absolute bottom-10 right-10 bg-white rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Registration Status</p>
                    <p className="text-lg font-bold text-gray-900">Instant Approval Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">Support</p>
                <p className="text-xs font-semibold text-gray-900">24/7 Priority</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">Payments</p>
                <p className="text-xs font-semibold text-gray-900">Secure Escrow</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">Trust</p>
                <p className="text-xs font-semibold text-gray-900">Verified Badge</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">Growth</p>
                <p className="text-xs font-semibold text-gray-900">SEO Optimized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form (Mobile & Desktop) */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Only: Back Link & Heading */}
          <div className="lg:hidden mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-white hover:text-white/80 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                <UserPlus className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Vendor Signup</h1>
              <p className="text-white/90">Join the Shopwice marketplace</p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl space-y-6 border border-gray-100 overflow-hidden relative">

            {status !== 'success' ? (
              <div className="p-10 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                        First Name *
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className={`${inputStyle} pl-12`}
                          disabled={isSubmitting}
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                        Last Name *
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className={`${inputStyle} pl-12`}
                          disabled={isSubmitting}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="storeName" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Store Name *
                    </label>
                    <div className="relative group">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        name="storeName"
                        id="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                        className={`${inputStyle} pl-12`}
                        disabled={isSubmitting}
                        style={fieldErrors.storeName ? { borderColor: '#ef4444' } : {}}
                        placeholder="Your brand name"
                      />
                    </div>
                    {fieldErrors.storeName && (
                      <p className="mt-1 text-xs text-red-600 font-semibold ml-1">{fieldErrors.storeName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Email Address *
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`${inputStyle} pl-12`}
                        disabled={isSubmitting}
                        style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
                        placeholder="Enter your email"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600 font-semibold ml-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Phone Number *
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={`${inputStyle} pl-12`}
                        disabled={isSubmitting}
                        placeholder="+233 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 ml-1">
                      <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className={`${inputStyle} pl-12 pr-10`}
                        disabled={isSubmitting}
                        style={fieldErrors.password ? { borderColor: '#ef4444' } : {}}
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600 font-semibold ml-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-1 mb-4">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full transition-all duration-300 ${passwordStrength >= 1 ? 'bg-red-500 w-[20%]' : 'bg-transparent'}`}></div>
                        <div className={`h-full transition-all duration-300 ${passwordStrength >= 2 ? 'bg-red-500 w-[20%]' : 'bg-transparent'}`}></div>
                        <div className={`h-full transition-all duration-300 ${passwordStrength >= 3 ? 'bg-yellow-500 w-[20%]' : 'bg-transparent'}`}></div>
                        <div className={`h-full transition-all duration-300 ${passwordStrength >= 4 ? 'bg-green-500 w-[20%]' : 'bg-transparent'}`}></div>
                        <div className={`h-full transition-all duration-300 ${passwordStrength >= 5 ? 'bg-green-600 w-[20%]' : 'bg-transparent'}`}></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Confirm Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className={`${inputStyle} pl-12 pr-10`}
                        disabled={isSubmitting}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="pt-2">
                    <label className="flex items-start cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                        disabled={isSubmitting}
                        required
                      />
                      <span className="ml-3 text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-700 transition-colors">
                        I agree to the <a href="https://shopwice.com/sell-online-in-ghana/" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600">Terms of Service</a> and <a href="#" className="font-bold text-indigo-600">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-bold text-white transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]
                      ${isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingDots size="sm" className="mr-3" />
                        Creating...
                      </>
                    ) : (
                      'Join Now'
                    )}
                  </button>

                  {/* Error Message */}
                  {message && status === 'error' && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-900 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold leading-relaxed">{message}</p>
                      </div>
                    </div>
                  )}
                </form>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">
                    Already have an account?
                    <Link href="/login" className="font-bold text-indigo-600 hover:underline px-1">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              // Success Summary View
              <div className="p-0 animate-in fade-in zoom-in-95 duration-500">
                {/* Header section with checkmark */}
                <div className="bg-green-600 p-8 text-center text-white">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl">
                    <ShieldCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1 tracking-tight">Account Created!</h2>
                  <p className="text-green-50 font-medium">Welcome to the Shopwice community.</p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Summary</h3>

                    <div className="grid grid-cols-1 gap-4">
                      <SummaryItem icon={<Store className="w-4 h-4" />} label="Store Name" value={formData.storeName} />
                      <SummaryItem icon={<User className="w-4 h-4" />} label="Username" value={formData.username} />
                      <SummaryItem icon={<Mail className="w-4 h-4" />} label="Email Address" value={formData.email} />
                      <SummaryItem icon={<Phone className="w-4 h-4" />} label="Phone Number" value={formData.phone} />
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-2">Ready to start selling?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                      Your account has been successfully generated. You can now access your dashboard to upload products, manage inventory, and track your sales growth.
                    </p>

                    <Link
                      href="/dashboard"
                      className="w-full inline-flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                      Go to Dashboard
                      <RefreshCw className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="text-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      You can also manage your account in the settings section of your dashboard.
                    </p>
                    <Link href="/login" className="text-sm font-bold text-indigo-600 hover:underline">
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Support Button - Moved to root layout */}
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-indigo-100 hover:bg-white group">
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
