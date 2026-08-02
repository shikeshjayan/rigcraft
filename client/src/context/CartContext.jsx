import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/cart';
import { motion, AnimatePresence } from 'framer-motion';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const storageKey = 'rigcraft_cart_guest';

  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const isInitialized = useRef(false);

  const [guestCart, setGuestCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    isInitialized.current = false;
    fetchCart().finally(() => {
      isInitialized.current = true;
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(storageKey, JSON.stringify(guestCart));
    }
  }, [guestCart, user]);

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['cart', user?._id] });

  const addMutation = useMutation({
    mutationFn: ({ itemType, itemId, quantity }) => addToCartApi(itemType, itemId, quantity),
    onSuccess: invalidateCart,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCartApi,
    onSuccess: invalidateCart,
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: invalidateCart,
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = async (item) => {
    const normalizedId = item.id || item._id;
    let itemType = 'product';
    if (item.type === 'custom-build' || item.type === 'savedBuild') {
      itemType = 'savedBuild';
    } else if (item.type === 'prebuilt' || item.pricing || item.category === 'gaming' || item.category === 'streaming' || item.category === 'workstation' || item.category === 'office' || item.category === 'budget') {
      itemType = 'prebuilt';
    }

    if (user) {
      try {
        await addToCartApi(itemType, normalizedId, 1);
        await fetchCart();
        return { success: true };
      } catch (err) {
        console.error("Failed to add to cart:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to add to cart";
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } else {
      setGuestCart(prev => {
        const existingItemIndex = prev.findIndex(i => i.id === normalizedId);
        if (existingItemIndex > -1) {
          const updated = [...prev];
          updated[existingItemIndex].qty = (updated[existingItemIndex].qty || 1) + 1;
          return updated;
        }
        return [...prev, { ...item, id: normalizedId, qty: 1, cartItemId: Date.now().toString() + Math.random().toString(), itemType }];
      });
      showToastNotification(`Added ${item.title || item.name || 'item'} to cart!`);
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await removeMutation.mutateAsync(id);
        showToastNotification('Removed from cart.');
      } catch (err) {
        console.error("Failed to remove from cart:", err);
        showToastNotification(err.response?.data?.message || 'Failed to remove item from cart.');
      }
    } else {
      setGuestCart(prev => prev.filter(item => item.id !== id && item.cartItemId !== id && item._id !== id));
      showToastNotification('Removed from cart.');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await clearMutation.mutateAsync();
        showToastNotification('Cart cleared.');
      } catch (err) {
        console.error("Failed to clear cart:", err);
        showToastNotification(err.response?.data?.message || 'Failed to clear cart.');
      }
    } else {
      setGuestCart([]);
      showToastNotification('Cart cleared.');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, isLoading, addToCart, removeFromCart, clearCart }}>
      {children}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-600 border border-red-700 text-white px-6 py-4 rounded-sm shadow-2xl z-[9999] font-bold flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};
