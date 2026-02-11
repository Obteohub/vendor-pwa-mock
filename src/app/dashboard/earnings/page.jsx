/* -------------------------------------------------------------------------
File: app/dashboard/earnings/page.jsx
Purpose: Earnings & withdrawals (mock)
*/


"use client";
import React from 'react';


export default function EarningsPage(){
return (
<div className="max-w-full md:max-w-4xl mx-auto p-0 md:p-6">
<div className="px-4 py-4 md:px-0">
  <h2 className="text-lg font-semibold mb-3">Earnings</h2>
</div>
<div className="p-6 md:p-8 bg-white rounded-none md:rounded-xl shadow-none md:shadow-sm border-y md:border border-gray-200">
<div className="text-xs text-slate-500 uppercase tracking-wide font-bold">Available balance</div>
<div className="text-4xl font-bold mt-2 text-gray-900">$0.00</div>
<div className="mt-6 flex items-center gap-2">
<button className="w-full md:w-auto px-6 py-3 rounded-none md:rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors shadow-sm">Request withdrawal</button>
</div>
</div>
</div>
);
}