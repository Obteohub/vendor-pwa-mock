# Authentication Quick Reference

## 🚀 Most Common Operations

### 1. Get Current User (Instant - Cached!)
```javascript
import useAuthStore from '@/store/authStore';

function MyComponent() {
  const { user } = useAuthStore();
  
  return <div>Hello {user?.display_name}</div>;
}
```

### 2. Check if User is Logged In
```javascript
import useAuthStore from '@/store/authStore';

function MyComponent() {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome!</div>;
}
```

### 3. Login
```javascript
import useAuthStore from '@/store/authStore';

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ username, password });
    
    if (result.success) {
      window.location.href = '/dashboard';
    }
  };
}
```

### 4. Logout
```javascript
import useAuthStore from '@/store/authStore';

function LogoutButton() {
  const { logout } = useAuthStore();
  
  return <button onClick={logout}>Logout</button>;
}
```

### 5. Make API Request (with Auto Token)
```javascript
import axiosClient from '@/lib/axiosClient';

// GET request
const products = await axiosClient.get('/products');

// POST request
const newProduct = await axiosClient.post('/products', { name: 'Product' });

// PUT request
const updated = await axiosClient.put('/products/123', { name: 'Updated' });

// DELETE request
await axiosClient.delete('/products/123');
```

### 6. Protect a Route
```javascript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>This content requires login</div>
    </ProtectedRoute>
  );
}
```

### 7. Refresh User Data
```javascript
import useAuthStore from '@/store/authStore';

function RefreshButton() {
  const { refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const handleRefresh = async () => {
    setLoading(true);
    await refreshUser();
    setLoading(false);
  };
  
  return <button onClick={handleRefresh}>Refresh Profile</button>;
}
```

## 📋 Available Auth Store Properties

```javascript
const {
  // State
  user,              // User object { id, display_name, email, role }
  token,             // JWT token string
  isAuthenticated,   // Boolean
  isLoading,         // Boolean (during login/logout)
  error,             // Error message string or null
  
  // Actions
  login,             // (credentials) => Promise<{success, user?, error?}>
  logout,            // () => void
  checkAuth,         // () => Promise<boolean>
  refreshUser,       // () => Promise<user>
  initFromStorage,   // () => void
  setUser,           // (user) => void
  setToken,          // (token) => void
} = useAuthStore();
```

## 🔐 User Object Structure

```javascript
{
  id: 123,                           // User ID (number)
  display_name: "John Doe",          // Full name
  user_nicename: "johndoe",          // Username
  email: "john@example.com",         // Email address
  role: "seller"                     // User role
}
```

## 🌐 Axios Client Usage

### Basic Requests
```javascript
import axiosClient from '@/lib/axiosClient';

// All requests automatically include JWT token!

// GET
const response = await axiosClient.get('/endpoint');

// POST
const response = await axiosClient.post('/endpoint', { data });

// PUT
const response = await axiosClient.put('/endpoint/123', { data });

// DELETE
const response = await axiosClient.delete('/endpoint/123');
```

### With Query Parameters
```javascript
import axiosClient from '@/lib/axiosClient';

const response = await axiosClient.get('/products', {
  params: {
    page: 1,
    limit: 10,
    search: 'query'
  }
});
// Calls: /products?page=1&limit=10&search=query
```

### Error Handling
```javascript
import axiosClient from '@/lib/axiosClient';

try {
  const response = await axiosClient.get('/endpoint');
  console.log(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // User logged out automatically
  } else if (error.response?.status === 403) {
    // No permission
  } else if (error.isNetworkError) {
    // Network error
  } else {
    // Other error
  }
}
```

## 🎯 Common Patterns

### Pattern 1: Show loading state during login
```javascript
function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" />
      <input type="password" name="password" />
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Pattern 2: Display user info
```javascript
function UserGreeting() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return null;
  
  return (
    <div>
      <h1>Welcome, {user.display_name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Pattern 3: Conditional rendering based on auth
```javascript
function Navigation() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <nav>
      {isAuthenticated ? (
        <DashboardMenu />
      ) : (
        <PublicMenu />
      )}
    </nav>
  );
}
```

### Pattern 4: Fetch data on component mount
```javascript
function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchProducts();
  }, []);
  
  return <div>{/* Render products */}</div>;
}
```

## ⚠️ Common Mistakes to Avoid

### ❌ Don't use fetch() for authenticated requests
```javascript
// BAD - Token not included!
const response = await fetch('/api/products');
```

### ✅ Use axiosClient instead
```javascript
// GOOD - Token automatically included!
const response = await axiosClient.get('/products');
```

---

### ❌ Don't fetch user data on every render
```javascript
// BAD - Makes API call every time!
function Component() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/auth/check').then(/* ... */);
  }, []); // Runs on every mount
}
```

### ✅ Use cached user from store
```javascript
// GOOD - Instant, no API call!
function Component() {
  const { user } = useAuthStore();
  // User is already loaded from cache
}
```

---

### ❌ Don't manually manage tokens
```javascript
// BAD - Manual token management
const token = localStorage.getItem('sw_token');
fetch('/api/products', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### ✅ Let axios interceptors handle it
```javascript
// GOOD - Token added automatically!
axiosClient.get('/products');
```

## 🔄 Migration Checklist

If migrating from old code:

- [ ] Replace `fetch()` calls with `axiosClient`
- [ ] Replace `getUserInfo()` with `useAuthStore().user`
- [ ] Replace manual token handling with axios interceptors
- [ ] Replace `isAuthenticated()` with `useAuthStore().isAuthenticated`
- [ ] Replace `logout()` with `useAuthStore().logout()`
- [ ] Remove manual localStorage token reads
- [ ] Update protected routes to use `<ProtectedRoute>` or `useAuth()`

## 📚 Need More Info?

See the full guide: `src/lib/AUTHENTICATION_GUIDE.md`
