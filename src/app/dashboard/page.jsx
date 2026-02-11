// app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingCart, DollarSign, Clock, 
  TrendingUp, Plus, Eye, CheckCircle, AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import LoadingDots from '@/components/LoadingDots';
import DashboardLoading from './loading';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local data sync status
  const {
    categories,
    brands,
    attributes,
    locations,
    lastSync,
    syncing,
    syncProgress,
    syncData
  } = useLocalData();

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        let statsData = null;
        let recentOrdersData = [];
        let usedCache = false;

        // 1. Try dashboard stats cache
        const cached = localStorage.getItem('dashboard_stats');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 120000) { // 2 min cache
            statsData = data.stats;
            recentOrdersData = data.recentOrders;
            usedCache = true;
          }
        }

        // 2. If no cache, fetch from API
        if (!usedCache) {
          const res = await fetch('/api/vendor/dashboard/stats');
          const data = await res.json();

          if (res.ok) {
            // Map new API structure to component state
            statsData = {
              totalRevenue: data.sales?.total_sales || 0,
              todayRevenue: data.orders?.today_revenue || 0,
              todayOrders: data.orders?.today_count || 0,
              totalOrders: data.sales?.total_orders || 0,
              completedOrders: data.orders?.completed || 0,
              totalProducts: data.products?.total || 0,
              pendingOrders: data.orders?.pending || 0,
              processingOrders: data.orders?.processing || 0,
            };
            recentOrdersData = data.orders?.recent || [];
          } else {
            setError(data.error || 'Failed to load stats');
            setLoading(false);
            return;
          }
        }

        // 3. Override totalProducts from Product List source (Cache or API)
        // User requested to use product list page count logic
        let productCount = statsData?.totalProducts || 0;
        
        try {
          // Try product list cache first (same as product list page)
          const productsCache = localStorage.getItem('products_full_list_v1');
          if (productsCache) {
             const { data } = JSON.parse(productsCache);
             if (Array.isArray(data)) {
               productCount = data.length;
             }
          } else {
             // If no local cache, fetch count from products API (lightweight check)
             const pRes = await fetch('/api/vendor/products?per_page=1');
             if (pRes.ok) {
                const totalHeader = pRes.headers.get('X-WP-Total');
                if (totalHeader) {
                  productCount = parseInt(totalHeader, 10);
                }
             }
          }
        } catch (e) {
          console.warn('Failed to resolve product count from list source', e);
        }
        
        // Update stats with correct product count
        const finalStats = { ...statsData, totalProducts: productCount };
        
        setStats(finalStats);
        setRecentOrders(recentOrdersData);

        // Update dashboard cache with the corrected data if we fetched fresh
        if (!usedCache) {
          localStorage.setItem('dashboard_stats', JSON.stringify({
            data: { stats: finalStats, recentOrders: recentOrdersData },
            timestamp: Date.now()
          }));
        }

      } catch (err) {
        console.error('Error loading stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return `GH₵${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };
    const c = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-0.5 rounded-none text-xs font-medium ${c.color}`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="w-full pb-20">
      {/* Welcome */}
      <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-lg text-white mb-6 rounded-2xl mx-4 mt-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-indigo-100 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-4 mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              Today: <span className="text-gray-600">{formatCurrency(stats.todayRevenue)}</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">
                {stats.todayOrders} today
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              {stats.completedOrders} completed
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <Link 
                href="/dashboard/products/add"
                className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-2.5 py-1 rounded-full font-medium transition-colors"
              >
                + Add
              </Link>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
            <div className="text-sm text-gray-500">Total Products</div>
            <Link 
              href="/dashboard/products"
              className="text-xs text-purple-600 mt-2 inline-flex items-center gap-1 hover:text-purple-700 font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Pending Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              {stats.pendingOrders > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Action needed
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</div>
            <div className="text-sm text-gray-500">Pending Orders</div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              {stats.processingOrders} processing
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link 
              href="/dashboard/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-none flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(order.total)}</div>
                      <StatusBadge status={order.status} />
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-0 border-l border-gray-200 bg-white">
          {/* Important Notice */}
          <div className="bg-amber-50 border-b border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-none flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Keep Your Store Updated</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Always make sure your prices and product stock information are updated using this app. 
                  That way customers will purchase more from you because you're reliable.
                </p>
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Update products now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions removed */}
        </div>
      </div>
    </div>
  );
}
