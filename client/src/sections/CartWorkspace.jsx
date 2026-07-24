import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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

const CartWorkspace = ({ checkoutStep = 'bag', setCheckoutStep }) => {
  const { cartItems, removeFromCart } = useCart();
  
  // Track selected items by cartItemId (or id for legacy items)
  const [selectedItemIds, setSelectedItemIds] = useState(cartItems.map(item => item.cartItemId || item.id));

  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [donationAmount, setDonationAmount] = useState(10);
  const [isDonating, setIsDonating] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  
  // Address States
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('rigcraft_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isAddingAddress, setIsAddingAddress] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: '', mobile: '', pinCode: '', houseNo: '', street: '', city: '', state: '', type: 'HOME', isDefault: false
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

  // Sync addresses to localStorage
  useEffect(() => {
    localStorage.setItem('rigcraft_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const handleApplyCoupon = () => {
    if (couponInput.trim().toUpperCase() === 'RIGCRAFT500') {
      setIsCouponApplied(true);
      setShowCouponPopup(false);
    } else if (couponInput.trim() !== '') {
      alert('Invalid coupon code!');
    }
  };

  const handleSelectAvailableCoupon = () => {
    setCouponInput('RIGCRAFT500');
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

  const handleSaveAddress = () => {
    let newAddresses = [...savedAddresses];
    let addressToSave = { ...addressForm };
    
    // If set as default, remove default flag from others
    if (addressToSave.isDefault) {
      newAddresses = newAddresses.map(addr => ({ ...addr, isDefault: false }));
    } else if (newAddresses.length === 0 || (editingAddressId !== null && newAddresses.length === 1)) {
      // First address is always default
      addressToSave.isDefault = true;
    }

    if (editingAddressId !== null) {
      newAddresses[editingAddressId] = addressToSave;
      setEditingAddressId(null);
    } else {
      newAddresses.push(addressToSave);
      if (addressToSave.isDefault) {
        setSelectedAddressId(newAddresses.length - 1);
      }
    }
    
    setSavedAddresses(newAddresses);
    setIsAddingAddress(false);
    setAddressForm({ name: '', mobile: '', pinCode: '', houseNo: '', street: '', city: '', state: '', type: 'HOME', isDefault: false });
  };

  const handleEditAddress = (index) => {
    setAddressForm(savedAddresses[index]);
    setEditingAddressId(index);
    setIsAddingAddress(true);
  };

  const confirmRemove = () => {
    const updated = savedAddresses.filter((_, i) => i !== addressToRemove);
    setSavedAddresses(updated);
    if (selectedAddressId === addressToRemove) setSelectedAddressId(null);
    setShowRemoveConfirm(false);
    setAddressToRemove(null);
    if (updated.length === 0) setIsAddingAddress(true);
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

  const totalMRP = checkoutItems.reduce((sum, item) => sum + (parsePrice(item.mrp, item.price) * (item.qty || 1)), 0);
  const totalDiscount = checkoutItems.reduce((sum, item) => sum + ((parsePrice(item.mrp, item.price) - parsePrice(item.price)) * (item.qty || 1)), 0);
  const couponDiscount = isCouponApplied ? 500 : 0;
  const platformFee = 0;
  const finalTotal = totalMRP - totalDiscount - couponDiscount + (isDonating ? donationAmount : 0) + platformFee;

  const formatPrice = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (cartItems.length === 0 && checkoutStep === 'bag') {
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
                {/* Check Delivery */}
                <div className="bg-white border border-[#E2E8F0] p-4 flex justify-between items-center rounded-sm">
                  <div className="text-[14px] font-bold text-[#64748B]">Check delivery time & services</div>
                  <button className="text-[#0052FF] text-[13px] font-bold border border-[#0052FF] py-2 px-4 rounded-sm hover:bg-[#EFF6FF] transition-colors cursor-pointer">
                    ENTER PIN CODE
                  </button>
                </div>

                {/* Offers */}
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-sm">
                  <div className="flex items-center gap-2 mb-4 font-bold text-[14px] text-[#0F172A]">
                    <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} /> Offers (11)
                  </div>
                  <div className="border border-[#E2E8F0] p-3 flex items-center justify-between cursor-pointer rounded-sm hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[#0F172A] rounded flex items-center justify-center text-[10px] text-white font-bold">CAR</div>
                      <div>
                        <div className="text-[14px] font-bold text-[#0F172A]">7.5% Assured Cashback*</div>
                        <div className="text-[12px] text-[#64748B]">on a minimum spend of ₹100. T&C</div>
                      </div>
                    </div>
                    <KeyboardArrowRightIcon />
                  </div>
                </div>

                {/* Item Header */}
                <div className="flex items-center justify-between mt-4">
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
                    <button className="hover:text-[#0F172A] cursor-pointer">REMOVE</button>
                    <div className="w-[1px] h-4 bg-[#CBD5E1]"></div>
                    <button className="hover:text-[#0F172A] cursor-pointer">MOVE TO WISHLIST</button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 mt-2">
                  {cartItems.map((item, index) => {
                    const uniqueId = item.cartItemId || item.id;
                    return (
                    <div key={uniqueId || index} className="bg-white border border-[#E2E8F0] p-4 rounded-sm relative flex gap-4 hover:shadow-sm transition-shadow">
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                        <CloseIcon sx={{ fontSize: 20 }} />
                      </button>
                      
                      <div className="w-28 h-36 bg-[#F8FAFC] shrink-0 p-2 relative">
                        <input 
                          type="checkbox" 
                          checked={selectedItemIds.includes(uniqueId)}
                          onChange={() => toggleItemSelection(uniqueId)}
                          className="absolute top-2 left-2 z-10 w-4 h-4 accent-[#0052FF] cursor-pointer" 
                        />
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      
                      <div className="flex flex-col flex-grow py-1">
                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">{item.brand || 'Rigcraft'}</h3>
                        <p className="text-[14px] text-[#64748B] mb-2 pr-6 line-clamp-1">{item.title}</p>
                        <p className="text-[12px] text-[#94A3B8] mb-3">Sold by: RetailNet</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[15px] font-bold text-[#0F172A]">{formatPrice(parsePrice(item.price))}</span>
                          {item.mrp && (
                            <span className="text-[13px] text-[#94A3B8] line-through">{item.mrp}</span>
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

                {/* Wishlist Add More */}
                <div className="bg-white border border-[#E2E8F0] p-4 mt-2 flex items-center justify-between cursor-pointer rounded-sm hover:bg-gray-50">
                  <div className="flex items-center gap-2 font-bold text-[14px] text-[#0F172A]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    Add More From Wishlist
                  </div>
                  <KeyboardArrowRightIcon className="text-[#64748B]" />
                </div>
              </>
            ) : checkoutStep === 'address' && isAddingAddress ? (
              /* Address Form Step */
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-sm mb-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#EFF6FF] text-[#0052FF] p-1 rounded-sm"><PersonOutlineIcon fontSize="small"/></div>
                  <span className="font-bold text-[14px] text-[#0F172A]">CONTACT DETAILS</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Full Name*</label>
                    <input type="text" placeholder="Enter your name" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Mobile No*</label>
                    <input type="text" placeholder="+91 00000 00000" value={addressForm.mobile} onChange={e => setAddressForm({...addressForm, mobile: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] my-6"></div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-[#EFF6FF] text-[#0052FF] p-1 rounded-sm"><LocationOnOutlinedIcon fontSize="small"/></div>
                  <span className="font-bold text-[14px] text-[#0F172A]">SHIPPING ADDRESS</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Pin Code*</label>
                    <input type="text" placeholder="6-digit PIN" value={addressForm.pinCode} onChange={e => setAddressForm({...addressForm, pinCode: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">House No. / Tower*</label>
                    <input type="text" placeholder="Flat, Floor, Building" value={addressForm.houseNo} onChange={e => setAddressForm({...addressForm, houseNo: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Street Address*</label>
                  <input type="text" placeholder="Locality, Area, Street Name" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  <span className="text-[10px] font-bold text-[#64748B] mt-1 block uppercase tracking-wide">Note: Precise address ensures laboratory-grade delivery handling.</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">City / District*</label>
                    <input type="text" placeholder="Select City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0052FF] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">State*</label>
                    <div className="relative">
                      <div 
                        onClick={() => setShowStateDropdown(!showStateDropdown)}
                        className={`w-full border ${showStateDropdown ? 'border-[#0052FF]' : 'border-[#CBD5E1]'} bg-[#F8FAFC] rounded-sm p-3 text-[14px] text-[#0F172A] focus:outline-none transition-colors cursor-pointer flex justify-between items-center`}
                      >
                        {addressForm.state || "Select State"}
                        <KeyboardArrowDownIcon className={`text-[#94A3B8] transition-transform ${showStateDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      
                      <AnimatePresence>
                        {showStateDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowStateDropdown(false)}></div>
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-[100%] mt-1 bg-white border border-[#CBD5E1] rounded-sm shadow-xl z-50 overflow-y-auto"
                              style={{ maxHeight: '220px' }}
                            >
                              {statesList.map(state => (
                                <div 
                                  key={state}
                                  onClick={() => { setAddressForm({...addressForm, state: state}); setShowStateDropdown(false); }}
                                  className={`p-3 text-[14px] cursor-pointer transition-colors hover:bg-[#EFF6FF] hover:text-[#0052FF] ${addressForm.state === state ? 'bg-[#EFF6FF] text-[#0052FF] font-bold' : 'text-[#0F172A]'}`}
                                >
                                  {state}
                                </div>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] my-6"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-3">Address Type</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAddressForm({...addressForm, type: 'HOME'})}
                        className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[13px] font-bold cursor-pointer transition-colors ${addressForm.type === 'HOME' ? 'bg-[#0052FF] text-white border border-[#0052FF]' : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#0052FF]'}`}
                      >
                        <HomeIcon fontSize="small" /> Home
                      </button>
                      <button 
                        onClick={() => setAddressForm({...addressForm, type: 'OFFICE'})}
                        className={`flex items-center gap-2 px-5 py-2 rounded-sm text-[13px] font-bold cursor-pointer transition-colors ${addressForm.type === 'OFFICE' ? 'bg-[#0052FF] text-white border border-[#0052FF]' : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:border-[#0052FF]'}`}
                      >
                        <BusinessIcon fontSize="small" /> Office
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 accent-[#0052FF] cursor-pointer" />
                    <span className="text-[13px] text-[#0F172A] flex flex-col">
                      <span>Set as default</span>
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => {
                    if (savedAddresses.length > 0) setIsAddingAddress(false);
                    else setCheckoutStep('bag');
                    setEditingAddressId(null);
                    setAddressForm({ name: '', mobile: '', pinCode: '', houseNo: '', street: '', city: '', state: '', type: 'HOME', isDefault: false });
                  }} className="flex-1 border border-[#0052FF] text-[#0052FF] font-bold py-3.5 rounded-sm hover:bg-[#EFF6FF] transition-colors text-[14px] cursor-pointer tracking-wide">
                    CANCEL
                  </button>
                  <button onClick={handleSaveAddress} className="flex-1 bg-[#0052FF] text-white font-bold py-3.5 rounded-sm hover:bg-[#1E3A8A] transition-colors text-[14px] cursor-pointer tracking-wide">
                    SAVE & CONTINUE
                  </button>
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
                  <button onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setAddressForm({ name: '', mobile: '', pinCode: '', houseNo: '', street: '', city: '', state: '', type: 'HOME', isDefault: false }); }} className="text-[12px] font-bold text-[#0052FF] border border-[#0052FF] py-2 px-4 rounded-sm hover:bg-[#EFF6FF] transition-colors cursor-pointer">
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
                          <span className="font-bold text-[15px] text-[#0F172A]">{addr.name}</span>
                          <span className="bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">{addr.type}</span>
                        </div>
                        <div className="text-[13px] text-[#64748B] mb-2 leading-relaxed">
                          {addr.houseNo}, {addr.street},<br/>
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </div>
                        <div className="text-[13px] text-[#0F172A] mb-4">
                          Mobile: <span className="font-bold">{addr.mobile}</span>
                        </div>
                        <ul className="text-[12px] text-[#64748B] list-disc ml-4 mb-6">
                          <li>Cash on Delivery available</li>
                        </ul>
                        <div className="flex gap-4">
                          <button onClick={() => {setAddressToRemove(index); setShowRemoveConfirm(true);}} className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors cursor-pointer">REMOVE</button>
                          <button onClick={() => handleEditAddress(index)} className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors cursor-pointer">EDIT</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={() => { setIsAddingAddress(true); setEditingAddressId(null); setAddressForm({ name: '', mobile: '', pinCode: '', houseNo: '', street: '', city: '', state: '', type: 'HOME', isDefault: false }); }}
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

                  {/* Social Work */}
                  <div className="bg-white border border-[#E2E8F0] rounded-sm p-4">
                    <div className="text-[12px] font-bold text-[#64748B] mb-3 uppercase">Support Transformative Social Work</div>
                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                      <input type="checkbox" checked={isDonating} onChange={() => setIsDonating(!isDonating)} className="w-4 h-4 accent-[#0052FF] cursor-pointer" />
                      <span className="font-bold text-[14px] text-[#0F172A]">Donate and make a difference</span>
                    </label>
                    <div className="flex gap-3 mb-3">
                      {[10, 20, 50, 100].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => { setDonationAmount(amt); setIsDonating(true); }}
                          className={`py-1.5 px-4 rounded-full border text-[13px] font-bold cursor-pointer transition-colors ${isDonating && donationAmount === amt ? 'border-[#0052FF] text-[#0052FF]' : 'border-[#CBD5E1] text-[#0F172A] hover:border-[#94A3B8]'}`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <button className="text-[#0052FF] text-[12px] font-bold cursor-pointer hover:underline">Know More</button>
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
                        <span className="flex items-center gap-2">Discount on MRP <button className="text-[#0052FF] text-[10px] font-bold ml-1 uppercase cursor-pointer hover:underline">Know<br />More</button></span>
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
                      <div className="flex justify-between items-center relative">
                        <span className="flex items-center gap-2">Platform Fee <button className="text-[#0052FF] text-[10px] font-bold ml-1 uppercase cursor-pointer hover:underline">Know<br />More</button></span>
                        <span className="text-[#10B981] uppercase font-bold text-[13px]">FREE</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center font-extrabold text-[18px] text-[#0F172A] mb-4">
                      <span>Total Amount</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>

                    <p className="text-[11px] text-[#64748B] mb-4 leading-tight">
                      By placing the order, you agree to Rigcraft's <span className="text-[#0052FF] font-bold cursor-pointer hover:underline">Terms of Use</span> and <span className="text-[#0052FF] font-bold cursor-pointer hover:underline">Privacy Policy</span>
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
                          <span className="text-[16px] font-extrabold text-[#0F172A] leading-tight">Total<br/>Amount</span>
                        </div>
                        <span className="text-[16px] font-extrabold text-[#0F172A]">{formatPrice(finalTotal)}</span>
                      </div>

                      {!isAddingAddress && (
                        <button 
                          onClick={() => {
                            if (selectedAddressId !== null) {
                              setCheckoutStep('payment');
                            } else {
                              alert("Please select a delivery address.");
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
              className="bg-white rounded-md w-full max-w-[400px] p-6 shadow-xl relative text-center"
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
              className="bg-white rounded-md w-full max-w-[400px] p-6 shadow-xl relative"
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
              
              <div 
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm p-3 cursor-pointer hover:border-[#0052FF] transition-colors"
                onClick={handleSelectAvailableCoupon}
              >
                <div className="text-[12px] font-bold text-[#64748B] mb-2">AVAILABLE COUPONS</div>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[#0F172A] border-dashed border border-[#94A3B8] px-2 py-1 bg-white text-[13px]">RIGCRAFT500</div>
                  <div className="text-[12px] text-[#10B981] font-bold">Save ₹500</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default CartWorkspace;
