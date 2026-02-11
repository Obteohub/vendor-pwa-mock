// File: src/app/dashboard/products/[id]/ProductEditForm.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { useLocalData } from "@/hooks/useLocalData";
import LocationSelector from "@/components/LocationSelector";

/**
 * ProductEditForm
 * Allows vendors to update product details.
 * Handles new image uploads and updates via FormData.
 */
export default function ProductEditForm({ productId, initialData }) {
  const { locations } = useLocalData();
  const [form, setForm] = useState({
    title: initialData.title || "",
    price: initialData.price || "",
    stock: initialData.stock || "",
    location_ids: initialData.locations?.map(l => typeof l === 'object' ? l.id : l) || [],
  });

  const [newFiles, setNewFiles] = useState([]); // Newly uploaded files
  const [existingImages, setExistingImages] = useState(initialData.images || []); // Current product images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /**
   * Submit handler for product updates
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();

    // WooCommerce-compatible field names
    formData.append("name", form.title.trim());
    formData.append("regular_price", form.price);
    formData.append("stock_quantity", form.stock);
    formData.append("_method", "PUT"); // For API route compatibility
    formData.append("location_ids_json", JSON.stringify(form.location_ids));

    // Add new image files
    newFiles.forEach((file) => formData.append("images[]", file));

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "POST", // Using POST because of FormData; _method handles PUT
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product.");
      }

      alert("✅ Product updated successfully!");
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Product update error:", err);
      setError(err.message || "Network error during product update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-full md:max-w-3xl mx-auto">
      <div className="px-4 md:px-0">
        <h2 className="text-l font-semibold mb-4">
          Edit Product: {initialData.title}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 md:p-8 rounded-none md:rounded-xl shadow-none md:shadow-sm border-y md:border border-gray-200"
      >
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-none md:rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs text-slate-600">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full p-2 rounded-none md:rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600">Price</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full p-2 rounded-none md:rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Stock</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              type="number"
              min="0"
              className="mt-1 w-full p-2 rounded-none md:rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Locations */}
        <div className="pt-2">
            <LocationSelector
              locations={locations}
              selectedIds={form.location_ids}
              onChange={(ids) => setForm({ ...form, location_ids: ids })}
              label="Locations"
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="pt-2">
            <label className="text-xs text-slate-600 block mb-2">
              Current Images
            </label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  alt="Existing Product"
                  className="w-16 h-16 object-cover rounded-none md:rounded-md border"
                />
              ))}
            </div>
          </div>
        )}

        {/* New Image Upload */}
        <div className="pt-2">
          <label className="text-xs text-slate-600 block mb-1">
            Add New Images
          </label>
          <ImageUpload onFilesChange={setNewFiles} multiple />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/products")}
            className="px-4 py-2 rounded-none md:rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-none md:rounded-lg bg-blue-600 text-white text-sm disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
