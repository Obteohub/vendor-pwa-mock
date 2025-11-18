"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  Tag,
  Calendar,
  Pencil,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { fetchWithCache } from "@/lib/apiClient";

// ✅ Using your internal API route (server-side fetch with JWT cookie)
const API_ENDPOINT = "/api/products";

// --- REUSABLE EMPTY STATE COMPONENT ---
const EmptyState = ({
  icon: Icon,
  title,
  message,
  buttonText,
  onAction,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-md border border-gray-200 mt-10 w-full max-w-lg mx-auto">
      {isLoading ? (
        <Loader className="w-12 h-12 text-indigo-500 animate-spin" />
      ) : (
        <Icon className="w-12 h-12 text-gray-400" />
      )}
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 text-center">{message}</p>
      {buttonText && onAction && !isLoading && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            {buttonText}
          </button>
        </div>
      )}
      {isLoading && <p className="mt-2 text-sm text-indigo-500">Please wait...</p>}
    </div>
  );
};

// --- INDIVIDUAL PRODUCT CARD ---
const ProductCard = ({ product, onEdit }) => {
  const getStatusBadge = (status) => {
    let color = "";
    switch (status) {
      case "publish":
      case "published":
        color = "bg-green-100 text-green-800";
        break;
      case "pending":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "draft":
        color = "bg-gray-100 text-gray-800";
        break;
      default:
        color = "bg-red-100 text-red-800";
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const price = product.price || product.regular_price || "N/A";
  const stock =
    product.stock_quantity !== null ? product.stock_quantity : "N/A";
  const imageUrl =
    product.images?.[0]?.src ||
    "https://placehold.co/60x60/f0f0f0/333333?text=No+Img";
  const date = product.date_created
    ? new Date(product.date_created).toLocaleDateString()
    : "Unknown Date";

  return (
    <div className="flex items-center bg-white p-3 rounded-lg border border-gray-200">
      <div className="flex-shrink-0 mr-3">
        <img
          className="h-14 w-14 rounded-md object-cover"
          src={imageUrl}
          alt={product.name}
        />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base text-gray-900 truncate">
            {product.name}
          </h2>
          <div>
            {getStatusBadge(product.status)}
          </div>
        </div>

        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
          <p className="flex items-center">
            <Tag className="w-3 h-3 mr-1.5 text-indigo-500" />
            <strong className="text-gray-800">Price:</strong>&nbsp;GH₵{price}
          </p>
          <p className="flex items-center">
            <Truck className="w-3 h-3 mr-1.5 text-blue-500" />
            <strong className="text-gray-800">Stock:</strong>&nbsp;
            {stock > 0 ? stock : "Out of Stock"}
          </p>
          <p className="flex items-center">
            <Calendar className="w-3 h-3 mr-1.5 text-purple-500" />
            <strong className="text-gray-800">Created:</strong>&nbsp;{date}
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-1.5 ml-3 flex-shrink-0">
        <button
          className="flex items-center justify-center px-2.5 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition duration-150 shadow-sm"
          onClick={() => onEdit(product.id)}
          title="Edit Product"
        >
          <Pencil className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const ProductCardSkeleton = () => (
  <div className="flex items-center bg-white p-3 shadow-sm rounded-lg border border-gray-100 animate-pulse">
    <div className="flex-shrink-0 mr-3">
      <div className="h-14 w-14 rounded-md bg-gray-200"></div>
    </div>
    <div className="flex-grow min-w-0">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="flex-shrink-0 ml-3">
      <div className="h-8 w-16 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Search state - must be declared with other useState hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchProducts = useCallback(async (page = 1, append = false, forceRefresh = false) => {
    if (!append && !forceRefresh) {
      setLoading(true);
      setError(null);
    } else if (forceRefresh) {
      setIsRefreshing(true);
    }

    try {
      // Use fetchWithCache for instant loading from cache
      // fetchWithCache automatically returns cached data first if available
      const cacheKey = `products_page_${page}`;
      const data = await fetchWithCache(
        `${API_ENDPOINT}?page=${page}&per_page=20`, // Increased from 10 to 20
        {
          method: "GET",
          credentials: "include",
        },
        {
          cacheKey,
          maxAge: 2 * 60 * 1000, // 2 minutes cache
          forceRefresh: forceRefresh,
          fallbackToCache: true, // Use cache if network fails
        }
      );

      if (Array.isArray(data)) {
        if (append) {
          setProducts(prev => [...prev, ...data]);
        } else {
          setProducts(data);
        }
        
        // Check if there are more products
        setHasMore(data.length === 20);
        setCurrentPage(page);
        
        // Prefetch next page in background if we have more
        if (data.length === 20 && page === 1 && !forceRefresh) {
          // Prefetch page 2 in background
          setTimeout(() => {
            fetchProducts(2, false, false).catch(() => {});
          }, 100);
        }
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error("Product Fetch Error:", err);
      
      // If we have cached products, don't show error
      if (products.length > 0 && !forceRefresh) {
        console.warn("Using cached products due to fetch error");
        return;
      }
      
      if (err.isTimeout || err.name === 'AbortError') {
        setError('Request timed out. Showing cached data if available.');
      } else if (err.isOffline) {
        setError('No internet connection. Showing cached data if available.');
      } else {
        setError(err.message || 'Failed to load products');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [products.length]);

  // Load products on mount
  useEffect(() => {
    fetchProducts(1, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchProducts(1, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products based on search - MUST be before any early returns
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.categories?.some(cat => cat.name?.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Show skeleton loaders only on initial load with no cached data
  if (loading && products.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4 border-b pb-3">
          <h1 className="text-xl font-bold text-gray-900">Your Products</h1>
          <button
            onClick={() => router.push('/dashboard/products/add')}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 flex items-center text-sm"
          >
            <Package className="w-4 h-4 mr-2" /> Add New
          </button>
        </header>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="mb-4">
        <div className="flex justify-between items-center mb-3 border-b pb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Your Products ({filteredProducts.length})
            </h1>
            {isRefreshing && (
              <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard/products/add')}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 flex items-center text-sm"
          >
            <Package className="w-4 h-4 mr-2" /> Add New
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </header>

      {error && products.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-yellow-900 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {error && products.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              {error} Showing cached data.
            </p>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && !loading ? (
        <EmptyState
          icon={Package}
          title={searchQuery ? "No Products Found" : "No Products Yet"}
          message={searchQuery ? `No products match "${searchQuery}"` : "You haven't added any products yet."}
          buttonText={searchQuery ? undefined : "Add New Product"}
          onAction={searchQuery ? undefined : () => router.push('/dashboard/products/add')}
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={(id) => router.push(`/dashboard/products/edit/${id}`)}
              />
            ))}
            {loading && filteredProducts.length > 0 && (
              <>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </>
            )}
          </div>
          
          {hasMore && !loading && (
            <div className="mt-4 text-center">
              <button
                onClick={() => fetchProducts(currentPage + 1, true, false)}
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition duration-150"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
