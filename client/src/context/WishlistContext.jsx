import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlistApi, removeFromWishlistApi } from '../api/wishlist';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  
  const storageKey = 'rigcraft_wishlist_guest';

  const [wishlist, setWishlist] = useState([]);
  const isInitialized = useRef(false);

  const fetchWishlist = async () => {
    if (user) {
      try {
        const data = await getWishlist();
        if (data.success && data.data?.items) {
          const formattedItems = data.data.items.filter(itemObj => itemObj.item).map(itemObj => {
            const product = itemObj.item;
            return {
              ...product,
              id: product._id,
              itemType: itemObj.itemType
            };
          });
          setWishlist(formattedItems);
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error("Error fetching wishlist from backend:", err);
      }
    } else {
      try {
        const stored = localStorage.getItem(storageKey);
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlist([]);
      }
    }
  };

  useEffect(() => {
    fetchWishlist().finally(() => {
      isInitialized.current = true;
    });
  }, [user]);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Sync Guest Wishlist to Local Storage
  useEffect(() => {
    if (!user && isInitialized.current) {
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000); // 2 seconds
  };

  const addToWishlist = async (item) => {
    const normalizedId = item.id || item._id;
    
    if (user) {
      try {
        const itemType = (item.pricing || item.category === 'gaming' || item.category === 'streaming' || item.category === 'workstation' || item.category === 'office' || item.category === 'budget') ? 'prebuilt' : 'product';
        await addToWishlistApi(itemType, normalizedId);
        await fetchWishlist();
        showToastNotification(`Added ${item.title || item.name} to wishlist!`);
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
        showToastNotification(err.response?.data?.message || 'Item already in wishlist!');
      }
    } else {
      if (!wishlist.find(i => i.id === normalizedId)) {
        setWishlist(prev => [...prev, { ...item, id: normalizedId }]);
        showToastNotification(`Added ${item.title || item.name} to wishlist!`);
      } else {
        showToastNotification(`${item.title || item.name} is already in wishlist!`);
      }
    }
  };

  const removeFromWishlist = async (id) => {
    if (user) {
      try {
        await removeFromWishlistApi(id);
        await fetchWishlist();
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
      }
    } else {
      setWishlist(prev => prev.filter(item => item.id !== id && item._id !== id));
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
      {/* Toast Notification Popup */}
      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white font-bold shadow-lg flex items-center gap-2 transition-all duration-300 pointer-events-none ${showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
        style={{ backgroundColor: 'var(--color-primary, #06B6D4)' }}
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {toastMessage}
      </div>
    </WishlistContext.Provider>
  );
};
