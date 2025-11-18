// app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingCart, DollarSign, Clock, 
  TrendingUp, Plus, Eye, CheckCircle, AlertCircle,
  Loader2, ArrowRight
} from 'lucide-react';
import { useLocalData } from '@/hooks/useLocalData';
import DataSyncStatus from '@/components/DataSyncStatus';

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
        // Try cache first
        const cached = localStorage.getItem('dashboard_stats');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 120000) { // 2 min cache
            setStats(data.stats);
            setRecentOrders(data.recentOrders);
            setLoading(false);
          }
        }

        const res = await fetch('/api/vendor/dashboard/stats');
        const data = await res.json();

        if (res.ok) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          localStorage.setItem('dashboard_stats', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } else {
          setError(data.error || 'Failed to load stats');
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Data Sync Status */}
      <DataSyncStatus
        lastSync={lastSync}
        syncing={syncing}
        syncProgress={syncProgress}
        onSync={() => syncData(true)}
        categories={categories.length}
        brands={brands.length}
        attributes={attributes.length}
        locations={locations.length}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm opacity-90">Total Revenue</div>
            <div className="text-xs opacity-75 mt-2">
              Today: {formatCurrency(stats.todayRevenue)}
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <div className="text-xs opacity-75 bg-white/20 px-2 py-1 rounded">
                {stats.todayOrders} today
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-sm opacity-90">Total Orders</div>
            <div className="text-xs opacity-75 mt-2">
              {stats.completedOrders} completed
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <Link 
                href="/dashboard/products/add"
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                + Add
              </Link>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
            <div className="text-sm opacity-90">Total Products</div>
            <Link 
              href="/dashboard/products"
              className="text-xs opacity-75 mt-2 inline-flex items-center gap-1 hover:opacity-100"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              {stats.pendingOrders > 0 && (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pendingOrders}</div>
            <div className="text-sm opacity-90">Pending Orders</div>
            <div className="text-xs opacity-75 mt-2">
              {stats.processingOrders} processing
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link 
              href="/dashboard/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
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
        <div className="space-y-6">
          {/* Important Notice */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/products/add"
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Add Product</div>
                  <div className="text-xs text-gray-500">Create new product</div>
                </div>
              </Link>

              <Link
                href="/dashboard/products"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Products</div>
                  <div className="text-xs text-gray-500">
                    {stats?.totalProducts || 0} products
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/orders"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">View All Orders</div>
                  <div className="text-xs text-gray-500">
                    {stats?.totalOrders || 0} total
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
