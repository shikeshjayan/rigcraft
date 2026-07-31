import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const storageKey = 'rigcraft_cart_guest';

  const [cartItems, setCartItems] = useState([]);
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

  const addToCart = async (item) => {
    const normalizedId = item.id || item._id;
    const itemType = (item.pricing || item.category === 'gaming' || item.category === 'streaming' || item.category === 'workstation' || item.category === 'office' || item.category === 'budget') ? 'prebuilt' : 'product';

    if (user) {
      try {
        await addToCartApi(itemType, normalizedId, 1);
        await fetchCart();
      } catch (err) {
        console.error("Failed to add to cart:", err);
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
    </CartContext.Provider>
  );
};
