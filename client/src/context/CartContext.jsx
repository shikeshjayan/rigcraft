import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getCart, addToCartApi, removeFromCartApi, clearCartApi } from '../api/cart';
import { useToast } from '../components/toast/useToast';
import { friendlyStockMessage } from '../utils/stockMessages';

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

  const { toast } = useToast();

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
        toast(`Added ${item.title || item.name || 'item'} to cart!`);
      } catch (err) {
        console.error("Failed to add to cart:", err);
        const raw = err.response?.data?.message;
        toast(friendlyStockMessage(raw) || raw || 'Failed to add item to cart.', 'error');
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
      toast(`Added ${item.title || item.name || 'item'} to cart!`);
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await removeMutation.mutateAsync(id);
        toast('Removed from cart.');
      } catch (err) {
        console.error("Failed to remove from cart:", err);
        toast(err.response?.data?.message || 'Failed to remove item from cart.', 'error');
      }
    } else {
      setGuestCart(prev => prev.filter(item => item.id !== id && item.cartItemId !== id && item._id !== id));
      toast('Removed from cart.');
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await clearMutation.mutateAsync();
        toast('Cart cleared.');
      } catch (err) {
        console.error("Failed to clear cart:", err);
        toast(err.response?.data?.message || 'Failed to clear cart.', 'error');
      }
    } else {
      setGuestCart([]);
      toast('Cart cleared.');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, isLoading, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
