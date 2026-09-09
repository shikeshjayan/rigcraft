import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const isLoggingOutRef = useRef(false);

  // Confirm the session on the server (HttpOnly cookie) instead of trusting
  // anything stored client-side.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await authService.getProfile({ _skipAuthRedirect: true });
        if (!active) return;
        setIsLoggedIn(true);
        setUser(data.data);
      } catch {
        if (!active) return;
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onAuthLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
    };
    window.addEventListener('rigcraft:auth-logout', onAuthLogout);
    return () => window.removeEventListener('rigcraft:auth-logout', onAuthLogout);
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = async () => {
    // Flag that we are logging out so CartContext / WishlistContext stop writing
    // guest data to localStorage (a stale write after removal resurrects items).
    isLoggingOutRef.current = true;
    // Best-effort server-side session revocation. Suppresses the interceptor's
    // redirect so the full-page navigation below handles it. Wait for the token
    // cookie to be revoked BEFORE navigating away — a full-page reload right
    // after a fire-and-forget request aborts it and hydration logs the user
    // straight back in.
    await Promise.race([
      authService.logout({ _skipAuthRedirect: true }).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    setIsLoggedIn(false);
    setUser(null);
    ['rigcraft_token', 'accessToken', 'rigcraft_auth', 'rigcraft_user', 'admin-auth-storage'].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // storage unavailable
      }
    });
    localStorage.removeItem('rigcraft_cart_guest');
    localStorage.removeItem('rigcraft_wishlist_guest');
    window.dispatchEvent(new Event('rigcraft:auth-logout'));
    // Surface a "Logged out" toast after the full page reload below.
    sessionStorage.setItem(
      'rigcraft_pending_toast',
      JSON.stringify({ message: 'Logged out successfully.', type: 'success' })
    );
    // Force reload to a fresh start
    window.location.href = '/';
  };

  // Handle session invalidation when password is changed
  const handlePasswordChange = () => {
    // Clear auth state and redirect to login when password changes
    logout();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isHydrating, login, logout, handlePasswordChange, isLoggingOutRef }}>
      {children}
    </AuthContext.Provider>
  );
};