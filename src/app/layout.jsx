// app/layout.jsx

// 1. IMPORT YOUR GLOBAL CSS FILE HERE. This is essential for Tailwind CSS.
import './globals.css'; 

export const metadata = {
  title: 'Shopwice Vendor - Manage Your Store',
  description: 'Vendor dashboard for managing products, orders, and sales on Shopwice',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shopwice Vendor',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A5BD8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        {/* The {children} prop renders the specific page content (like app/page.jsx or app/dashboard/layout.jsx) */}
        {/* suppressHydrationWarning: Browser extensions (like Grammarly) may add attributes to body */}
        {children} 
      </body>
    </html>
  );
}