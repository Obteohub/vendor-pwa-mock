/* -------------------------------------------------------------------------
File: app/dashboard/orders/[id]/page.jsx
Purpose: Single order details view
*/

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

// Order Status Update Component
function OrderStatusUpdate({ orderId, currentStatus, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);

  const statusOptions = [
    { value: 'pending', label: 'Pending Payment', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'on-hold', label: 'On Hold', color: 'gray' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const handleStatusChange = async () => {
    if (newStatus === currentStatus) {
      setShowConfirm(false);
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setShowConfirm(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(!showConfirm)}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        Update Status
      </button>

      {showConfirm && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
          
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleStatusChange}
              disabled={isUpdating || newStatus === currentStatus}
              className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Confirm'
              )}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setNewStatus(currentStatus);
              }}
              className="px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CACHE_KEY = 'order_details_cache';
const CACHE_DURATION = 60000; // 60 seconds for order details

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load from cache
  const loadFromCache = (id) => {
    try {
      const cacheKey = `${CACHE_KEY}_${id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_DURATION) {
          console.log(`✓ Loaded order from cache (${Math.round(age / 1000)}s old)`);
          return data;
        }
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return null;
  };

  // Save to cache
  const saveToCache = (id, data) => {
    try {
      const cacheKey = `${CACHE_KEY}_${id}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Cache write error:', err);
    }
  };

  // Load order details with caching
  useEffect(() => {
    const loadOrder = async (useCache = true) => {
      // Try cache first for instant loading
      if (useCache) {
        const cached = loadFromCache(orderId);
        if (cached) {
          setOrder(cached);
          setLoading(false);
          // Still fetch fresh data in background
          loadOrder(false);
          return;
        }
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(`/api/vendor/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load order');
        }

        setOrder(data.order);
        saveToCache(orderId, data.order);
        console.log(`✓ Loaded order ${orderId} from API`);
      } catch (err) {
        console.error('Error loading order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Format currency
  const formatCurrency = (amount) => {
    return `GH₵${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { icon: Package, color: 'bg-gray-100 text-gray-800', label: status };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading order...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Error loading order</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.date_created)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <OrderStatusUpdate orderId={order.id} currentStatus={order.status} onUpdate={() => window.location.reload()} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {order.line_items?.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                  {item.image?.src && (
                    <img
                      src={item.image.src}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.meta_data?.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.meta_data.map((meta, idx) => (
                          <div key={idx}>
                            {meta.display_key}: {meta.display_value}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(item.total)}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(item.price)} each</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.total - order.total_tax - order.shipping_total)}</span>
              </div>
              {parseFloat(order.shipping_total) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatCurrency(order.shipping_total)}</span>
                </div>
              )}
              {parseFloat(order.total_tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatCurrency(order.total_tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-900">
                {order.billing?.first_name} {order.billing?.last_name}
              </div>
              {order.billing?.email && (
                <div className="text-gray-600">{order.billing.email}</div>
              )}
              {order.billing?.phone && (
                <div className="text-gray-600">{order.billing.phone}</div>
              )}
            </div>
          </div>

          {/* Billing address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Billing Address</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {order.billing?.address_1 && <div>{order.billing.address_1}</div>}
              {order.billing?.address_2 && <div>{order.billing.address_2}</div>}
              {order.billing?.city && <div>{order.billing.city}</div>}
              {order.billing?.state && <div>{order.billing.state}</div>}
              {order.billing?.postcode && <div>{order.billing.postcode}</div>}
              {order.billing?.country && <div>{order.billing.country}</div>}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Shipping Address</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {order.shipping?.address_1 && <div>{order.shipping.address_1}</div>}
                {order.shipping?.address_2 && <div>{order.shipping.address_2}</div>}
                {order.shipping?.city && <div>{order.shipping.city}</div>}
                {order.shipping?.state && <div>{order.shipping.state}</div>}
                {order.shipping?.postcode && <div>{order.shipping.postcode}</div>}
                {order.shipping?.country && <div>{order.shipping.country}</div>}
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="text-gray-900 font-medium">{order.payment_method_title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${order.date_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.date_paid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.date_paid && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  Paid on {formatDate(order.date_paid)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
