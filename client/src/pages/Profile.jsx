import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FadeUp from '../components/FadeUp';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import Orders from './Orders';

const getTypeName = (type) => {
  if (typeof type === 'string') return type;
  if (type && type.name) return type.name;
  return 'UNKNOWN';
};

const Profile = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: isLoggedIn,
    retry: false
  });

  const userData = profileData?.data || user || {};
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const email = userData.email || '';
  const mobile = userData.phone || userData.mobile || ''; 

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [personalInfoForm, setPersonalInfoForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (userData) {
      setPersonalInfoForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || userData.mobile || ''
      });
    }
  }, [profileData, user]);

  const handleSavePersonalInfo = async (section) => {
    try {
      await apiClient.put('/auth/profile', personalInfoForm);
      if (section === 'name') setIsEditingName(false);
      if (section === 'email') setIsEditingEmail(false);
      if (section === 'phone') setIsEditingPhone(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    }
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Addresses and Builds State
  const [addresses, setAddresses] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [draftBuild, setDraftBuild] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchDraft = () => {
      const stored = localStorage.getItem('draftBuild');
      if (stored) {
         setDraftBuild(JSON.parse(stored));
      }
    };
    fetchDraft();
    const interval = setInterval(fetchDraft, 1000);
    return () => clearInterval(interval);
  }, []);
  const [selectedBuildPopup, setSelectedBuildPopup] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, buildId: null, isDraft: false });
  const [showCartToast, setShowCartToast] = useState(false);
  const { addToCart, cartItems } = useCart();
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    label: 'Home',
    isDefault: false
  });

  const statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const fetchAddresses = async () => {
    try {
      const { data } = await apiClient.get('/addresses');
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    }
  };

  const fetchBuilds = async () => {
    try {
      const { data } = await apiClient.get('/builds');
      if (data.success) {
        setBuilds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch builds', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await apiClient.get('/coupons/active');
      if (data.success && data.data && data.data.coupons) {
        const availableCoupons = data.data.coupons.filter(c => !c.isFirstOrderOnly);
        setCoupons(availableCoupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    }
  };

  const handleDeleteBuildConfirm = async () => {
    try {
      if (deleteConfirmation.isDraft) {
        localStorage.removeItem('draftBuild');
        setDraftBuild({});
      } else {
        await apiClient.delete(`/builds/${deleteConfirmation.buildId}`);
        fetchBuilds();
      }
      setDeleteConfirmation({ show: false, buildId: null, isDraft: false });
    } catch (error) {
      console.error('Failed to delete build', error);
      alert('Failed to delete build');
    }
  };

  const handleAddBuildToCart = (build) => {
    const buildPrice = build.components?.reduce((sum, comp) => sum + (comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0), 0) || 0;
    
    addToCart({
      id: build._id,
      type: 'custom-build',
      title: build.name,
      image: build.components?.[0]?.product?.image || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=200',
      priceVal: buildPrice,
      price: `₹${buildPrice.toLocaleString()}`,
      components: build.components
    });

    setShowCartToast(true);
    setTimeout(() => {
      setShowCartToast(false);
    }, 5000);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses();
      fetchBuilds();
      fetchCoupons();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await apiClient.put(`/addresses/${editingAddressId}`, addressForm);
      } else {
        await apiClient.post('/addresses', addressForm);
      }
      fetchAddresses();
      setIsAddingAddress(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Failed to save address', error);
      alert('Failed to save address');
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setEditingAddressId(address._id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await apiClient.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <section className="w-full py-8 min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:w-1/4 flex flex-col gap-4">
              
              {/* Profile Header Box */}
              <div className="bg-white p-4 shadow-sm flex items-center gap-4 border border-gray-100 rounded-sm">
                <AccountCircleIcon sx={{ fontSize: 48, color: '#2563EB' }} />
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">Hello,</div>
                  <div className="text-[16px] font-black text-gray-900 leading-tight">
                    {firstName} <br/> {lastName}
                  </div>
                </div>
              </div>

              {/* Navigation Box */}
              <div className="bg-white shadow-sm flex flex-col overflow-hidden border border-gray-100 rounded-sm">
                
                {/* Orders */}
                <div 
                  className={`p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors group ${activeTab === 'orders' ? 'bg-[#F0F7FF]' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <div className="flex items-center gap-4">
                    <Inventory2OutlinedIcon sx={{ color: '#2563EB' }} />
                    <span className="font-bold text-gray-600 group-hover:text-[#2563EB]">MY ORDERS</span>
                  </div>
                  <span className="text-gray-400 font-bold">&gt;</span>
                </div>

                {/* Account Settings */}
                <div className="border-b border-gray-100">
                  <div className="p-4 flex items-center gap-4">
                    <PersonOutlineOutlinedIcon sx={{ color: '#2563EB' }} />
                    <span className="font-bold text-gray-500 uppercase text-[14px]">Account Settings</span>
                  </div>
                  <div className="flex flex-col pb-2">
                    <div 
                      className={`pl-14 pr-4 py-2 text-[14px] font-bold cursor-pointer transition-colors border-l-4 ${activeTab === 'profile' ? 'bg-[#F0F7FF] text-[#2563EB] border-[#2563EB]' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-[#2563EB]'}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      Profile Information
                    </div>
                    <div 
                      className={`pl-14 pr-4 py-2 text-[14px] font-bold cursor-pointer transition-colors border-l-4 ${activeTab === 'addresses' ? 'bg-[#F0F7FF] text-[#2563EB] border-[#2563EB]' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-[#2563EB]'}`}
                      onClick={() => { setActiveTab('addresses'); setIsAddingAddress(false); }}
                    >
                      Manage Addresses
                    </div>
                  </div>
                </div>

                {/* My Stuff */}
                <div className="border-b border-gray-100">
                  <div className="p-4 flex items-center gap-4">
                    <FavoriteBorderIcon sx={{ color: '#2563EB' }} />
                    <span className="font-bold text-gray-500 uppercase text-[14px]">My Stuff</span>
                  </div>
                  <div className="flex flex-col pb-2">
                    <div 
                      className={`pl-14 pr-4 py-2 text-[14px] font-bold cursor-pointer transition-colors border-l-4 ${activeTab === 'orders' ? 'bg-[#F0F7FF] text-[#2563EB] border-[#2563EB]' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-[#2563EB]'}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      Track Order
                    </div>
                    <div 
                      className="pl-14 pr-4 py-2.5 text-gray-600 font-bold text-[14px] hover:bg-gray-50 hover:text-[#2563EB] cursor-pointer transition-colors border-l-4 border-transparent"
                      onClick={() => navigate('/wishlist')}
                    >
                      My Wishlist
                    </div>
                    <div 
                      className={`pl-14 pr-4 py-2 text-[14px] font-bold cursor-pointer transition-colors border-l-4 ${activeTab === 'coupons' ? 'bg-[#F0F7FF] text-[#2563EB] border-[#2563EB]' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-[#2563EB]'}`}
                      onClick={() => setActiveTab('coupons')}
                    >
                      Coupons
                    </div>
                    <div 
                      className={`pl-14 pr-4 py-2 text-[14px] font-bold cursor-pointer transition-colors border-l-4 ${activeTab === 'builds' ? 'bg-[#F0F7FF] text-[#2563EB] border-[#2563EB]' : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-[#2563EB]'}`}
                      onClick={() => setActiveTab('builds')}
                    >
                      Your Builds
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-red-50 transition-colors group"
                  onClick={handleLogout}
                >
                  <LogoutOutlinedIcon sx={{ color: '#64748B' }} className="group-hover:text-red-500 transition-colors" />
                  <span className="font-bold text-gray-600 group-hover:text-red-500 transition-colors">Logout</span>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="lg:w-3/4">
              <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-sm">
                
                {activeTab === 'profile' && (
                  <FadeUp>
                    <div className="mb-10">
                      <div className="flex items-center gap-6 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        {!isEditingName ? (
                          <button onClick={() => setIsEditingName(true)} className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleSavePersonalInfo('name')} className="text-[14px] font-bold text-green-600 hover:text-green-700">Save</button>
                            <button onClick={() => { setIsEditingName(false); setPersonalInfoForm(prev => ({...prev, firstName, lastName})); }} className="text-[14px] font-bold text-gray-600 hover:text-gray-700">Cancel</button>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mb-4">
                        <div>
                          <input type="text" value={isEditingName ? personalInfoForm.firstName : firstName} onChange={(e) => setPersonalInfoForm({...personalInfoForm, firstName: e.target.value})} readOnly={!isEditingName} className={`w-full ${isEditingName ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`} placeholder="First Name" />
                        </div>
                        <div>
                          <input type="text" value={isEditingName ? personalInfoForm.lastName : lastName} onChange={(e) => setPersonalInfoForm({...personalInfoForm, lastName: e.target.value})} readOnly={!isEditingName} className={`w-full ${isEditingName ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`} placeholder="Last Name" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-10">
                      <div className="flex items-center gap-6 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Email Address</h2>
                        {!isEditingEmail ? (
                          <button onClick={() => setIsEditingEmail(true)} className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleSavePersonalInfo('email')} className="text-[14px] font-bold text-green-600 hover:text-green-700">Save</button>
                            <button onClick={() => { setIsEditingEmail(false); setPersonalInfoForm(prev => ({...prev, email})); }} className="text-[14px] font-bold text-gray-600 hover:text-gray-700">Cancel</button>
                          </div>
                        )}
                      </div>
                      <div className="max-w-md">
                        <input type="email" value={isEditingEmail ? personalInfoForm.email : email} onChange={(e) => setPersonalInfoForm({...personalInfoForm, email: e.target.value})} readOnly={!isEditingEmail} className={`w-full ${isEditingEmail ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`} placeholder="Email Address" />
                      </div>
                    </div>

                    <div className="mb-12">
                      <div className="flex items-center gap-6 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Mobile Number</h2>
                        {!isEditingPhone ? (
                          <button onClick={() => setIsEditingPhone(true)} className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleSavePersonalInfo('phone')} className="text-[14px] font-bold text-green-600 hover:text-green-700">Save</button>
                            <button onClick={() => { setIsEditingPhone(false); setPersonalInfoForm(prev => ({...prev, phone: mobile})); }} className="text-[14px] font-bold text-gray-600 hover:text-gray-700">Cancel</button>
                          </div>
                        )}
                      </div>
                      <div className="max-w-md">
                        <input type="text" value={isEditingPhone ? personalInfoForm.phone : mobile} onChange={(e) => setPersonalInfoForm({...personalInfoForm, phone: e.target.value})} readOnly={!isEditingPhone} className={`w-full ${isEditingPhone ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`} placeholder="Mobile Number" />
                      </div>
                    </div>

                    <hr className="border-gray-200 mb-8" />

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">FAQs</h2>
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-800 text-[14px] mb-2">What happens when I update my email address (or mobile number)?</h4>
                        <p className="text-gray-600 text-[13px] leading-relaxed">Your login identity will be updated to the new email address (or mobile number). You will need to use the updated credentials for future logins and order tracking.</p>
                      </div>
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-800 text-[14px] mb-2">Does my RigCraft account get deactivated if I change my email?</h4>
                        <p className="text-gray-600 text-[13px] leading-relaxed">No, account data remains persistent. All configurations, order history, and saved compatibility alerts will be transferred to your new primary identifier instantly.</p>
                      </div>
                      <div className="mb-8">
                        <h4 className="font-bold text-gray-800 text-[14px] mb-2">Why do I need to verify my account?</h4>
                        <p className="text-gray-600 text-[13px] leading-relaxed">Verification ensures that hardware warranty claims and high-value orders are securely linked to your identity, preventing unauthorized engineering configuration changes.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
                            try {
                              await apiClient.delete('/users/me').catch(() => {});
                              logout();
                              navigate('/');
                            } catch (error) {
                              alert("Failed to deactivate account.");
                            }
                          }
                        }}
                        className="text-[13px] font-bold text-red-500 hover:text-red-600"
                      >
                        Deactivate Account
                      </button>
                    </div>
                  </FadeUp>
                )}

                {activeTab === 'addresses' && (
                  <FadeUp>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Manage Addresses</h2>
                    </div>

                    {!isAddingAddress ? (
                      <div>
                        <button 
                          onClick={() => {
                            setAddressForm({ fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', country: 'India', postalCode: '', label: 'Home', isDefault: false });
                            setEditingAddressId(null);
                            setIsAddingAddress(true);
                          }} 
                          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-blue-200 text-blue-600 font-bold mb-6 hover:bg-blue-50 transition-colors rounded-sm"
                        >
                          + ADD A NEW ADDRESS
                        </button>

                        <div className="flex flex-col gap-4">
                          {addresses.map(addr => (
                            <div key={addr._id} className="border border-gray-200 p-4 rounded-sm hover:shadow-md transition-shadow relative group bg-white">
                              <div className="absolute top-4 right-4 hidden group-hover:flex items-center gap-4">
                                <button onClick={() => handleEditAddress(addr)} className="text-blue-600 font-bold text-[13px] uppercase hover:underline">Edit</button>
                                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 font-bold text-[13px] uppercase hover:underline">Delete</button>
                              </div>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">{addr.label}</span>
                                <span className="font-bold text-gray-900">{addr.fullName}</span>
                                <span className="font-bold text-gray-900">{addr.phone}</span>
                              </div>
                              <div className="text-gray-600 text-[14px] leading-relaxed max-w-lg">
                                {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''} {addr.landmark ? `${addr.landmark}, ` : ''}
                                {addr.city}, {addr.state}, {addr.country} - <span className="font-bold text-gray-900">{addr.postalCode}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#F8FAFC] p-6 border border-gray-200 rounded-sm">
                        <h3 className="font-bold text-[#2563EB] uppercase text-[14px] mb-6">{editingAddressId ? 'Edit Address' : 'Add a new address'}</h3>
                        <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} placeholder="Name" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="text" name="phone" value={addressForm.phone} onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            handleAddressChange({ target: { name: 'phone', value: val } });
                          }} placeholder="10-digit mobile number" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="text" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} placeholder="Pincode" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="City/District/Town" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <select name="state" value={addressForm.state} onChange={handleAddressChange} required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium">
                            <option value="" disabled>Select State</option>
                            {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input type="text" name="country" value="India" readOnly className="w-full bg-gray-100 text-gray-500 border border-gray-300 px-4 py-3 focus:outline-none rounded-sm font-medium" />
                          <div className="md:col-span-2">
                            <input type="text" name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressChange} placeholder="Address (House No, Building, Street, Area)" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" name="landmark" value={addressForm.landmark} onChange={handleAddressChange} placeholder="Landmark (Optional)" className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          </div>
                          
                          <div className="md:col-span-2 flex flex-col gap-3 mt-2">
                            <div className="text-[13px] text-gray-500 font-bold uppercase tracking-wider">Address Type</div>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="label" value="Home" checked={addressForm.label === 'Home'} onChange={handleAddressChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="font-bold text-gray-700">Home</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="label" value="Work" checked={addressForm.label === 'Work'} onChange={handleAddressChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="font-bold text-gray-700">Work</span>
                              </label>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-[#2563EB] text-white px-8 py-3 font-bold rounded-sm hover:opacity-90 transition-opacity uppercase text-[14px]">
                              Save Address
                            </button>
                            <button type="button" onClick={() => setIsAddingAddress(false)} className="text-gray-600 px-8 py-3 font-bold rounded-sm hover:bg-gray-200 transition-colors uppercase text-[14px]">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </FadeUp>
                )}

                {activeTab === 'builds' && (
                  <FadeUp>
                    <div className="mb-6 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Your Builds</h2>
                    </div>

                    {Object.keys(draftBuild).length > 0 && (
                      <div className="mb-8">
                        <div className="bg-[#F0F6FF] border border-[#0047AB]/20 p-5 rounded-md shadow-sm mb-4">
                          <h3 className="font-bold text-[#0047AB] text-lg mb-2">Your Active Draft Build</h3>
                          <p className="text-sm text-[#565959] mb-4">You have {Object.keys(draftBuild).length} component(s) saved in your active draft. Complete the build in the PC Builder!</p>
                          
                          <div className="flex gap-2 overflow-hidden items-center py-3 border-y border-[#0047AB]/10 mb-4">
                            {Object.entries(draftBuild).map(([type, product], idx) => (
                              <div key={idx} className="w-12 h-12 bg-white flex items-center justify-center rounded-sm shrink-0 border border-gray-200" title={product.name}>
                                {product.image || product.images?.[0]?.url ? (
                                  <img src={product.image || product.images?.[0]?.url} alt={type} className="w-10 h-10 object-contain mix-blend-multiply" />
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">{type.substring(0,3)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-2">
                            <button 
                              onClick={() => {
                                const components = Object.entries(draftBuild).map(([type, product]) => ({ type, product }));
                                setSelectedBuildPopup({
                                  name: "Active Draft Build",
                                  components,
                                  createdAt: new Date().toISOString()
                                });
                              }}
                              className="bg-white text-[var(--color-primary)] border border-[var(--color-primary)] font-bold py-2 px-6 rounded-sm transition-colors hover:bg-[#F0F6FF] text-sm"
                            >
                              View Build
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmation({ show: true, buildId: null, isDraft: true })}
                              className="text-red-500 border border-red-500 font-bold p-2 rounded-sm transition-colors hover:bg-red-50"
                              title="Delete Draft Build"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {builds.length === 0 && Object.keys(draftBuild).length === 0 ? (
                      <div className="bg-[#F8FAFC] border border-gray-200 p-12 rounded-sm flex flex-col items-center justify-center text-center">
                        <DesktopWindowsOutlinedIcon sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No custom builds yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md">You haven't saved any PC configurations. Head over to our PC Builder to design your dream machine.</p>
                        <button 
                          onClick={() => navigate('/builder')}
                          className="bg-[#0052FF] text-white font-bold py-3 px-8 rounded-sm hover:opacity-90 transition-opacity uppercase"
                        >
                          Start Building
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {builds.map((build) => {
                          const buildPrice = build.components?.reduce((sum, comp) => sum + (comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0), 0) || 0;
                          const isAdded = cartItems?.some(item => item.id === build._id);
                          return (
                            <div key={build._id} className="border border-gray-200 p-4 rounded-md shadow-sm bg-white hover:border-gray-300 transition-colors cursor-pointer group flex flex-col relative" onClick={() => setSelectedBuildPopup(build)}>
                              {isAdded && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-md rounded-tr-md">
                                  ADDED IN CART
                                </div>
                              )}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors">{build.name}</h3>
                                  <div className="text-xs text-gray-500 mt-1">{build.components?.length || 0} Components • {new Date(build.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-[#0F172A] text-lg">₹{buildPrice.toLocaleString()}</div>
                                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mt-1 inline-block ${build.compatibility?.status === 'compatible' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {build.compatibility?.status || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 overflow-hidden items-center py-2 border-t border-gray-100">
                                {build.components?.slice(0, 5).map((comp, idx) => (
                                  <div key={idx} className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-sm shrink-0 border border-gray-100">
                                      {comp.product?.image || comp.product?.images?.[0]?.url ? (
                                        <img src={comp.product.image || comp.product.images?.[0]?.url} alt={getTypeName(comp.type)} className="w-8 h-8 object-contain mix-blend-multiply" />
                                      ) : (
                                      <span className="text-[8px] text-gray-400 font-bold uppercase">{getTypeName(comp.type).substring(0,3)}</span>
                                    )}
                                  </div>
                                ))}
                                {(build.components?.length || 0) > 5 && (
                                  <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-sm shrink-0 border border-gray-100">
                                    <span className="text-xs font-bold text-gray-500">+{build.components.length - 5}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ show: true, buildId: build._id, isDraft: false }); }}
                                  className="text-red-500 p-1.5 rounded-sm hover:bg-red-50 transition-colors"
                                  title="Delete Build"
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </button>
                                <span className="text-[var(--color-primary)] font-bold text-[13px] group-hover:underline">View Build &rarr;</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </FadeUp>
                )}

                {activeTab === 'orders' && (
                  <FadeUp>
                    <Orders embedded={true} />
                  </FadeUp>
                )}

                {activeTab === 'coupons' && (
                  <FadeUp>
                    <div className="mb-6 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Available Coupons</h2>
                    </div>
                    {coupons.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <ConfirmationNumberOutlinedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                        <h3 className="text-lg font-bold text-gray-700">No Coupons Available</h3>
                        <p className="text-gray-500 mt-2">There are currently no active coupons available.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coupons.map((coupon) => (
                          <div key={coupon._id} className="border border-blue-100 bg-[#F8FAFC] rounded-lg p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rotate-45 transform translate-x-8 -translate-y-8 group-hover:bg-blue-600 transition-colors"></div>
                            <ConfirmationNumberOutlinedIcon className="absolute top-2 right-2 text-white z-10 w-4 h-4" />
                            
                            <h3 className="text-lg font-black text-gray-900 mb-1">{coupon.name}</h3>
                            <p className="text-sm text-gray-600 mb-4 h-10">{coupon.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center bg-white border border-dashed border-gray-300 rounded px-3 py-1.5 cursor-copy group/code" onClick={() => { navigator.clipboard.writeText(coupon.code); setCopiedCode(coupon.code); setTimeout(() => setCopiedCode(''), 2000); }}>
                                <span className="font-mono font-bold tracking-wider cursor-pointer text-blue-700">{coupon.code}</span>
                                {copiedCode === coupon.code ? (
                                  <span className="text-[10px] text-green-600 font-bold ml-2">COPIED</span>
                                ) : (
                                  <ContentCopyIcon sx={{ fontSize: 14 }} className="text-gray-400 ml-2 cursor-pointer group-hover/code:text-blue-500" />
                                )}
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] font-bold text-gray-500 uppercase">Discount</span>
                                <span className="font-black text-blue-600 text-lg">
                                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FadeUp>
                )}

              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Build Details Modal */}
      <AnimatePresence>
        {selectedBuildPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBuildPopup(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-[600px] w-full flex flex-col rounded-lg shadow-2xl relative max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedBuildPopup.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">{selectedBuildPopup.components?.length || 0} Components</div>
                </div>
                <button 
                  onClick={() => setSelectedBuildPopup(null)}
                  className="text-gray-400 hover:text-gray-800 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                {selectedBuildPopup.components?.map((comp, idx) => (
                    <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-md bg-white hover:border-blue-200 transition-colors">
                      <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-sm shrink-0 border border-gray-50">
                        {comp.product?.image || comp.product?.images?.[0]?.url ? (
                          <img src={comp.product.image || comp.product.images?.[0]?.url} alt={getTypeName(comp.type)} className="w-12 h-12 object-contain mix-blend-multiply" />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{getTypeName(comp.type).substring(0, 3)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{getTypeName(comp.type)}</div>
                      <div className="text-sm font-bold text-gray-900 truncate">{comp.product?.title || comp.product?.name || 'Unknown Component'}</div>
                      <div className="text-xs text-gray-500 mt-1">{getTypeName(comp.product?.brand) || 'Generic'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900">₹{(comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase mb-1">Total Build Price</div>
                  <div className="text-2xl font-black text-[#2563EB]">
                    ₹{(selectedBuildPopup.components?.reduce((sum, comp) => sum + (comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0), 0) || 0).toLocaleString()}
                  </div>
                </div>
                {selectedBuildPopup._id ? (
                  <button 
                    onClick={() => handleAddBuildToCart(selectedBuildPopup)}
                    className="px-8 py-3 font-bold transition-colors uppercase shadow-md rounded-sm w-full sm:w-auto bg-[#2563EB] text-white hover:bg-blue-700"
                  >
                    Add Build to Cart
                  </button>
                ) : (
                  <button 
                    onClick={() => { setSelectedBuildPopup(null); navigate('/builder'); }}
                    className="px-8 py-3 font-bold transition-colors uppercase shadow-md rounded-sm w-full sm:w-auto bg-[#0047AB] text-white hover:bg-blue-800"
                  >
                    Complete in Builder
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Toast Notification */}
      <AnimatePresence>
        {showCartToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-[#0F172A] border border-gray-700 text-white px-6 py-4 rounded-sm shadow-2xl z-[150] font-bold flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            Build successfully added to your cart!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmation({ show: false, buildId: null, isDraft: false })}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-sm w-full p-6 rounded-lg shadow-2xl relative text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DeleteOutlineIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Build</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this build? This action cannot be undone.</p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteConfirmation({ show: false, buildId: null, isDraft: false })}
                  className="px-6 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteBuildConfirm}
                  className="px-6 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-sm transition-colors flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Profile;
