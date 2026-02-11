// File: src/components/ImageUpload.jsx
"use client";
import React, { useState, useEffect } from 'react';

export default function ImageUpload({ onFilesChange, multiple = false }) {
    const [previews, setPreviews] = useState([]);

    // Cleans up object URLs when the component changes or unmounts
    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        
        // Create temporary URLs for previewing images
        const newPreviews = files.map(file => URL.createObjectURL(file));
        
        setPreviews(newPreviews);
        
        // Pass the actual File objects back to the parent form (AddProduct)
        onFilesChange(files);
    };

    return (
        <div className="w-full bg-gray-50 border-b border-gray-200 rounded-none p-0">
            <input 
                type="file" 
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden" // Hides the default file input
                id="image-upload"
            />
            
            <label 
                htmlFor="image-upload"
                className="block text-center py-6 cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
                {previews.length > 0 ? `Change/Add Images (${previews.length} selected)` : 'Click to Upload Images'}
            </label>

            {/* Display image previews */}
            {previews.length > 0 && (
                <div className="p-4 pt-0 flex flex-wrap gap-2">
                    {previews.map((url, index) => (
                        <div key={index} className="w-16 h-16 relative">
                            <img 
                                src={url} 
                                alt={`Preview ${index}`} 
                                className="w-full h-full object-cover rounded-none border border-gray-200"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}