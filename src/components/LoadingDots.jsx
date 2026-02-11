"use client";

// Reusable 3-dot loading indicator component
// Colors: Orange, Blue, Black

export default function LoadingDots({ size = 'md', className = '' }) {
  // Size variants
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Orange dot */}
      <div 
        className={`${dotSize} rounded-full bg-orange-500 animate-bounce`}
        style={{ animationDelay: '0ms', animationDuration: '600ms' }}
      ></div>
      
      {/* Blue dot */}
      <div 
        className={`${dotSize} rounded-full bg-blue-600 animate-bounce`}
        style={{ animationDelay: '150ms', animationDuration: '600ms' }}
      ></div>
      
      {/* Black dot */}
      <div 
        className={`${dotSize} rounded-full bg-gray-900 animate-bounce`}
        style={{ animationDelay: '300ms', animationDuration: '600ms' }}
      ></div>
    </div>
  );
}
