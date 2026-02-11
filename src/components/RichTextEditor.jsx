"use client";

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2, X } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.css';

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse border border-gray-200 rounded-none md:rounded-xl"></div>,
});

export default function RichTextEditor({ value, onChange, placeholder, label, height = "h-64" }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle body scroll locking when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isFullscreen]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link', 'image'
  ];

  const handleChange = (content) => {
    onChange(content);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`rich-text-editor ${isFullscreen ? 'fixed inset-0 z-[1000] bg-white flex flex-col p-4 md:p-8' : 'relative'}`}>
      <div className="flex items-center justify-between mb-2">
        {label && <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Minimize</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Full Screen</span>
            </>
          )}
        </button>
      </div>

      <div className={`
        bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all
        ${isFullscreen ? 'flex-1 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden' : 'rounded-none md:rounded-xl overflow-hidden'}
      `}>
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className={`
            editor-content
            ${isFullscreen ? 'h-full flex flex-col' : `${height} mb-12`}
          `}
        />
      </div>

      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 md:top-10 md:right-10 p-3 bg-white shadow-2xl rounded-full text-gray-900 border border-gray-100 z-[1001] hover:scale-110 active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
