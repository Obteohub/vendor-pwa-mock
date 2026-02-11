// File: app/dashboard/store/page.jsx
// Purpose: Store setup form with API integration

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StoreSetup(){
  const [form, setForm] = useState({ name:'', location:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter(); 

  async function save(e){ 
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
      // 1. Call the API route created earlier
      const res = await fetch('/api/vendor/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const j = await res.json();
      setLoading(false);

      if (!res.ok) {
        // 2. Handle API errors (e.g., 400 Bad Request, 401 Unauthorized)
        setError(j.error || 'Failed to save store details.');
        return;
      }

      // 3. Success Feedback
      alert('✅ Store details saved successfully!'); 
      // Optional: Navigate back to the dashboard home after success
      // router.push('/dashboard'); 

    } catch (err) {
      // 4. Handle network/fetch errors
      setLoading(false);
      setError('Network error: Could not connect to the server.');
    }
  }

  return (
    <div className="max-w-full md:max-w-4xl mx-auto p-0 md:p-6">
      <div className="px-4 py-4 md:px-0">
        <h2 className="text-lg font-semibold mb-3">Store setup</h2>
      </div>
      
      <form onSubmit={save} className="space-y-3 bg-white p-6 md:p-8 rounded-none md:rounded-xl shadow-none md:shadow-sm border-y md:border border-gray-200">
        
        <div>
          <label className="text-xs text-slate-600">Store name</label>
          <input 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            className="mt-1 p-2 w-full rounded-none md:rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="e.g. Theo's Gadgets" 
            required // Ensure store name is mandatory
          />
        </div>
        
        <div>
          <label className="text-xs text-slate-600">Location (optional)</label>
          <input 
            value={form.location} 
            onChange={e => setForm({ ...form, location: e.target.value })} 
            className="mt-1 p-2 w-full rounded-none md:rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Accra, Ghana" 
          />
        </div>
        
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        
        <div className="flex items-center gap-2 pt-2">
          <button 
            type="submit"
            disabled={loading} 
            className="w-full md:w-auto px-6 py-3 rounded-none md:rounded-lg bg-blue-600 text-white font-medium disabled:bg-blue-400 hover:bg-blue-700 transition-colors shadow-sm"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}