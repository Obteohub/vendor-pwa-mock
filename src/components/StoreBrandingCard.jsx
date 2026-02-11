"use client";

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Check, Loader2, Save } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function StoreBrandingCard() {
    const { user, refreshUser } = useAuthStore();
    const [logoLoading, setLogoLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Temp previews
    const [previews, setPreviews] = useState({
        logo: user?.store_logo || null,
        banner: user?.store_banner || null
    });

    const handleFileUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        const setLoading = type === 'logo' ? setLogoLoading : setBannerLoading;
        setLoading(true);
        setMessage({ type: '', text: '' });

        // 1. Show local preview instantly
        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [type]: objectUrl }));

        try {
            // 2. Upload to Media Bridge (Binary pattern)
            const res = await fetch('/api/vendor/media', {
                method: 'POST',
                headers: {
                    'Content-Type': file.type,
                    'X-File-Name': file.name
                },
                body: file // Binary body
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            // 3. Save the URL to the temporary state
            const uploadedUrl = data.url || data.src;
            setPreviews(prev => ({ ...prev, [type]: uploadedUrl }));

            console.log(`[BRANDING] ${type} uploaded:`, uploadedUrl);

        } catch (error) {
            console.error(`[BRANDING] Error uploading ${type}:`, error);
            setMessage({ type: 'error', text: `Failed to upload ${type}: ${error.message}` });
            // Revert preview on error
            setPreviews(prev => ({ ...prev, [type]: user?.[`store_${type}`] || null }));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranding = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/vendor/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_logo: previews.logo,
                    store_banner: previews.banner
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to save branding');

            setMessage({ type: 'success', text: 'Branding updated successfully!' });

            // Refresh user data globally in store
            await refreshUser();

        } catch (error) {
            console.error('[BRANDING] Save error:', error);
            setMessage({ type: 'error', text: `Save failed: ${error.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Store Branding</h2>
                {message.text && (
                    <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message.type === 'success' ? <Check className="w-3 h-3" /> : '!'}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="p-8 space-y-8">
                {/* Banner Section */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block">Store Banner</label>
                    <div className="relative group h-40 w-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors">
                        {previews.banner ? (
                            <img src={previews.banner} alt="Store Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs font-medium">No banner set</span>
                            </div>
                        )}

                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} disabled={bannerLoading} />
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                {bannerLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                            </div>
                        </label>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">Recommended size: 1200x400px (JPG/PNG)</p>
                </div>

                {/* Logo Section */}
                <div className="flex flex-col sm:flex-row items-start gap-8">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block">Store Logo</label>
                        <div className="relative group w-32 h-32 bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors">
                            {previews.logo ? (
                                <img src={previews.logo} alt="Store Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-medium">No logo</span>
                                </div>
                            )}

                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} disabled={logoLoading} />
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                    {logoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 pt-8">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your logo and banner are the first things customers see. Make sure they are high-quality and represent your brand well.
                        </p>
                        <button
                            onClick={handleSaveBranding}
                            disabled={isSaving || logoLoading || bannerLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-black transition-all shadow-md hover:shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Branding Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
