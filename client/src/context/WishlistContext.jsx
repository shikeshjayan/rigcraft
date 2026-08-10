import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { getWishlist, addToWishlistApi, removeFromWishlistApi, moveToCartApi, clearWishlistApi } from '../api/wishlist';
import { useToast } from '../components/toast/useToast';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const storageKey = 'rigcraft_wishlist_guest';

  const { data: serverItems, isLoading } = useQuery({
    queryKey: ['wishlist', user?._id],
    queryFn: async () => {
      const data = await getWishlist();
      if (!(data.success && data.data?.items)) return [];
      return data.data.items.filter(itemObj => itemObj.item).map(itemObj => {
        const product = itemObj.item;
        return {
          ...product,
          id: product._id,
          itemType: itemObj.itemType,
          addedAt: itemObj.addedAt
        };
      });
    },
    enabled: !!user,
    retry: false,
  });

  const [guestWishlist, setGuestWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  const wishlist = user ? (serverItems ?? []) : guestWishlist;

  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      localStorage.setItem(storageKey, JSON.stringify(guestWishlist));
    }
  }, [guestWishlist, user]);

  const invalidateWishlist = () => queryClient.invalidateQueries({ queryKey: ['wishlist', user?._id] });

  const addMutation = useMutation({
    mutationFn: ({ itemType, itemId }) => addToWishlistApi(itemType, itemId),
    onSuccess: invalidateWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlistApi,
    onSuccess: invalidateWishlist,
  });

  const moveMutation = useMutation({
    mutationFn: moveToCartApi,
    onSuccess: invalidateWishlist,
  });

  const clearMutation = useMutation({
    mutationFn: clearWishlistApi,
    onSuccess: invalidateWishlist,
  });

  const addToWishlist = async (item) => {
    const normalizedId = item.id || item._id;
    const itemType = (item.itemType === 'prebuilt' || (item.pricing && typeof item.pricing === 'object')) ? 'prebuilt' : 'product';

    if (user) {
      try {
        await addMutation.mutateAsync({ itemType, itemId: normalizedId });
        toast(`Added ${item.title || item.name} to wishlist!`);
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
        toast(err.response?.data?.message || 'Item already in wishlist!', 'error');
      }
    } else {
      if (!guestWishlist.find(i => i.id === normalizedId)) {
        setGuestWishlist(prev => [...prev, { ...item, id: normalizedId, addedAt: new Date().toISOString() }]);
        toast(`Added ${item.title || item.name} to wishlist!`);
      } else {
        toast(`${item.title || item.name} is already in wishlist!`, 'info');
      }
    }
  };

  const removeFromWishlist = async (id) => {
    const item = wishlist.find(w => w.id === id || w._id === id);
    const name = item?.title || item?.name || 'item';

    if (user) {
      try {
        await removeMutation.mutateAsync(id);
        toast(`Removed ${name} from wishlist!`);
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
        toast(err.response?.data?.message || 'Failed to remove item from wishlist.', 'error');
      }
    } else {
      setGuestWishlist(prev => prev.filter(item => item.id !== id && item._id !== id));
      toast(`Removed ${name} from wishlist!`);
    }
  };

  const moveToCart = async (id) => {
    const item = wishlist.find(w => w.id === id || w._id === id);
    const name = item?.title || item?.name || 'item';

    if (user) {
      try {
        await moveMutation.mutateAsync(id);
        toast(`Moved ${name} to cart!`);
      } catch (err) {
        console.error("Failed to move to cart:", err);
        toast(err.response?.data?.message || 'Failed to move item to cart.', 'error');
      }
    } else {
      try {
        if (item) await addToCart(item);
        setGuestWishlist(prev => prev.filter(i => i.id !== id && i._id !== id));
        toast(`Moved ${name} to cart!`);
      } catch (err) {
        console.error("Failed to move to cart:", err);
        toast(err.response?.data?.message || 'Failed to move item to cart.', 'error');
      }
    }
  };

  const moveAllToCart = async () => {
    if (wishlist.length === 0) return;
    if (user) {
      try {
        for (const item of wishlist) {
          await moveMutation.mutateAsync(item.id || item._id);
        }
        toast(`Moved ${wishlist.length} items to cart!`);
      } catch (err) {
        console.error("Failed to move items to cart:", err);
        toast(err.response?.data?.message || 'Failed to move items to cart.', 'error');
      }
    } else {
      try {
        for (const item of wishlist) {
          await addToCart(item);
        }
        setGuestWishlist([]);
        toast(`Moved ${wishlist.length} items to cart!`);
      } catch (err) {
        console.error("Failed to move items to cart:", err);
        toast(err.response?.data?.message || 'Failed to move items to cart.', 'error');
      }
    }
  };

  const clearWishlist = async () => {
    if (wishlist.length === 0) return;
    if (user) {
      try {
        await clearMutation.mutateAsync();
        toast('Wishlist cleared!');
      } catch (err) {
        console.error("Failed to clear wishlist:", err);
        toast(err.response?.data?.message || 'Failed to clear wishlist.', 'error');
      }
    } else {
      setGuestWishlist([]);
      toast('Wishlist cleared!');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isLoading, addToWishlist, removeFromWishlist, moveToCart, moveAllToCart, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
