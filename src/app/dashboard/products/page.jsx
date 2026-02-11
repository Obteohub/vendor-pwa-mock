/* -------------------------------------------------------------------------
File: app/dashboard/products/page.jsx
Purpose: Optimized Product Dashboard with Snappy Performance
Strategy: Fetch once, cache aggressively, render efficiently
------------------------------------------------------------------------- */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  RefreshCw,
  ShoppingBag
} from "lucide-react";

const API_ENDPOINT = "/api/vendor/products";
const PRODUCTS_CACHE_KEY = "products_full_list_v1";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// --- MINIMAL STATUS BADGE ---
const StatusBadge = ({ status }) => {
  const displayStatus = status || "publish";
  let styles = "";
  let label = "Unknown";

  switch (displayStatus.toLowerCase()) {
    case "publish":
    case "published":
      styles = "text-emerald-600";
      label = "Live";
      break;
    case "pending":
      styles = "text-amber-600 bg-amber-50";
      label = "Pending";
      break;
    case "draft":
      styles = "text-gray-500 bg-gray-50";
      label = "Draft";
      break;
    default:
      styles = "text-gray-500 bg-gray-50";
      label = displayStatus;
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-none text-[10px] font-medium leading-none ${styles}`}>
      {label}
    </span>
  );
};

// --- CLEAN LIST PRODUCT CARD ---
const ProductCard = ({ product, onEdit }) => {
  const price = product.price || product.regular_price || "0.00";
  const stock = product.stock_quantity !== undefined && product.stock_quantity !== null
    ? product.stock_quantity
    : "In Stock";

  const imageUrl = product.image || (product.images && product.images.length > 0 ? (product.images[0].src || product.images[0].source_url) : null);

  return (
    <div
      onClick={() => onEdit(product.id)}
      className="group bg-white border-b border-gray-100 last:border-0 py-5 md:py-6 px-4 md:px-6 flex items-center gap-4 md:gap-6 transition-colors hover:bg-gray-50/50 cursor-pointer"
    >
  // Enhanced Image - Flattened
  <div className="w-16 h-16 md:w-20 md:h-20 rounded-none overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 transition-shadow">
    {imageUrl && imageUrl !== "https://placehold.co/80x80/f8fafc/cbd5e1?text=None" ? (
      <img 
        src={imageUrl} 
        alt={product.name} 
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        onError={(e) => {
          e.target.src = "https://placehold.co/80x80/f8fafc/cbd5e1?text=No+Img";
        }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
        <ShoppingBag className="w-6 h-6" />
      </div>
    )}
  </div>

      {/* Enhanced Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5">
          <h3 className="text-base md:text-lg font-bold text-gray-900 truncate leading-tight">{product.name}</h3>
          <StatusBadge status={product.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500">
          <span className="font-bold text-indigo-600">GH₵{price}</span>
          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-none border border-gray-100">
            <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">{stock} in stock</span>
          </span>
          {product.sku && <span className="hidden lg:inline text-gray-400 font-mono tracking-tighter">SKU: {product.sku}</span>}
        </div>
      </div>

      {/* Sophisticated Action - Flattened */}
      <div className="hidden sm:block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product.id);
          }}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 border-2 border-indigo-50 rounded-none hover:border-indigo-600 hover:bg-white transition-all active:scale-95"
        >
          Modify
        </button>
      </div>
      <div className="sm:hidden">
        <div className="w-8 h-8 rounded-none flex items-center justify-center text-white bg-emerald-600 transition-transform active:scale-90">
          <Plus className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// --- SKELETON ---
const ListSkeleton = () => (
  <div className="py-4 px-4 flex items-center gap-4 animate-pulse border-b border-gray-50">
    <div className="w-12 h-12 rounded-none bg-gray-50" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-50 rounded w-1/4" />
      <div className="h-2 bg-gray-50 rounded w-1/6" />
    </div>
    <div className="w-12 h-6 bg-gray-50 rounded" />
  </div>
);

export default function VendorProductsPage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const isFetchingRef = useRef(false);

  // Load from localStorage cache immediately
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setAllProducts(data);
          setDisplayedProducts(data.slice(0, 20));
          return true;
        }
      }
    } catch (err) {
      console.warn('Cache load failed:', err);
    }
    return false;
  }, []);

  // Fetch all products at once
  const fetchAllProducts = useCallback(async (forceRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (forceRefresh) setIsRefreshing(true);
    else if (allProducts.length === 0) setLoading(true);

    setError(null);

    try {
      let allData = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const response = await fetch(
          `${API_ENDPOINT}?page=${page}&per_page=100${forceRefresh ? '&refresh=true' : ''}`,
          { method: "GET", credentials: "include" }
        );

        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          allData = [...allData, ...data];
          hasMore = data.length === 100;
          page++;
        } else {
          hasMore = false;
        }

        // Safety limit
        if (page > 50) break;
      }

      // Cache the results
      try {
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
          data: allData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.warn('Cache save failed:', err);
      }

      setAllProducts(allData);
      setDisplayedProducts(allData.slice(0, displayCount));

    } catch (err) {
      console.error('Fetch error:', err);
      if (allProducts.length === 0) setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [allProducts.length, displayCount]);

  // Initial load: try cache first, then fetch
  useEffect(() => {
    const hasCache = loadFromCache();
    // Even if we have cache, if it's empty, let's fetch fresh data
    if (!hasCache || allProducts.length === 0) {
      console.log('[DEBUG] Initial load: No cache or empty products, fetching...');
      fetchAllProducts(false);
    } else {
      console.log('[DEBUG] Initial load: Serving from local cache', allProducts.length, 'items');
    }
  }, []);

  // Filter and paginate products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return displayedProducts;
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    ).slice(0, displayCount);
  }, [searchQuery, allProducts, displayedProducts, displayCount]);

  // Load more handler
  const loadMore = useCallback(() => {
    const newCount = displayCount + 20;
    setDisplayCount(newCount);
    if (!searchQuery.trim()) {
      setDisplayedProducts(allProducts.slice(0, newCount));
    }
  }, [displayCount, allProducts, searchQuery]);

  const hasMore = useMemo(() => {
    if (searchQuery.trim()) {
      const totalFiltered = allProducts.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
      return filteredProducts.length < totalFiltered;
    }
    return displayedProducts.length < allProducts.length;
  }, [searchQuery, allProducts, displayedProducts, filteredProducts]);

  return (
    <div className="min-h-screen bg-white font-sans w-full pb-20">
      <div className="w-full">

        {/* Minimal Header */}
        <div className="flex items-end justify-between pb-4 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Your Products</h1>
            <p className="text-xs text-gray-400 mt-1">
              {allProducts.length} items catalogued
              {searchQuery && ` · ${filteredProducts.length} matches`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllProducts(true)}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/dashboard/products/add')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
          </div>
        </div>

        {/* Minimal Search */}
        <div className="relative px-4 py-4 border-b border-gray-100">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 ml-4" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 py-2 bg-gray-50 outline-none text-sm text-gray-900 placeholder:text-gray-400 rounded-none border border-gray-200 focus:border-indigo-200 transition-all font-normal"
          />
        </div>

        {/* List */}
        <div className="bg-white">
          {error && allProducts.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="mb-4 text-rose-500 font-bold">Error Loading Products</div>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">{error}</p>
              <button 
                onClick={() => fetchAllProducts(true)}
                className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest"
              >
                Try Again
              </button>
            </div>
          ) : loading && allProducts.length === 0 ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <ListSkeleton key={i} />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="py-32 text-center px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-xs text-gray-500 mb-6">You haven't added any products to your catalog yet.</p>
              <button 
                onClick={() => router.push('/dashboard/products/add')}
                className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(id) => router.push(`/dashboard/products/edit/${id}`)}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && !searchQuery && (
            <div className="p-8 text-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
