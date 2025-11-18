// src/lib/auth.js
// Client-side authentication utilities

export async function checkAuth() {
  if (typeof window === 'undefined') return { authenticated: false, user: null };
  
  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    
    console.log('[AUTH] Check result:', data);
    return data;
  } catch (err) {
    console.error('[AUTH] Check failed:', err);
    return { authenticated: false, user: null };
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  // Check if user cookie exists (readable cookie)
  const cookies = document.cookie.split(';');
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('sw_user='));
  
  if (!userCookie) {
    console.log('[AUTH] No sw_user cookie found');
    return false;
  }
  
  try {
    const userJson = decodeURIComponent(userCookie.split('=')[1]);
    const user = JSON.parse(userJson);
    
    if (!user || !user.id) {
      console.log('[AUTH] Invalid user data');
      return false;
    }
    
    console.log('[AUTH] Valid user found:', user.display_name);
    return true;
  } catch (err) {
    console.error('[AUTH] Error parsing user cookie:', err);
    return false;
  }
}

export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    // Clear auth cookie
    document.cookie = 'sw_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sw_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear cache
    localStorage.clear();
    
    // Redirect to login
    window.location.href = '/login';
  }
}

export function getUserInfo() {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(cookie => cookie.trim().startsWith('sw_user='));
    
    if (userCookie) {
      const userJson = decodeURIComponent(userCookie.split('=')[1]);
      return JSON.parse(userJson);
    }
  } catch (err) {
    console.error('Error parsing user info:', err);
  }
  
  return null;
}
