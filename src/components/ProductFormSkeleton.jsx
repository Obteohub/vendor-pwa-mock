import React from 'react';

export default function ProductFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      <div className="space-y-10 pb-32">
        {/* Section 1: Basic Information */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gray-200"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
              </div>
            </div>

            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded-xl w-full"></div>
            </div>

            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing & Stock */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gray-200"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        </section>

        {/* Section 3: Categories & Branding */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gray-200"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>

          <div className="space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
