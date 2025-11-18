/* -------------------------------------------------------------------------
File: app/dashboard/orders/page.jsx
Purpose: Vendor orders list with filtering and pagination
*/

"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Package, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CACHE_KEY = 'orders_cache';
const CACHE_DURATION = 30000; // 30 seconds

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const perPage = 20;

  // Get cache key for current view
  const getCacheKey = (currentPage, status) => {
    return `${CACHE_KEY}_${status}_${currentPage}`;
  };

  // Load from cache
  const loadFromCache = (currentPage, status) => {
    try {
      const cacheKey = getCacheKey(currentPage, status);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_DURATION) {
          console.log(`✓ Loaded orders from cache (${Math.round(age / 1000)}s old)`);
          return data;
        }
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return null;
  };

  // Save to cache
  const saveToCache = (currentPage, status, data) => {
    try {
      const cacheKey = getCacheKey(currentPage, status);
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Cache write error:', err);
    }
  };

  // Load orders with caching
  const loadOrders = async (currentPage = 1, status = 'all', useCache = true) => {
    // Try cache first for instant loading
    if (useCache) {
      const cached = loadFromCache(currentPage, status);
      if (cached) {
        setOrders(cached.orders || []);
        setPagination(cached.pagination);
        setLoading(false);
        // Still fetch fresh data in background
        loadOrders(currentPage, status, false);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });

      if (status !== 'all') {
        params.append('status', status);
      }

      const res = await fetch(`/api/vendor/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load orders');
      }

      setOrders(data.orders || []);
      setPagination(data.pagination);
      
      // Save to cache
      saveToCache(currentPage, status, data);
      
      console.log(`✓ Loaded ${data.orders?.length || 0} orders from API`);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadOrders(page, statusFilter);
  }, [page, statusFilter]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { icon: AlertCircle, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      'on-hold': { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'On Hold' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      refunded: { icon: XCircle, color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
    };

    const config = statusConfig[status] || { icon: Package, color: 'bg-gray-100 text-gray-800', label: status };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `GH₵${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your customer orders
          </p>
        </div>
      </div>

      {/* Quick stats */}
      {pagination && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</div>
                <div className="text-sm text-gray-500">Pending (This Page)</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</div>
                <div className="text-sm text-gray-500">Completed (This Page)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {['all', 'pending', 'processing', 'on-hold', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Error loading orders</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={() => loadOrders(page, statusFilter)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-sm text-gray-500">
                {statusFilter === 'all' 
                  ? 'You haven\'t received any orders yet.'
                  : `No ${statusFilter} orders found.`}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.date_created)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.billing?.first_name} {order.billing?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{order.billing?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                            onMouseEnter={() => {
                              // Prefetch order details on hover for instant loading
                              fetch(`/api/vendor/orders/${order.id}`).catch(() => {});
                            }}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(order.date_created)}</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {order.billing?.first_name} {order.billing?.last_name}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</div>
                      <button
                        onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        onMouseEnter={() => {
                          // Prefetch order details on hover for instant loading
                          fetch(`/api/vendor/orders/${order.id}`).catch(() => {});
                        }}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.total_pages} ({pagination.total} total orders)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.has_more}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
