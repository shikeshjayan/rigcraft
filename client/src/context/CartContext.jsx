import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('rigcraft_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rigcraft_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
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
