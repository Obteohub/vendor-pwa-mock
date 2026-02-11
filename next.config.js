/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove console.log in production (keep error and warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Disable TypeScript checking (we're using JavaScript)
  typescript: {
    // Ignore TypeScript errors during build (since we're using JS)
    ignoreBuildErrors: true,
  },
  // Turbopack is available in development via --turbo flag
  // Production builds always use Webpack (default)
  // This ensures Turbopack chunks are only generated in dev mode
  
  // Workaround for Turbopack HMR issues
  // This helps prevent module factory errors during hot reloading
  experimental: {
    // Disable some experimental features that can cause HMR issues
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
