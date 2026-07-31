import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/cart';
import { motion, AnimatePresence } from 'framer-motion';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const storageKey = 'rigcraft_cart_guest';

  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const isInitialized = useRef(false);

  // Fetch Cart from Backend OR Local Storage
  const fetchCart = async () => {
    if (user) {
      try {
        const data = await getCart();
        if (data.success && data.data?.items) {
          // Format backend populated items to the cartItems array expected by frontend
          const formattedItems = data.data.items.filter(itemObj => itemObj.item).map(itemObj => {
            const product = itemObj.item;
            return {
              ...product,
              id: product._id,
              cartItemId: itemObj._id || product._id,
              qty: itemObj.quantity || 1,
              itemType: itemObj.itemType
            };
          });
          setCartItems(formattedItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Error fetching cart from backend:", err);
      }
    } else {
      try {
        const stored = localStorage.getItem(storageKey);
        setCartItems(stored ? JSON.parse(stored) : []);
      } catch {
        setCartItems([]);
      }
    }
  };

  useEffect(() => {
    isInitialized.current = false;
    fetchCart().finally(() => {
      isInitialized.current = true;
    });
  }, [user]);

  // Sync Guest Cart to Local Storage
  useEffect(() => {
    if (!user && isInitialized.current) {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

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
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(i => i.id === normalizedId);
        if (existingItemIndex > -1) {
          const updated = [...prev];
          updated[existingItemIndex].qty = (updated[existingItemIndex].qty || 1) + 1;
          return updated;
        }
        return [...prev, { ...item, id: normalizedId, qty: 1, cartItemId: Date.now().toString() + Math.random().toString(), itemType }];
      });
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await removeFromCartApi(id);
        await fetchCart();
      } catch (err) {
        console.error("Failed to remove from cart:", err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id && item.cartItemId !== id && item._id !== id));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await clearCartApi();
        await fetchCart();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    } else {
      setCartItems([]);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
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
