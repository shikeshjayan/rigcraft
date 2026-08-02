import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const storageKey = 'rigcraft_cart_guest';

  const { data: serverItems, isLoading } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: async () => {
      const data = await getCart();
      if (!(data.success && data.data?.items)) return [];
      return data.data.items.filter(itemObj => itemObj.item).map(itemObj => {
        const product = itemObj.item;
        return {
          ...product,
          id: product._id,
          cartItemId: itemObj._id || product._id,
          qty: itemObj.quantity || 1,
          itemType: itemObj.itemType
        };
      });
    },
    enabled: !!user,
    retry: false,
  });

  const [guestCart, setGuestCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  const cartItems = user ? (serverItems ?? []) : guestCart;

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

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

  const addToCart = async (item) => {
    const normalizedId = item.id || item._id;
    let itemType = 'product';
    if (item.type === 'custom-build') itemType = 'savedBuild';
    else if (item.type === 'PC' || item.type === 'prebuilt') itemType = 'prebuilt';
    else if ((item.pricing && typeof item.pricing === 'object') || ['gaming', 'streaming', 'workstation', 'office', 'budget', 'prebuilt'].includes(item.category)) itemType = 'prebuilt';
    if (item.itemType) itemType = item.itemType;

    if (user) {
      try {
        await addMutation.mutateAsync({ itemType, itemId: normalizedId, quantity: 1 });
        showToastNotification(`Added ${item.title || item.name || 'item'} to cart!`);
      } catch (err) {
        console.error("Failed to add to cart:", err);
        showToastNotification(err.response?.data?.message || 'Failed to add item to cart.');
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
      {/* Toast Notification Popup */}
      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white font-bold shadow-lg flex items-center gap-2 transition-all duration-300 pointer-events-none ${showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
        style={{ backgroundColor: 'var(--color-primary, #06B6D4)' }}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {toastMessage}
      </div>
    </CartContext.Provider>
  );
};
