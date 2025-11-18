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
    <div>
      <h2 className="text-lg font-semibold mb-3">Store setup</h2>
      
      <form onSubmit={save} className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
        
        <div>
          <label className="text-xs text-slate-600">Store name</label>
          <input 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            className="mt-1 p-2 w-full rounded-lg border" 
            placeholder="e.g. Theo's Gadgets" 
            required // Ensure store name is mandatory
          />
        </div>
        
        <div>
          <label className="text-xs text-slate-600">Location (optional)</label>
          <input 
            value={form.location} 
            onChange={e => setForm({ ...form, location: e.target.value })} 
            className="mt-1 p-2 w-full rounded-lg border" 
            placeholder="Accra, Ghana" 
          />
        </div>
        
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        
        <div className="flex items-center gap-2 pt-2">
          <button 
            type="submit"
            disabled={loading} 
            className="px-3 py-1 rounded-lg bg-blue-600 text-white disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}