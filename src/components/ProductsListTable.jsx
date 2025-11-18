// File: components/ProductListTable.jsx (CSS Refinements)
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Note: Assuming the custom button classes (btn-edit-outline, btn-danger-outline) 
// are defined in your src/app/globals.css for consistency.

export default function ProductListTable({ initialProducts }) {
    const [products, setProducts] = useState(initialProducts);
    const [deletingId, setDeletingId] = useState(null); // Track which product is being deleted
    const router = useRouter(); 

    // --- Product Deletion (Client-side action) ---
    async function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        setDeletingId(productId); // Start loading state for this item

        try {
            // Call the DELETE API endpoint (using dynamic path)
            const res = await fetch(`/api/vendor/products/${productId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Success: update local state immediately
                setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
                // Optional: router.refresh() if you prefer a full server re-fetch
            } else {
                const j = await res.json();
                alert(`Deletion failed: ${j.error || 'Server error.'}`);
            }
        } catch (err) {
            alert('Network error during deletion.');
        } finally {
            setDeletingId(null); // End loading state
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-gray-100"> {/* Added shadow-lg and ring */}
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr className="bg-gray-50"> {/* Added light background to header */}
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100"> {/* Finer divide lines */}
                    {products.map((product) => (
                        <tr 
                            key={product.id} 
                            className="hover:bg-indigo-50/20 transition-colors duration-150" // Subtle hover effect
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                                <Link href={`/dashboard/products/${product.id}`} className="hover:underline">
                                    {product.title}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">${product.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{product.lastUpdated}</td>
                            
                            {/* Actions Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                
                                {/* Edit Link */}
                                <Link 
                                    href={`/dashboard/products/${product.id}`} 
                                    // Applied a custom class for edit button styling
                                    className="px-3 py-1 rounded-md border border-indigo-300 text-indigo-700 text-xs hover:bg-indigo-50 transition" 
                                >
                                    Edit
                                </Link>
                                
                                {/* Delete Button */}
                                <button 
                                    onClick={() => deleteProduct(product.id)} 
                                    // Applied a custom class for delete button styling
                                    className="px-3 py-1 rounded-md border border-red-300 text-red-600 text-xs hover:bg-red-50 transition disabled:opacity-50"
                                    disabled={deletingId === product.id} // Disable only the deleting button
                                >
                                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {products.length === 0 && (
                <p className="text-center py-10 text-slate-500 border-t border-gray-200">
                    No products found. Start adding some!
                </p>
            )}
        </div>
    );
}