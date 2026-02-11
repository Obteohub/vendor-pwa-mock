# Authentication System - Implementation Guide

## Overview

This project uses an optimized authentication system with:
- **Zustand** for state management
- **Axios** with interceptors for secure API requests
- **JWT tokens** stored in localStorage
- **User profile caching** for fast page loads
- **Automatic token refresh** and session management

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Login Page                           │
│  - Collects credentials                                 │
│  - Calls authStore.login()                              │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Store (Zustand)                       │
│  - Manages auth state                                   │
│  - Persists to localStorage                             │
│  - Calls axios client                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│           Axios Client (axiosClient.js)                 │
│  - Request interceptor: Adds JWT token                  │
│  - Response interceptor: Handles 401 errors             │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│              API Routes (/api/auth/*)                   │
│  - /auth/login - Authenticate user                      │
│  - /auth/check - Verify token                           │
│  - /auth/logout - Clear session                         │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Using Auth in Components

```javascript
import useAuthStore from '@/store/authStore';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Access user data (cached, no API call)
  console.log(user.display_name);
  
  // Check if authenticated
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Hello, {user.display_name}!</div>;
}
```

### 2. Login Flow

```javascript
import useAuthStore from '@/store/authStore';

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  
  const handleSubmit = async (credentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      // User is logged in, token and user data are saved
      window.location.href = '/dashboard';
    } else {
      // Show error
      console.error(result.error);
    }
  };
}
```

### 3. Protected Routes

**Option A: Using the ProtectedRoute component**
```javascript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

**Option B: Using the useAuth hook**
```javascript
import useAuth from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth(); // Redirects if not authenticated
  
  return <div>Welcome {user?.display_name}</div>;
}
```

### 4. Making Authenticated API Requests

```javascript
import axiosClient from '@/lib/axiosClient';

// GET request - Token automatically added
const fetchProducts = async () => {
  try {
    const response = await axiosClient.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request - Token automatically added
const createProduct = async (productData) => {
  try {
    const response = await axiosClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 5. Logout

```javascript
import useAuthStore from '@/store/authStore';

function LogoutButton() {
  const { logout } = useAuthStore();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## Features

### 1. User Profile Caching
User profile is stored in localStorage and Zustand state, so it doesn't need to be fetched on every page load.

```javascript
// First load: Fetches from API
const { user } = useAuthStore();

// Subsequent loads: Loads from cache (instant!)
const { user } = useAuthStore();

// Manually refresh user profile
const { refreshUser } = useAuthStore();
await refreshUser();
```

### 2. Automatic Token Management

Axios interceptors automatically:
- Add JWT token to all requests
- Handle 401 errors (token expired)
- Clear auth data and redirect to login

### 3. Persistent Sessions

User sessions persist across page refreshes using localStorage and Zustand persistence.

### 4. Token Verification

Token validity is checked:
- On app initialization
- On protected route access
- Manually via `checkAuth()`

## API Endpoints

### POST /api/auth/login
Authenticate user with username/password

**Request:**
```json
{
  "username": "vendor@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "display_name": "John Doe",
    "email": "vendor@example.com",
    "role": "seller"
  }
}
```

### GET /api/auth/check
Verify authentication status

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 123,
    "display_name": "John Doe",
    "email": "vendor@example.com"
  }
}
```

### POST /api/auth/logout
Logout user

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Store Methods

### useAuthStore()

**State:**
- `user` - Current user object (null if not authenticated)
- `token` - JWT token (null if not authenticated)
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Boolean loading state
- `error` - Error message (null if no error)

**Actions:**
- `login(credentials)` - Login with username/password
- `logout()` - Logout and clear auth data
- `checkAuth()` - Verify token is still valid
- `refreshUser()` - Fetch fresh user data from API
- `initFromStorage()` - Initialize state from localStorage
- `setUser(user)` - Manually update user
- `setToken(token)` - Manually update token

## Storage Keys

The system uses these localStorage keys:
- `sw_token` - JWT authentication token
- `sw_user` - User profile data (JSON)
- `auth-storage` - Zustand persisted state
- `sw_remember_me` - Remember me checkbox state
- `sw_username` - Saved username for auto-fill

## Security Best Practices

1. **Token Storage**: Tokens are stored in localStorage (accessible by JavaScript)
   - Consider using httpOnly cookies for production
   
2. **Token Expiration**: Tokens expire after 7 days
   - User is automatically logged out on 401 errors
   
3. **HTTPS**: Always use HTTPS in production
   - Tokens can be intercepted over HTTP
   
4. **CORS**: API endpoints should validate origin
   - Prevent cross-site request forgery

## Migration from Old System

If you have code using the old auth system:

**Before:**
```javascript
import { getUserInfo, isAuthenticated, logout } from '@/lib/auth';

const user = getUserInfo();
const authenticated = isAuthenticated();
logout();
```

**After:**
```javascript
import useAuthStore from '@/store/authStore';

const { user, isAuthenticated, logout } = useAuthStore();
```

## Troubleshooting

### User gets logged out unexpectedly
- Token may have expired (check token expiration)
- API might be returning 401 errors
- Check browser console for error messages

### User profile not updating
- Call `refreshUser()` to fetch latest data
- Check if API endpoint is returning updated data

### Login not working
- Check network tab for API errors
- Verify JWT endpoint URL is correct
- Check credentials are valid

### Token not being sent with requests
- Ensure you're using `axiosClient` instead of `fetch`
- Check axios interceptor is configured correctly
