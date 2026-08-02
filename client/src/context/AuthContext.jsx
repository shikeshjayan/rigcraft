import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('rigcraft_auth');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('rigcraft_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('rigcraft_auth', isLoggedIn.toString());
    if (user) {
      localStorage.setItem('rigcraft_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rigcraft_user');
    }
  }, [isLoggedIn, user]);

  const login = (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      setUser(userData);
    }
  };
  
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('admin-auth-storage');
    localStorage.removeItem('rigcraft_cart_guest');
    localStorage.removeItem('rigcraft_wishlist_guest');
    // Force reload to a fresh start
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
