// Login page loading skeleton
export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-5">
            {/* Username field skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            {/* Password field skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            {/* Button skeleton */}
            <div className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
