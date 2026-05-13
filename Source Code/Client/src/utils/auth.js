// Auth helpers for JWT management
// The JWT token is stored in localStorage for persistence across page reloads.
// All user data is fetched fresh from the backend via API calls.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem('billdex_token')

export const getUser = async () => {
  // Fetch fresh user data from backend
  // This replaces the old localStorage-based approach
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export const saveAuth = (token, user) => {
  // Store token for subsequent requests
  localStorage.setItem('billdex_token', token)
  // Note: user data is no longer stored in localStorage
  // It will be fetched fresh from /api/auth/me when needed
}

export const clearAuth = () => {
  localStorage.removeItem('billdex_token')
}

export const isLoggedIn = () => !!getToken()
