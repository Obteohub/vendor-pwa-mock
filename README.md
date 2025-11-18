# Vendor Dashboard PWA

A high-performance Progressive Web App for WooCommerce vendors built with Next.js 16 and React 19.

## ✨ Features

- 🚀 **Lightning Fast** - Loads data in < 1 second (100-180x faster than traditional API calls)
- 📦 **Local Data Storage** - JSON files bundled with app for instant access
- 🤖 **Auto-Updates** - Weekly automatic data refresh via GitHub Actions
- 💾 **Offline Support** - Service worker caching for offline functionality
- 📱 **PWA Ready** - Installable on mobile and desktop
- 🎨 **Modern UI** - Built with Tailwind CSS 4
- 🔐 **Secure** - JWT authentication with WooCommerce

## 🎯 Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Data Sync | 120-180s | < 1s | **100-180x faster** |
| API Requests | 44 | 0 | **100% fewer** |
| Bundle Size | ~5 MB | 138 KB | **97% smaller** |

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Storage:** IndexedDB
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## 📦 Data Management

### Local JSON Files

Data is stored locally in `public/data/`:
- `categories.json` - 711 product categories (76 KB)
- `brands.json` - 396 brands (35 KB)
- `attributes.json` - 132 product attributes (20 KB)
- `locations.json` - 71 locations (7 KB)

### Automatic Updates

GitHub Actions automatically updates data files every Sunday at 2 AM UTC:
- Downloads fresh data from WordPress
- Commits changes if data has changed
- Triggers Vercel deployment
- Zero manual intervention needed

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- WooCommerce store with JWT authentication

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/vendor-pwa-mock.git
cd vendor-pwa-mock

# Install dependencies
npm install

# Set up environment variables
cp .env.production.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WC_API_BASE_URL=https://your-site.com/wp-json/dokan/v1
NEXT_PUBLIC_JWT_AUTH_URL=https://your-site.com/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_WORDPRESS_URL=https://your-site.com
WP_BASE_URL=https://your-site.com
WC_CONSUMER_KEY=your_consumer_key
WC_CONSUMER_SECRET=your_consumer_secret
```

### Update Data Files

```bash
# Manual update
npm run update-data

# Automatic updates run weekly via GitHub Actions
```

## 📱 Features

### Product Management
- ✅ Add/Edit/Delete products
- ✅ Category selection with tree view
- ✅ Brand selection with hierarchy
- ✅ Dynamic attributes based on category
- ✅ Image upload
- ✅ Inventory management

### Order Management
- ✅ View all orders
- ✅ Order details
- ✅ Update order status
- ✅ Real-time notifications

### Dashboard
- ✅ Sales statistics
- ✅ Recent orders
- ✅ Quick actions
- ✅ Data sync status

### Offline Support
- ✅ Service worker caching
- ✅ Offline page
- ✅ Background sync
- ✅ IndexedDB storage

## 🏗️ Architecture

### Data Flow

```
Local JSON Files (public/data/)
    ↓
Load on first visit (< 1 second)
    ↓
Store in IndexedDB
    ↓
Instant access on subsequent visits
    ↓
Auto-refresh weekly via GitHub Actions
```

### Key Components

- **dataSyncService** - Handles data loading and synchronization
- **localDataStore** - IndexedDB wrapper for local storage
- **useLocalData** - React hook for accessing local data
- **CategoryTreeSelector** - Hierarchical category selection
- **BrandTreeSelector** - Hierarchical brand selection
- **AttributeSelector** - Dynamic attribute selection

## 📊 Project Structure

```
vendor-pwa-mock/
├── .github/
│   └── workflows/
│       └── update-json-data.yml    # Auto-update workflow
├── public/
│   ├── data/                       # JSON data files
│   │   ├── categories.json
│   │   ├── brands.json
│   │   ├── attributes.json
│   │   └── locations.json
│   ├── sw.js                       # Service worker
│   └── offline.html                # Offline page
├── src/
│   ├── app/                        # Next.js app router
│   │   ├── api/                    # API routes
│   │   └── dashboard/              # Dashboard pages
│   ├── components/                 # React components
│   ├── hooks/                      # Custom hooks
│   ├── lib/                        # Utilities
│   │   ├── apiClient.js
│   │   ├── auth.js
│   │   ├── dataSyncService.js
│   │   └── localDataStore.js
│   └── config/                     # Configuration
│       ├── categoryAttributeMap.js
│       └── attributeMappings/
├── download-json-files.js          # Data download script
└── package.json
```

## 🔄 Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Update data files
npm run update-data

# Build for production
npm run build

# Start production server
npm start
```

### Deployment

Push to main branch:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel automatically deploys on push to main.

## 🤖 Automation

### GitHub Actions

**Weekly Data Update** (`.github/workflows/update-json-data.yml`)
- Runs every Sunday at 2 AM UTC
- Downloads fresh data from WordPress
- Commits changes automatically
- Triggers Vercel deployment

**Manual Trigger:**
1. Go to Actions tab on GitHub
2. Select "Update JSON Data Files"
3. Click "Run workflow"

## 📚 Documentation

- `AUTO_UPDATE_GUIDE.md` - Automation setup and configuration
- `LOCAL_JSON_FILES_COMPLETE.md` - Local data implementation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DEV_WORKFLOW.md` - Development best practices

## 🔐 Security

- JWT authentication with WooCommerce
- Secure cookie-based sessions
- Environment variables for sensitive data
- HTTPS only in production
- CORS protection

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance Optimizations

- Local JSON data (no external API calls)
- IndexedDB caching
- Service worker caching
- Pre-computed category trees
- Pre-filtered attribute mappings
- Lazy loading
- Image optimization

## 🐛 Troubleshooting

### Data not loading?

```javascript
// Clear IndexedDB
indexedDB.deleteDatabase('VendorAppDB');
// Refresh page
```

### Update data manually

```bash
npm run update-data
```

### Check GitHub Actions logs

Go to: GitHub → Actions → View workflow runs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- WooCommerce for the e-commerce platform
- Tailwind CSS for the styling system

## 📞 Support

For issues and questions:
- Check documentation in `/docs`
- Review GitHub Issues
- Contact development team

---

**Built with ❤️ using Next.js 16 and React 19**
