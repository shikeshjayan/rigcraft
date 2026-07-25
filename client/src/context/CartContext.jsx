import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const storageKey = user && user.email ? `rigcraft_cart_${user.email}` : 'rigcraft_cart_guest';

  const [cartItems, setCartItems] = useState([]);

  const loadedKey = useRef(storageKey);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
    loadedKey.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (loadedKey.current === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, storageKey]);

  const addToCart = (item) => {
    if (!isLoggedIn) {
      return;
    }
    
    setCartItems(prev => {
      // Check if item already exists
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      if (existingItemIndex > -1) {
        const updated = [...prev];
        updated[existingItemIndex].qty = (updated[existingItemIndex].qty || 1) + 1;
        return updated;
      }
      return [...prev, { ...item, qty: 1, cartItemId: Date.now().toString() }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id && item.cartItemId !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
