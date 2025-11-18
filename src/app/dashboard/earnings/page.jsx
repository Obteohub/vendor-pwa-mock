/* -------------------------------------------------------------------------
File: app/dashboard/earnings/page.jsx
Purpose: Earnings & withdrawals (mock)
*/


"use client";
import React from 'react';


export default function EarningsPage(){
return (
<div>
<h2 className="text-lg font-semibold mb-3">Earnings</h2>
<div className="p-4 bg-white rounded-xl shadow-sm">
<div className="text-xs text-slate-500">Available balance</div>
<div className="text-2xl font-bold mt-1">$0.00</div>
<div className="mt-3 flex items-center gap-2">
<button className="px-3 py-1 rounded-lg bg-orange-500 text-white">Request withdrawal</button>
</div>
</div>
</div>
);
}