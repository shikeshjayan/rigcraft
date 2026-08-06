import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useToast } from '../components/toast/useToast';
import { friendlyStockMessage } from '../utils/stockMessages';

const getTypeName = (type) => typeof type === 'string' ? type : type?.name || 'UNKNOWN';

const CartWorkspace = ({ checkoutStep = 'bag', setCheckoutStep }) => {
  const { cartItems, isLoading, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();

  // Track selected items by cartItemId (or id for legacy items)
  const [selectedItemIds, setSelectedItemIds] = useState(cartItems.map(item => item.cartItemId || item.id));
  const hasInitializedSelection = useRef(false);

  useEffect(() => {
    if (cartItems.length > 0 && !hasInitializedSelection.current) {
      setSelectedItemIds(cartItems.map(item => item.cartItemId || item.id));
      hasInitializedSelection.current = true;
    }
  }, [cartItems]);

  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [donationAmount, setDonationAmount] = useState(10);
  const [isDonating, setIsDonating] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // null, or { type: 'single' | 'bulk', id?: string }
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // The full coupon object
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await apiClient.get('/coupons/active');
        if (data.success && data.data?.coupons) {
          setAvailableCoupons(data.data.coupons);
        }
      } catch (err) {
        console.error('Failed to fetch coupons', err);
        toast('Failed to load coupons', 'error');
      }
    };
    fetchCoupons();
  }, [toast]);

  const syncCartToBackend = async () => {
    try {
      await apiClient.delete('/cart').catch(() => { });
      let syncedCount = 0;
      for (const item of cartItems) {
        if (selectedItemIds.includes(item.cartItemId || item.id)) {
          let itemType = 'product';
          if (item.type === 'custom-build') itemType = 'savedBuild';
          else if (item.type === 'PC' || item.type === 'prebuilt') itemType = 'prebuilt';
          if (item.itemType) itemType = item.itemType;

          const itemId = item.id || item._id || item.item;

          if (!itemId || !/^[a-fA-F0-9]{24}$/.test(String(itemId))) {
            throw new Error(`Item "${item.title || 'Unknown'}" is a mock item. Please remove it and add real products from the catalog.`);
          }

          await apiClient.post('/cart/items', {
            itemType,
            itemId,
            quantity: item.qty || 1
          });
          syncedCount++;
        }
      }

      if (syncedCount === 0) {
        throw new Error("No valid items selected for checkout.");
      }
      return true;
    } catch (error) {
      console.error('Failed to sync cart', error);
      const raw = error.response?.data?.message;
      toast(friendlyStockMessage(raw) || `Cart Sync Error: ${raw || error.message}`, 'error');
      return false;
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      const selectedAddress = savedAddresses[selectedAddressId];
      if (!selectedAddress) {
        toast('Please select a delivery address', 'warning');
        return;
      }

      const isSynced = await syncCartToBackend();
      if (!isSynced) return;

      if (paymentMethod === 'cod') {
        const orderData = {
          addressId: selectedAddress._id || selectedAddress.id,
          paymentMethod: 'cod'
        };
        const orderResponse = await apiClient.post('/orders/checkout', orderData);
        if (!orderResponse.data.success) {
          toast('Failed to place order', 'error');
          return;
        }
        clearCart();
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/orders');
        }, 4000);
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        toast('Razorpay SDK failed to load. Are you online?', 'error');
        return;
      }

      // Step 1: Create Order in Backend
      const orderData = {
        addressId: selectedAddress._id || selectedAddress.id,
        paymentMethod: 'razorpay'
      };
      const orderResponse = await apiClient.post('/orders/checkout', orderData);

      if (!orderResponse.data.success) {
        toast('Failed to create order', 'error');
        return;
      }

      const orderId = orderResponse.data.data.order._id;

      // Step 2: Create Razorpay Order
      const rzpOrderResponse = await apiClient.post('/payments/create-razorpay-order', { orderId });
      if (!rzpOrderResponse.data.success) {
        toast('Failed to initialize Razorpay checkout', 'error');
        return;
      }

      const { razorpay } = rzpOrderResponse.data.data;

      // Step 3: Open Razorpay Checkout
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'Rigcraft',
        description: 'Order Payment',
        order_id: razorpay.orderId,
        handler: async function (response) {
          try {
            // Step 4: Verify Payment
            const verifyResponse = await apiClient.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              clearCart();
              toast('Payment successful! Your order has been placed.');
              navigate('/orders');
            } else {
              toast('Payment Verification Failed', 'error');
            }
          } catch (error) {
            console.error('Verify error:', error);
            toast('An error occurred during payment verification.', 'error');
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#0052FF'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      const raw = error.response?.data?.message;
      toast(friendlyStockMessage(raw) || `Checkout Failed: ${raw || error.message}`, 'error');
    }
  };

  // Address States
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: '', isDefault: false
  });

  const statesList = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const fetchAddresses = async () => {
    try {
      const { data } = await apiClient.get('/addresses');
      if (data.success) {
        setSavedAddresses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
      toast('Failed to load addresses', 'error');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses();
    }
  }, [isLoggedIn]);

  // If we open Address step and we have saved addresses, show list by default
  useEffect(() => {
    if (checkoutStep === 'address' && savedAddresses.length > 0 && !editingAddressId) {
      setIsAddingAddress(false);
      // Auto-select the default address
      if (selectedAddressId === null) {
        const defaultIdx = savedAddresses.findIndex(a => a.isDefault);
        setSelectedAddressId(defaultIdx >= 0 ? defaultIdx : 0);
      }
    } else if (checkoutStep === 'address' && savedAddresses.length === 0) {
      setIsAddingAddress(true);
    }
  }, [checkoutStep, savedAddresses.length, editingAddressId, selectedAddressId]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const foundCoupon = availableCoupons.find(c => c.code.toUpperCase() === code);
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      setIsCouponApplied(true);
      setShowCouponPopup(false);
      toast('Coupon applied successfully!');
    } else {
      toast('Invalid coupon code!', 'warning');
    }
  };

  const handleSelectAvailableCoupon = (couponCode) => {
    setCouponInput(couponCode);
  };

  const confirmDelete = () => {
    if (itemToDelete?.type === 'single') {
      removeFromCart(itemToDelete.id);
    } else if (itemToDelete?.type === 'bulk') {
      selectedItemIds.forEach(id => removeFromCart(id));
      setSelectedItemIds([]);
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleBulkMoveToWishlist = async () => {
    if (selectedItemIds.length === 0) return;
    try {
      const checkoutItems = cartItems.filter(item => selectedItemIds.includes(item.cartItemId || item.id));
      for (const item of checkoutItems) {
        if (item.itemType === 'product' && item.item) {
           await apiClient.post('/wishlist/items', { productId: item.item._id || item.item }).catch(() => {});
        }
        removeFromCart(item.cartItemId || item.id);
      }
      setSelectedItemIds([]);
    } catch (err) {
      console.error(err);
      toast('Failed to move items to wishlist', 'error');
    }
  };

  const toggleWishlistAccordion = async () => {
    if (!isWishlistOpen) {
      try {
        const { data } = await apiClient.get('/wishlist');
        if (data.success) setWishlistItems(data.data.items || []);
      } catch (e) {
        console.error(e);
        toast('Failed to load wishlist', 'error');
      }
    }
    setIsWishlistOpen(!isWishlistOpen);
  };

  const handleWishlistAddToCart = (wishlistItem) => {
    const product = wishlistItem.item || wishlistItem.product;
    const itemType = wishlistItem.itemType || product?.type || 'product';

    addToCart({
      id: product?._id,
      item: product,
      type: itemType,
      itemType,
      title: product?.name || product?.title,
      price: product?.price || product?.pricing?.price || product?.salePrice,
      mrp: product?.mrp || product?.pricing?.price,
      image: product?.image || product?.images?.[0]?.url || product?.images?.[0]
    });
  };

  const toggleItemSelection = (cartItemId) => {
    setSelectedItemIds(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItemIds.length === cartItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cartItems.map(item => item.cartItemId || item.id));
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      toast("Please fill out all required fields (*).", 'warning');
      return;
    }
    
    try {
      if (editingAddressId !== null) {
        const addrId = savedAddresses[editingAddressId]._id || savedAddresses[editingAddressId].id;
        if (addrId) {
          await apiClient.put(`/addresses/${addrId}`, addressForm);
          setEditingAddressId(null);
        }
      } else {
        await apiClient.post('/addresses', addressForm);
      }
      
      const { data } = await apiClient.get('/addresses');
      if (data.success) {
        setSavedAddresses(data.data);
        if (data.data.length > 0) {
          setSelectedAddressId(0);
        }
      }
      
      setIsAddingAddress(false);
      setCheckoutStep('payment');
      setAddressForm({ fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: '', isDefault: false });
    } catch (error) {
      console.error('Failed to save address', error);
      toast(error.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handleEditAddress = (index) => {
    setAddressForm(savedAddresses[index]);
    setEditingAddressId(index);
    setIsAddingAddress(true);
  };

  const confirmRemove = async () => {
    try {
      const addrId = savedAddresses[addressToRemove]._id || savedAddresses[addressToRemove].id;
      await apiClient.delete(`/addresses/${addrId}`);
      await fetchAddresses();
      setShowRemoveConfirm(false);
      setAddressToRemove(null);
      if (selectedAddressId === addressToRemove) {
        setSelectedAddressId(null);
      } else if (selectedAddressId > addressToRemove) {
        setSelectedAddressId(selectedAddressId - 1);
      }
      toast('Address removed successfully');
    } catch (error) {
      console.error('Failed to remove address', error);
      toast('Failed to remove address', 'error');
    }
  };

  // Price parsing helper
  const parsePrice = (priceStr, fallbackVal) => {
    if (!priceStr && !fallbackVal) return 0;
    const strToParse = priceStr || fallbackVal;
    if (typeof strToParse === 'number') return strToParse;
    const numericStr = String(strToParse).replace(/[^0-9]/g, '');
    return parseInt(numericStr, 10) || 0;
  };

  const checkoutItems = cartItems.filter(item => selectedItemIds.includes(item.cartItemId || item.id));

  const getItemPrice = (item) => parsePrice(item.priceVal || item.totalPrice || item.price || item.pricing?.price || item.pricing?.salePrice);
  const getItemMrp = (item) => parsePrice(item.mrp || item.priceVal || item.totalPrice || item.pricing?.price || item.price);

  const totalMRP = checkoutItems.reduce((sum, item) => sum + (getItemMrp(item) * (item.qty || 1)), 0);
  const totalDiscount = checkoutItems.reduce((sum, item) => sum + ((getItemMrp(item) - getItemPrice(item)) * (item.qty || 1)), 0);
  const subtotal = totalMRP - totalDiscount;
  let calculatedCouponDiscount = 0;
  if (isCouponApplied && appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      calculatedCouponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maximumDiscount) {
        calculatedCouponDiscount = Math.min(calculatedCouponDiscount, appliedCoupon.maximumDiscount);
      }
    } else {
      calculatedCouponDiscount = appliedCoupon.discountValue;
    }
  }

  const couponDiscount = calculatedCouponDiscount;
  const platformFee = 0;
  const codFee = (checkoutStep === 'payment' && paymentMethod === 'cod') ? 60 : 0;
  const finalTotal = totalMRP - totalDiscount - couponDiscount + (isDonating ? donationAmount : 0) + platformFee + codFee;

  const formatPrice = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (cartItems.length === 0 && checkoutStep === 'bag') {
    if (isLoading) {
      return (
        <section className="w-full py-20 min-h-[50vh] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-primary)] border-t-transparent" />
        </section>
      );
    }
    return (
      <section className="w-full py-20 min-h-[50vh] flex flex-col items-center justify-center text-center px-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] mb-4">Hey, it feel so dark!</h1>
        <p className="text-[16px] text-[#64748B] mb-8">There is nothing in your bag Let's add some items.</p>
        <Link to="/wishlist" className="bg-[#0052FF] text-white font-bold py-3 px-8 rounded-sm hover:opacity-90 transition-opacity">
          ADD ITEMS FROM WISHLIST
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full py-8 min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Column - 60% */}
          <div className="w-full lg:w-[60%] flex flex-col gap-4">

            {checkoutStep === 'bag' ? (
              <>
                {/* Item Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2 font-bold text-[15px] text-[#0F172A]">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 accent-[#0052FF] cursor-pointer"
                    />
                    {selectedItemIds.length}/{cartItems.length} ITEMS SELECTED
                  </div>
                  <div className="flex items-center gap-4 text-[13px] font-bold text-[#64748B]">
                    <button onClick={() => { if (selectedItemIds.length > 0) { setItemToDelete({ type: 'bulk' }); setShowDeleteConfirm(true); } }} className="hover:text-[#0F172A] cursor-pointer transition-colors">REMOVE</button>
                    <div className="w-[1px] h-4 bg-[#CBD5E1]"></div>
                    <button onClick={handleBulkMoveToWishlist} className="hover:text-[#0F172A] cursor-pointer transition-colors">MOVE TO WISHLIST</button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 mt-2">
                  {cartItems.map((item, index) => {
                    const uniqueId = item.cartItemId || item.id;

                    if (item.type === 'custom-build' || item.itemType === 'savedBuild') {
                      const components = item.components || item.item?.components || [];
                      return (
                        <div key={uniqueId || index} className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm relative flex flex-col gap-4 shadow-sm hover:border-[#2563EB] transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(uniqueId)}
                                onChange={() => toggleItemSelection(uniqueId)}
                                className="w-4 h-4 accent-[#0052FF] cursor-pointer mt-1"
                              />
                              <div>
                                <h3 className="text-[16px] font-black text-[#0F172A] mb-1 uppercase tracking-tight">{item.title || item.name || 'Rigcraft AI Custom Build'}</h3>
                                <p className="text-[13px] text-[#64748B] mb-2 font-medium">{components.length || 0} Custom Components Included</p>
                                <div className="text-[12px] text-[#0F172A] flex items-center gap-1">
                                  <span className="font-bold">14 days</span> return available
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button onClick={() => { setItemToDelete({ type: 'single', id: uniqueId }); setShowDeleteConfirm(true); }} className="text-red-500 hover:text-red-700 cursor-pointer transition-colors">
                                <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                              </button>
                              <div className="text-[18px] font-black text-[#2563EB]">{formatPrice(getItemPrice(item))}</div>
                            </div>
                          </div>

                          <div className="flex gap-2 overflow-x-auto items-center py-3 border-t border-gray-100 mt-2">
                            {components.map((comp, idx) => (
                              <div key={idx} className="w-14 h-14 bg-gray-50 flex flex-col items-center justify-center rounded-sm shrink-0 border border-gray-100 p-1 relative group" title={comp.product?.title || comp.product?.name}>
                                {comp.product?.image || comp.product?.images?.[0] ? (
                                  <img src={comp.product.image || (typeof comp.product.images?.[0] === 'string' ? comp.product.images[0] : comp.product.images?.[0]?.url)} alt={getTypeName(comp.type)} className="w-full h-full object-contain mix-blend-multiply" />
                                ) : (
                                  <span className="text-[8px] text-gray-400 font-bold uppercase">{getTypeName(comp.type).substring(0, 3)}</span>
                                )}
                                <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 bg-black text-white text-[9px] px-1 rounded whitespace-nowrap transition-opacity z-10 font-bold">
                                  {getTypeName(comp.type)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={uniqueId || index} className="bg-white border border-[#E2E8F0] p-4 rounded-sm relative flex gap-4 hover:shadow-sm transition-shadow">
                        <button onClick={() => { setItemToDelete({ type: 'single', id: uniqueId }); setShowDeleteConfirm(true); }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer transition-colors">
                          <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                        </button>

                        <div className="w-28 h-36 bg-[#F8FAFC] shrink-0 p-2 relative">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(uniqueId)}
                            onChange={() => toggleItemSelection(uniqueId)}
                            className="absolute top-2 left-2 z-10 w-4 h-4 accent-[#0052FF] cursor-pointer"
                          />
                          <img src={item.image || (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) || '/placeholder.png'} alt={item.title || item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>

                        <div className="flex flex-col flex-grow py-1">
                          <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">{item.brand ? getTypeName(item.brand) : 'Rigcraft'}</h3>
                          <p className="text-[14px] text-[#64748B] mb-2 pr-6 line-clamp-1">{item.title || item.name}</p>
                          <p className="text-[12px] text-[#94A3B8] mb-3">Sold by: RetailNet</p>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[15px] font-bold text-[#0F172A]">{formatPrice(getItemPrice(item))}</span>
                            {getItemMrp(item) > getItemPrice(item) && (
                              <span className="text-[13px] text-[#94A3B8] line-through">{formatPrice(getItemMrp(item))}</span>
                            )}
                            {item.discount && (
                              <span className="text-[13px] font-bold text-[#FF905A]">{item.discount}</span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#0F172A] flex items-center gap-1">
                            <span className="font-bold">14 days</span> return available
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Wishlist Add More Accordion */}
                {/* <div className="mt-2 bg-white border border-[#E2E8F0] rounded-sm overflow-hidden">
                  <div onClick={toggleWishlistAccordion} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-[14px] text-[#0F172A]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                      Add More From Wishlist
                    </div>
                    <KeyboardArrowDownIcon className={`text-[#64748B] transition-transform ${isWishlistOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {isWishlistOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[#E2E8F0]"
                      >
                        {wishlistItems.length > 0 ? (
                          <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                            {wishlistItems.map((wishlistItem, idx) => (
                              <div key={idx} className="flex items-center justify-between border border-gray-100 p-2 rounded-sm bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white rounded p-1 shrink-0">
                                    <img src={wishlistItem.item.image || (typeof wishlistItem.item.images?.[0] === 'string' ? wishlistItem.item.images[0] : wishlistItem.item.images?.[0]?.url) || '/placeholder.png'} alt={wishlistItem.item.name || wishlistItem.item.title} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-[#0F172A] line-clamp-1">{wishlistItem.item.name || wishlistItem.item.title}</span>
                                    <span className="text-[12px] font-bold text-[#0052FF]">{formatPrice(getItemPrice(wishlistItem.item))}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleWishlistAddToCart(wishlistItem)}
                                  className="bg-white text-[#0052FF] border border-[#0052FF] rounded-sm p-1.5 hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                                  title="Add to Cart"
                                >
                                  <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-[#64748B] text-[13px]">
                            Your wishlist is empty.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div> */}
              </>
            ) : checkoutStep === 'address' && isAddingAddress ? (
              /* Address Form Step */
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-sm mb-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#EFF6FF] text-[#0052FF] p-1 rounded-sm"><PersonOutlineIcon fontSize="small" /></div>
                  <span className="font-bold text-[14px] text-[#0F172A]">CONTACT DETAILS</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Full Name*</label>
                    <input type="text" placeholder="Full Name (e.g. Ravi Sharma)" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Mobile No*</label>
                    <input type="text" placeholder="Phone (e.g. 9876543210)" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Alternate Phone</label>
                    <input type="text" placeholder="Alternate Phone (e.g. 9988776655)" value={addressForm.alternatePhone} onChange={e => setAddressForm({ ...addressForm, alternatePhone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Pin Code*</label>
                    <input type="text" placeholder="Postal Code (e.g. 400004)" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] my-6"></div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#EFF6FF] text-[#0052FF] p-1 rounded-sm"><LocationOnOutlinedIcon fontSize="small" /></div>
                  <span className="font-bold text-[14px] text-[#0F172A]">SHIPPING ADDRESS</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Address Line 1*</label>
                    <input type="text" placeholder="Address Line 1 (e.g. 42, Girgaon Road)" value={addressForm.addressLine1} onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Address Line 2</label>
                    <input type="text" placeholder="Address Line 2 (e.g. Near Chandan Cinema)" value={addressForm.addressLine2} onChange={e => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Landmark</label>
                    <input type="text" placeholder="Landmark (e.g. Opposite City Mall)" value={addressForm.landmark} onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">City / District*</label>
                    <input type="text" placeholder="City (e.g. Mumbai)" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">State*</label>
                    <select
                      value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Select State</option>
                      {statesList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Country*</label>
                    <input type="text" value="India" readOnly className="w-full border border-[#CBD5E1] bg-gray-100 rounded-sm p-3 text-[14px] text-gray-500 focus:outline-none cursor-not-allowed select-none" />
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] my-6"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-3">Address Type / Label*</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, label: 'Home' })}
                        className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[13px] font-bold cursor-pointer transition-colors ${addressForm.label === 'Home' ? 'bg-[#0052FF] text-white border border-[#0052FF]' : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#0052FF]'}`}
                      >
                        Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, label: 'Office' })}
                        className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[13px] font-bold cursor-pointer transition-colors ${addressForm.label === 'Office' ? 'bg-[#0052FF] text-white border border-[#0052FF]' : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#0052FF]'}`}
                      >
                        Office
                      </button>
                    </div>
                    <input type="text" placeholder="Or type custom label (e.g. parent's home)" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full sm:w-[250px] border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors placeholder-gray-500" />
                  </div>
                  <label className="flex-1 flex items-center gap-2 cursor-pointer pb-3 sm:pb-3 sm:justify-end">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 accent-[#0052FF] cursor-pointer" />
                    <span className="text-[13px] text-[#0F172A] font-bold flex flex-col">
                      <span>Set as default</span>
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => {
                    if (savedAddresses.length > 0) setIsAddingAddress(false);
                    else setCheckoutStep('bag');
                    setEditingAddressId(null);
                    setAddressForm({ fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: '', isDefault: false });
                  }} className="flex-1 border border-[#0052FF] text-[#0052FF] font-bold py-3.5 rounded-sm hover:bg-[#EFF6FF] transition-colors text-[14px] cursor-pointer tracking-wide">
                    CANCEL
                  </button>
                  <button onClick={handleSaveAddress} className="flex-1 bg-[#0052FF] text-white font-bold py-3.5 rounded-sm hover:bg-[#1E3A8A] transition-colors text-[14px] cursor-pointer tracking-wide">
                    SAVE & CONTINUE
                  </button>
                </div>
              </div>
            ) : checkoutStep === 'payment' ? (
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-sm mb-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#EFF6FF] text-[#0052FF] p-1 rounded-sm"><VerifiedUserIcon fontSize="small" /></div>
                  <span className="font-bold text-[14px] text-[#0F172A]">PAYMENT OPTIONS</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`border rounded-sm p-4 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[#0052FF] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0052FF]'}`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" checked={paymentMethod === 'razorpay'} readOnly className="w-4 h-4 accent-[#0052FF]" />
                      <span className="font-bold text-[15px] text-[#0F172A]">Pay with Razorpay (Cards, UPI, NetBanking)</span>
                    </label>
                    <p className="text-[12px] text-[#64748B] mt-2 ml-7">
                      Secure payments via Razorpay. You will be redirected to the payment gateway.
                    </p>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`border rounded-sm p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#0052FF] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0052FF]'}`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly className="w-4 h-4 accent-[#0052FF]" />
                      <span className="font-bold text-[15px] text-[#0F172A]">Cash on Delivery (Cash/UPI)</span>
                    </label>
                    <p className="text-[12px] text-[#64748B] mt-2 ml-7">
                      Pay at your doorstep. A ₹60 fee is applied for COD orders.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Address List Step */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0F172A]">Select Delivery Address</h2>
                    <div className="text-[10px] font-bold text-[#64748B] tracking-[1px] uppercase mt-1">DEFAULT ADDRESS</div>
                  </div>
                  <button onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setAddressForm({ fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: '', isDefault: false }); }} className="text-[12px] font-bold text-[#0052FF] border border-[#0052FF] py-2 px-4 rounded-sm hover:bg-[#EFF6FF] transition-colors cursor-pointer">
                    ADD NEW ADDRESS
                  </button>
                </div>

                {savedAddresses.map((addr, index) => (
                  <div key={index} className="bg-white border border-[#E2E8F0] p-6 rounded-sm mb-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={selectedAddressId === index}
                        onChange={() => setSelectedAddressId(index)}
                        className="mt-1 w-4 h-4 accent-[#0052FF] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-[15px] text-[#0F172A]">{addr.fullName}</span>
                          <span className="bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">{addr.label}</span>
                          {addr.isDefault && <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">DEFAULT</span>}
                        </div>
                        <div className="text-[13px] text-[#64748B] mb-2 leading-relaxed">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''},<br />
                          {addr.landmark ? `Landmark: ${addr.landmark}, ` : ''}{addr.city}, {addr.state} - {addr.postalCode}
                        </div>
                        <div className="text-[13px] text-[#0F172A] mb-4 flex flex-col gap-1">
                          <span>Mobile: <span className="font-bold">{addr.phone}</span></span>
                          {addr.alternatePhone && <span>Alt Mobile: <span className="font-bold">{addr.alternatePhone}</span></span>}
                        </div>
                        <ul className="text-[12px] text-[#64748B] list-disc ml-4 mb-6">
                          <li>Cash on Delivery available</li>
                        </ul>
                        <div className="flex gap-4">
                          <button onClick={() => { setAddressToRemove(index); setShowRemoveConfirm(true); }} className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors cursor-pointer">REMOVE</button>
                          <button onClick={() => handleEditAddress(index)} className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors cursor-pointer">EDIT</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setAddressForm({ fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: '', isDefault: false }); }}
                  className="border border-dashed border-[#94A3B8] bg-white py-4 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-[#0052FF] hover:text-[#0052FF] transition-colors text-[14px] font-bold text-[#0F172A]"
                >
                  <span className="text-[#0052FF] text-[18px]">+</span> Add New Address
                </div>
              </div>
            )}

          </div>

          {/* Right Column - 40% */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-[105px] flex flex-col gap-4">

              {checkoutStep === 'bag' ? (
                <>
                  {/* Coupons */}
                  <div className="bg-white border border-[#E2E8F0] rounded-sm p-4">
                    <div className="text-[12px] font-bold text-[#64748B] mb-3 uppercase">Coupons</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-[14px] font-bold text-[#0F172A]">
                        <LocalOfferOutlinedIcon sx={{ fontSize: 20 }} className="text-[#64748B]" /> Apply Coupons
                      </div>
                      <button
                        onClick={() => setShowCouponPopup(true)}
                        className={`text-[13px] font-bold py-1.5 cursor-pointer px-4 border rounded-sm transition-colors ${isCouponApplied ? 'border-[#10B981] text-[#10B981]' : 'border-[#0052FF] text-[#0052FF] hover:bg-[#EFF6FF]'}`}
                      >
                        {isCouponApplied ? 'APPLIED' : 'APPLY'}
                      </button>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="bg-white border border-[#E2E8F0] rounded-sm p-4">
                    <div className="text-[12px] font-bold text-[#64748B] mb-4 uppercase">Price Details ({checkoutItems.length} Items)</div>

                    <div className="flex flex-col gap-3 text-[14px] text-[#0F172A] mb-4 border-b border-[#E2E8F0] pb-4">
                      <div className="flex justify-between items-center relative">
                        <span>Total MRP</span>
                        <span>{formatPrice(totalMRP)}</span>
                      </div>
                      <div className="flex justify-between items-center relative">
                        <span>Discount on MRP</span>
                        <span className="text-[#10B981]">- {formatPrice(totalDiscount)}</span>
                      </div>
                      <div className="flex justify-between items-center relative">
                        <span>Coupon Discount</span>
                        {isCouponApplied ? (
                          <span className="text-[#10B981]">- {formatPrice(couponDiscount)}</span>
                        ) : (
                          <button onClick={() => setShowCouponPopup(true)} className="text-[#0052FF] text-[12px] font-bold cursor-pointer hover:underline">APPLY COUPON</button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center font-extrabold text-[18px] text-[#0F172A] mb-4">
                      <span>Total Amount</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>

                    <p className="text-[11px] text-[#64748B] mb-4 leading-tight">
                      By placing this order, you agree to Rigcraft's{' '}
                      <Link to="/terms-of-service" className="text-[#0052FF] font-bold hover:underline cursor-pointer">Terms of Use</Link> and{' '}
                      <Link to="/privacy-policy" className="text-[#0052FF] font-bold hover:underline cursor-pointer">Privacy Policy</Link>.
                    </p>

                    <button
                      onClick={() => setCheckoutStep('address')}
                      className="w-full bg-[#0052FF] text-white font-bold py-3.5 rounded-sm hover:bg-[#1E3A8A] transition-colors tracking-wide cursor-pointer"
                    >
                      PLACE ORDER
                    </button>
                  </div>
                </>
              ) : (
                /* Address Order Summary / List Summary */
                <>
                  {!isAddingAddress && (
                    <div className="bg-white border border-[#E2E8F0] rounded-sm mb-4">
                      <div className="text-[11px] font-bold text-[#94A3B8] uppercase p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                        Delivery Estimates
                      </div>
                      <div className="p-4 flex gap-4 items-center">
                        <div className="w-12 h-16 bg-[#F8FAFC] border border-[#E2E8F0] p-1 flex-shrink-0">
                          <img src={checkoutItems[0]?.image || '/placeholder.png'} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                        </div>
                        <div className="text-[12px] text-[#0F172A]">
                          <span className="text-[#64748B] block mb-1">Delivery between</span>
                          <span className="font-bold">1 Aug - 3 Aug</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-[#E2E8F0] rounded-sm">
                    <div className="text-[11px] font-bold text-[#94A3B8] uppercase p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      Price Details ({checkoutItems.length} Item{checkoutItems.length !== 1 && 's'})
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center text-[13px] text-[#64748B] mb-2">
                        <span>Total</span>
                        <span className="text-[#0F172A] font-bold">{formatPrice(totalMRP)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] text-[#64748B] mb-2">
                        <span className="flex flex-col"><span>MRP</span><span>Discount on MRP</span> <span className="text-[#0052FF] text-[10px] font-bold uppercase cursor-pointer">Know More</span></span>
                        <span className="text-[#10B981] font-bold">- {formatPrice(totalDiscount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] text-[#64748B] mb-2">
                        <span className="flex flex-col"><span>Platform Fee</span> <span className="text-[#0052FF] text-[10px] font-bold uppercase cursor-pointer">Know More</span></span>
                        <span className="text-[#10B981] font-bold uppercase">Free</span>
                      </div>

                      <div className="border-t border-[#E2E8F0] my-4"></div>

                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-extrabold text-[#0F172A] leading-tight">Total<br />Amount</span>
                        </div>
                        <span className="text-[16px] font-extrabold text-[#0F172A]">{formatPrice(finalTotal)}</span>
                      </div>

                      {checkoutStep === 'payment' ? (
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-sm hover:bg-[#1E3A8A] transition-colors tracking-wide cursor-pointer mt-6 flex items-center justify-center gap-2"
                        >
                          {paymentMethod === 'cod' ? 'PLACE ORDER' : <><VerifiedUserIcon fontSize="small" /> PAY SECURELY</>}
                        </button>
                      ) : !isAddingAddress && (
                        <button
                          onClick={() => {
                            if (selectedAddressId !== null) {
                              setCheckoutStep('payment');
                            } else {
                              toast("Please select a delivery address.", 'warning');
                            }
                          }}
                          className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-sm hover:bg-[#1E3A8A] transition-colors tracking-wide cursor-pointer mt-6"
                        >
                          CONTINUE
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Remove Confirm Popup */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            key="remove-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              key="remove-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-[400px] p-6 shadow-xl relative text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Remove Address</h2>
              <p className="text-[14px] text-[#64748B] mb-6">Are you sure you want to remove this address?</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 border border-[#0052FF] text-[#0052FF] font-bold py-2 rounded-sm hover:bg-[#EFF6FF] transition-colors text-[13px] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 bg-[#0052FF] text-white font-bold py-2 rounded-sm hover:bg-[#1E3A8A] transition-colors text-[13px] cursor-pointer"
                >
                  CONFIRM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupon Popup */}
      <AnimatePresence>
        {showCouponPopup && (
          <motion.div
            key="coupon-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCouponPopup(false)}
          >
            <motion.div
              key="coupon-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-[400px] p-6 shadow-xl relative"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <button
                onClick={() => setShowCouponPopup(false)}
                className="absolute top-4 cursor-pointer right-4 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <CloseIcon />
              </button>
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-4">Apply Coupon</h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  autoFocus
                  className="flex-grow border border-[#CBD5E1] rounded-sm px-3 py-2 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] bg-white z-10"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-[#0052FF] cursor-pointer text-white font-bold px-6 rounded-sm text-[13px] hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                >
                  VERIFY
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-[12px] font-bold text-[#64748B]">AVAILABLE COUPONS</div>
                {availableCoupons.length > 0 ? (
                  availableCoupons.map((coupon, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm p-3 cursor-pointer hover:border-[#0052FF] transition-colors"
                      onClick={() => handleSelectAvailableCoupon(coupon.code)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-bold text-[#0F172A] border-dashed border border-[#94A3B8] px-2 py-1 bg-white text-[13px] uppercase">{coupon.code}</div>
                        <div className="text-[12px] text-[#10B981] font-bold">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Save ₹${coupon.discountValue}`}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#64748B] text-left mt-2">{coupon.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] text-[#64748B] bg-gray-50 p-3 rounded-sm border border-gray-100">No active coupons available right now.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-sm w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 border border-[#E2E8F0]"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <DeleteOutlineIcon />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A]">Delete item from cart</h3>
                  <p className="text-[13px] text-[#64748B] mt-1">Are you sure you want to remove {itemToDelete?.type === 'bulk' ? 'selected items' : 'this item'}?</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setItemToDelete(null); }}
                  className="flex-1 py-2 border border-[#CBD5E1] text-[#0F172A] font-bold text-[13px] rounded-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 bg-red-600 text-white font-bold text-[13px] rounded-sm hover:bg-red-700 transition-colors cursor-pointer"
                >
                  REMOVE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
          >
            <div 
              className="bg-white px-8 py-6 shadow-2xl flex flex-col items-center gap-3 border border-[#E2E8F0]"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981' }} />
              <h2 className="text-xl font-black text-[#0F172A] tracking-wide">Order Successful!</h2>
              <p className="text-sm font-bold text-[#64748B]">Redirecting to your orders...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default CartWorkspace;
