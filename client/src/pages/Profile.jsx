import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { clearToken } from '../shared/auth/token';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import FadeUp from '../components/FadeUp';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import Orders from './Orders';
import Pagination from '../components/Pagination';
import { useToast } from '../components/toast/useToast';

const ITEMS_PER_PAGE = 5;
const COUPONS_PER_PAGE = 6;

const getTypeName = (type) => {
  if (typeof type === 'string') return type;
  if (type && type.name) return type.name;
  return 'UNKNOWN';
};

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (!pwd) return { strength: 0, label: '', color: '', textColor: '' };
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  const levels = [
    { strength: 0, label: 'Too weak', color: 'bg-red-500', textColor: 'text-red-500' },
    { strength: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' },
    { strength: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' },
    { strength: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { strength: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
  ];
  return levels[score];
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      i <= (rating || 0) ? (
        <StarRateRoundedIcon key={i} sx={{ fontSize: 16, color: '#f59e0b' }} />
      ) : (
        <StarOutlineRoundedIcon key={i} sx={{ fontSize: 16, color: '#cbd5e1' }} />
      )
    ))}
  </div>
);

const navLinkClass = (active) =>
  `w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors mb-0.5 ${
    active
      ? 'bg-sidebar-active text-sidebar-text-active'
      : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
  }`;

const SidebarGroup = ({ icon, label, open, onToggle, children }) => (
  <div className="border-b border-sidebar-divider">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-sidebar-hover"
      style={{ color: 'var(--color-sidebar-text)', borderRadius: 'var(--radius-sm)' }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <ExpandMoreIcon
        sx={{
          fontSize: 18,
          color: 'var(--color-sidebar-text)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        className="shrink-0"
      />
    </button>
    <div className={`flex flex-col pb-2 ${open ? '' : 'hidden'}`}>{children}</div>
  </div>
);

const Profile = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewsPage, setReviewsPage] = useState(1);
  const [buildsPage, setBuildsPage] = useState(1);
  const [couponsPage, setCouponsPage] = useState(1);
  const [buildsTotalPages, setBuildsTotalPages] = useState(1);
  const [couponsTotalPages, setCouponsTotalPages] = useState(1);

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

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['myReviews', { page: reviewsPage }],
    queryFn: async () => {
      const { data } = await apiClient.get('/reviews/me', { params: { page: reviewsPage, limit: ITEMS_PER_PAGE } });
      return {
        docs: data.data?.docs || data.data?.reviews || [],
        totalPages: data.data?.totalPages || 1,
      };
    },
    enabled: isLoggedIn,
    retry: false
  });
  const reviewsList = reviewsData?.docs || [];
  const reviewsTotalPages = reviewsData?.totalPages || 1;

  const userData = profileData?.data || user || {};
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const email = userData.email || '';
  const mobile = userData.phone || userData.mobile || '';
  const phoneDigits = (p = '') => p.replace(/[^0-9]/g, '').replace(/^91/, '');
  const formatPhone = (p = '') => {
    const digits = phoneDigits(p);
    return digits ? `+91 ${digits}` : '';
  };

const [isEditing, setIsEditing] = useState(false);
const [openFaq, setOpenFaq] = useState(0);
const [sidebarGroups, setSidebarGroups] = useState({ account: true, stuff: true, support: true });

const toggleSidebarGroup = (key) => setSidebarGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const [personalInfoForm, setPersonalInfoForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: ''
  });

  const isChangingContact =
    isEditing &&
    (personalInfoForm.email !== email || phoneDigits(personalInfoForm.phone) !== phoneDigits(mobile));

  useEffect(() => {
    if (userData) {
      setPersonalInfoForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: formatPhone(userData.phone || userData.mobile || ''),
        currentPassword: ''
      });
    }
  }, [profileData, user]);

const handleSavePersonalInfo = async () => {
  if (!personalInfoForm.firstName.trim() || !personalInfoForm.lastName.trim()) {
    toast('First and last name are required.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfoForm.email)) {
    toast('Please enter a valid email address.', 'error');
    return;
  }
  if (personalInfoForm.phone && !/^\d{10}$/.test(phoneDigits(personalInfoForm.phone))) {
    toast('Mobile number must be 10 digits.', 'error');
    return;
  }
  try {
    const payload = { ...personalInfoForm };
    if (payload.phone) {
      payload.phone = `+91${phoneDigits(payload.phone)}`;
    }
    if (!isChangingContact) {
      delete payload.currentPassword;
    }
    await apiClient.put('/auth/profile', payload);
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast('Profile updated successfully');
  } catch (error) {
    console.error('Failed to update profile', error);
    toast(error.response?.data?.message || 'Failed to update profile', 'error');
  }
};

const handleCancelEdit = () => {
  setIsEditing(false);
  setPersonalInfoForm({ firstName, lastName, email, phone: formatPhone(mobile), currentPassword: '' });
};

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }
    if (!passwordForm.currentPassword) {
      toast('Current password is required.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }
    setIsSavingPassword(true);
    try {
      await apiClient.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast('Password updated successfully!');
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast(error.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
      setReviewsPage(1);
      setBuildsPage(1);
      setCouponsPage(1);
    }
  }, [tabParam]);

  const switchTab = (tab) => {
    navigate(`/profile?tab=${tab}`);
  };

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
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();
  
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
      toast('Failed to load addresses', 'error');
    }
  };

  const fetchBuilds = async (page = 1) => {
    try {
      const { data } = await apiClient.get('/builds', { params: { page, limit: ITEMS_PER_PAGE } });
      if (data.success) {
        setBuilds(data.data?.docs || data.data?.builds || []);
        setBuildsTotalPages(data.data?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch builds', error);
      toast('Failed to load builds', 'error');
    }
  };

  const fetchCoupons = async (page = 1) => {
    try {
      const { data } = await apiClient.get('/coupons/active', { params: { page, limit: COUPONS_PER_PAGE } });
      if (data.success && data.data && data.data.coupons) {
        setCoupons(data.data.coupons);
        setCouponsTotalPages(data.data?.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch coupons', error);
      toast('Failed to load coupons', 'error');
    }
  };

  const handleDeleteBuildConfirm = async () => {
    try {
      if (deleteConfirmation.isDraft) {
        localStorage.removeItem('draftBuild');
        setDraftBuild({});
      } else {
        await apiClient.delete(`/builds/${deleteConfirmation.buildId}`);
        fetchBuilds(buildsPage);
      }
      setDeleteConfirmation({ show: false, buildId: null, isDraft: false });
      toast('Build deleted successfully');
    } catch (error) {
      console.error('Failed to delete build', error);
      toast('Failed to delete build', 'error');
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      await apiClient.post('/auth/deactivate');
      clearToken();
      localStorage.removeItem('rigcraft_auth');
      localStorage.removeItem('rigcraft_user');
      localStorage.removeItem('admin-auth-storage');
      localStorage.removeItem('rigcraft_cart_guest');
      localStorage.removeItem('rigcraft_wishlist_guest');
      sessionStorage.setItem(
        'rigcraft_pending_toast',
        JSON.stringify({ message: 'Account deactivated.', type: 'success' })
      );
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to deactivate account', error);
      setIsDeactivating(false);
      setShowDeactivateModal(false);
      toast('Failed to deactivate account', 'error');
    }
  };

  const handleAddBuildToCart = (build) => {
    const parseNum = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      const numericStr = String(val).replace(/[^0-9.]/g, '');
      return parseFloat(numericStr) || 0;
    };
    
    const buildPrice = build.components?.reduce((sum, comp) => {
      const p = comp.product;
      const itemPrice = parseNum(p?.priceVal) || parseNum(p?.salePrice) || parseNum(p?.price) || 0;
      return sum + (itemPrice * (comp.quantity || 1));
    }, 0) || 0;
    
    addToCart({
      id: build._id,
      type: 'custom-build',
      title: build.name,
      image: build.components?.[0]?.product?.image || 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=200',
      priceVal: buildPrice,
      price: `₹${buildPrice.toLocaleString()}`,
      components: build.components
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses();
      fetchBuilds(buildsPage);
      fetchCoupons(couponsPage);
    }
  }, [isLoggedIn, buildsPage, couponsPage]);

  const handleReviewsPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > reviewsTotalPages) return;
    setReviewsPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildsPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > buildsTotalPages) return;
    setBuildsPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCouponsPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > couponsTotalPages) return;
    setCouponsPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('firstName', firstName || '');
    formData.append('lastName', lastName || '');
    formData.append('email', email || '');
    formData.append('phone', `+91${phoneDigits(mobile)}`);
    try {
      await apiClient.put('/auth/profile', formData);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast('Profile photo updated successfully');
    } catch (error) {
      console.error('Failed to update avatar', error);
      toast('Failed to update profile photo', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
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
    if (!/^\d{10}$/.test(phoneDigits(addressForm.phone))) {
      toast('Mobile number must be 10 digits.', 'error');
      return;
    }
    if (addressForm.alternatePhone && !/^\d{10}$/.test(phoneDigits(addressForm.alternatePhone))) {
      toast('Alternate mobile number must be 10 digits.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(addressForm.postalCode)) {
      toast('Pincode must be 6 digits.', 'error');
      return;
    }
    const payload = { ...addressForm };
    if (payload.phone) payload.phone = `+91${phoneDigits(payload.phone)}`;
    if (payload.alternatePhone) payload.alternatePhone = `+91${phoneDigits(payload.alternatePhone)}`;
    try {
      if (editingAddressId) {
        await apiClient.put(`/addresses/${editingAddressId}`, payload);
      } else {
        await apiClient.post('/addresses', payload);
      }
      fetchAddresses();
      setIsAddingAddress(false);
      setEditingAddressId(null);
      toast('Address saved successfully');
    } catch (error) {
      console.error('Failed to save address', error);
      toast('Failed to save address', 'error');
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      ...address,
      phone: formatPhone(address.phone),
      alternatePhone: address.alternatePhone ? formatPhone(address.alternatePhone) : ''
    });
    setEditingAddressId(address._id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await apiClient.delete(`/addresses/${id}`);
      fetchAddresses();
      toast('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address', error);
      toast('Failed to delete address', 'error');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <section className="w-full py-8 min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:w-1/4 flex flex-col gap-4">
              
                {/* Profile Header Box */}
                <div className="bg-sidebar p-4 shadow-sm flex items-center gap-4 rounded-sm" style={{ border: '1px solid var(--color-sidebar-divider)' }}>
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-white font-bold text-lg uppercase overflow-hidden">
                      {userData?.avatar?.url ? (
                        <img src={userData.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(firstName[0] || 'U')}{(lastName[0] || '')}</span>
                      )}
                    </div>
                    <label
                      title="Change profile photo"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                    >
                      <PhotoCameraIcon sx={{ fontSize: 14 }} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-sidebar-text)' }}>Hello,</div>
                    <div className="text-[16px] font-black leading-tight truncate" style={{ color: 'var(--color-sidebar-text-active)' }}>
                      {firstName} {lastName}
                    </div>
                    <div className="text-[12px] truncate" style={{ color: 'var(--color-sidebar-text)' }}>{email || '—'}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-sidebar-text)' }}>
                        Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Aug 2026'}
                      </span>
                    </div>
                  </div>
                </div>

              {/* Navigation Box */}
              <div className="bg-sidebar shadow-sm flex flex-col overflow-hidden rounded-sm" style={{ border: '1px solid var(--color-sidebar-divider)' }}>

                {/* Account Settings */}
                <SidebarGroup
                  icon={<PersonOutlineOutlinedIcon fontSize="small" sx={{ color: 'var(--color-sidebar-text)' }} />}
                  label="Account Settings"
                  open={sidebarGroups.account}
                  onToggle={() => toggleSidebarGroup('account')}
                >
                  <div
                    className={`${navLinkClass(activeTab === 'profile')} pl-9`}
                    onClick={() => switchTab('profile')}
                  >
                    Profile Information
                  </div>
                  <div
                    className={`${navLinkClass(activeTab === 'addresses')} pl-9`}
                    onClick={() => { switchTab('addresses'); setIsAddingAddress(false); }}
                  >
                    Manage Addresses
                  </div>
                </SidebarGroup>

                {/* My Stuff */}
                <SidebarGroup
                  icon={<FavoriteBorderIcon fontSize="small" sx={{ color: 'var(--color-sidebar-text)' }} />}
                  label="My Stuff"
                  open={sidebarGroups.stuff}
                  onToggle={() => toggleSidebarGroup('stuff')}
                >
                  <div
                    className={`${navLinkClass(activeTab === 'orders')} pl-9`}
                    onClick={() => switchTab('orders')}
                  >
                    Track Order
                  </div>
                  <div
                    className={`${navLinkClass(false)} pl-9`}
                    onClick={() => navigate('/wishlist')}
                  >
                    My Wishlist
                  </div>
                  <div
                    className={`${navLinkClass(activeTab === 'coupons')} pl-9`}
                    onClick={() => switchTab('coupons')}
                  >
                    Coupons
                  </div>
                  <div
                    className={`${navLinkClass(activeTab === 'builds')} pl-9`}
                    onClick={() => switchTab('builds')}
                  >
                    Your Builds
                  </div>
                  <div
                    className={`${navLinkClass(activeTab === 'reviews')} pl-9`}
                    onClick={() => switchTab('reviews')}
                  >
                    My Reviews
                  </div>
                </SidebarGroup>

                {/* Support */}
                <SidebarGroup
                  icon={<SupportAgentIcon fontSize="small" sx={{ color: 'var(--color-sidebar-text)' }} />}
                  label="Support"
                  open={sidebarGroups.support}
                  onToggle={() => toggleSidebarGroup('support')}
                >
                  <div
                    className={`${navLinkClass(false)} pl-9`}
                    onClick={() => navigate('/my-tickets')}
                  >
                    My Support Tickets
                  </div>
                  <div
                    className={`${navLinkClass(false)} pl-9`}
                    onClick={() => navigate('/help')}
                  >
                    Help Center
                  </div>
                </SidebarGroup>

                {/* Logout */}
                <div className="border-t border-sidebar-divider p-2">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{ borderRadius: 'var(--radius-sm)', color: 'var(--color-sidebar-text)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-sidebar-text)'; }}
                  >
                    <LogoutOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} />
                    <span className="flex-1 text-left">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="lg:w-2/3">
              <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-sm">
{activeTab === 'profile' && (
                  <FadeUp>
                    {/* Personal Information */}
                    <div className="mb-8">
                      <div className="w-full">
                        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                              <p className="text-[13px] text-gray-500 mt-1">Manage your account name, email and mobile number.</p>
                            </div>
                            {!isEditing ? (
                              <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white text-[13px] font-bold rounded-sm hover:opacity-90 transition-opacity uppercase"
                              >
                                Edit Profile
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSavePersonalInfo}
                                  className="px-4 py-2 bg-green-600 text-white text-[13px] font-bold rounded-sm hover:bg-green-700 transition-colors uppercase"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 text-[13px] font-bold rounded-sm hover:bg-gray-300 transition-colors uppercase"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">First Name</label>
                              <input
                                type="text"
                                value={isEditing ? personalInfoForm.firstName : firstName}
                                onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, firstName: e.target.value.replace(/[^A-Za-z\s'-]/g, '').slice(0, 50) })}
                                readOnly={!isEditing}
                                className={`w-full ${isEditing ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`}
                                placeholder="First Name"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Last Name</label>
                              <input
                                type="text"
                                value={isEditing ? personalInfoForm.lastName : lastName}
                                onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, lastName: e.target.value.replace(/[^A-Za-z\s'-]/g, '').slice(0, 50) })}
                                readOnly={!isEditing}
                                className={`w-full ${isEditing ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`}
                                placeholder="Last Name"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={isEditing ? personalInfoForm.email : email}
                                  onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, email: e.target.value })}
                                  readOnly={!isEditing}
                                  className={`w-full ${isEditing ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`}
                                  placeholder="Email Address"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mobile Number</label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  inputMode="numeric"
                                  value={isEditing ? personalInfoForm.phone : formatPhone(mobile)}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '').replace(/^91/, '').slice(0, 10);
                                    setPersonalInfoForm({ ...personalInfoForm, phone: digits ? `+91 ${digits}` : '' });
                                  }}
                                  readOnly={!isEditing}
                                  className={`w-full ${isEditing ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-200'} border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium`}
                                  placeholder="Enter mobile number"
                                />
                              </div>
                            </div>
                          </div>
                          {isChangingContact && (
                            <div className="mt-5">
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Current Password</label>
                              <input
                                type="password"
                                value={personalInfoForm.currentPassword}
                                onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, currentPassword: e.target.value })}
                                className="w-full bg-white border-blue-500 border text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium"
                                placeholder="Enter current password"
                              />
                              <p className="text-[12px] text-gray-400 mt-1">Required to change your email or phone number.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200 mb-8" />

                    {/* Security Settings */}
                    <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-[16px] font-bold text-gray-800">Password</h3>
                          <p className="text-gray-500 text-[14px] mt-1">••••••••••••</p>
                          {userData?.passwordChangedAt && (
                            <p className="text-gray-400 text-[12px] mt-0.5">
                              Last changed {new Date(userData.passwordChangedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setPasswordOpen(true)}
                          className="px-4 py-2 bg-[var(--color-primary)] text-white text-[13px] font-bold rounded-sm hover:opacity-90 transition-opacity uppercase"
                        >
                          Change Password
                        </button>
                      </div>

                      <div className="border border-red-100 bg-red-50 p-4 rounded-sm">
                        <h3 className="text-[16px] font-bold text-red-600 mb-4">Danger Zone</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">Deactivate Account</p>
                            <p className="text-gray-500 text-[13px]">This action cannot be undone.</p>
                          </div>
                          <button
                            onClick={() => setShowDeactivateModal(true)}
                            className="px-4 py-2 bg-red-500 text-white text-[13px] font-bold rounded-sm hover:bg-red-600 transition-colors uppercase"
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200 mb-8" />

                    {/* FAQs */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">FAQs</h2>
                      <div className="divide-y divide-gray-100 border border-gray-100 rounded-sm overflow-hidden">
                        {[
                          {
                            q: 'What happens when I update my email address (or mobile number)?',
                            a: 'Your login identity will be updated to the new email address (or mobile number). You will need to use the updated credentials for future logins and order tracking.'
                          },
                          {
                            q: 'Does my RigCraft account get deactivated if I change my email?',
                            a: 'No, account data remains persistent. All configurations, order history, and saved compatibility alerts will be transferred to your new primary identifier instantly.'
                          },
                          {
                            q: 'Why do I need to verify my account?',
                            a: 'Verification ensures that hardware warranty claims and high-value orders are securely linked to your identity, preventing unauthorized engineering configuration changes.'
                          },
                        ].map((faq, i) => (
                          <div key={i} className="bg-white">
                            <button
                              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                              className="w-full flex items-center justify-between gap-4 py-4 px-4 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-bold text-gray-800 text-[14px]">{faq.q}</span>
                              <ExpandMoreIcon
                                sx={{ fontSize: 20, color: 'var(--color-primary)' }}
                                className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {openFaq === i && (
                              <p className="text-gray-600 text-[13px] leading-relaxed px-4 pb-4">{faq.a}</p>
                            )}
                          </div>
                        ))}
                      </div>
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
                                <span className="font-bold text-gray-900">{formatPhone(addr.phone)}</span>
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
                      <div className="bg-[var(--color-surface)] p-6 border border-gray-200 rounded-sm">
                        <h3 className="font-bold text-[var(--color-primary)] uppercase text-[14px] mb-6">{editingAddressId ? 'Edit Address' : 'Add a new address'}</h3>
                        <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" name="fullName" value={addressForm.fullName} onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z\s'-]/g, '').slice(0, 50);
                            handleAddressChange({ target: { name: 'fullName', value: val } });
                          }} placeholder="Name" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="tel" name="phone" inputMode="numeric" value={addressForm.phone} onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '').replace(/^91/, '').slice(0, 10);
                            handleAddressChange({ target: { name: 'phone', value: digits ? `+91 ${digits}` : '' } });
                          }} placeholder="10-digit mobile number" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="tel" name="alternatePhone" inputMode="numeric" value={addressForm.alternatePhone} onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, '').replace(/^91/, '').slice(0, 10);
                            handleAddressChange({ target: { name: 'alternatePhone', value: digits ? `+91 ${digits}` : '' } });
                          }} placeholder="Alternate mobile number (Optional)" className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="text" name="postalCode" value={addressForm.postalCode} onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            handleAddressChange({ target: { name: 'postalCode', value: val } });
                          }} placeholder="Pincode" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <input type="text" name="city" value={addressForm.city} onChange={(e) => {
                            const val = e.target.value.replace(/[^A-Za-z\s'-]/g, '').slice(0, 50);
                            handleAddressChange({ target: { name: 'city', value: val } });
                          }} placeholder="City/District/Town" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          <select name="state" value={addressForm.state} onChange={handleAddressChange} required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium">
                            <option value="" disabled>Select State</option>
                            {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input type="text" name="country" value="India" readOnly className="w-full bg-gray-100 text-gray-500 border border-gray-300 px-4 py-3 focus:outline-none rounded-sm font-medium" />
                          <div className="md:col-span-2">
                            <input type="text" name="addressLine1" value={addressForm.addressLine1} onChange={(e) => {
                              const val = e.target.value.replace(/[^A-Za-z0-9\s,.#\-']/g, '').slice(0, 120);
                              handleAddressChange({ target: { name: 'addressLine1', value: val } });
                            }} placeholder="Address (House No, Building, Street, Area)" required className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" name="landmark" value={addressForm.landmark} onChange={(e) => {
                              const val = e.target.value.replace(/[^A-Za-z0-9\s,.#\-']/g, '').slice(0, 60);
                              handleAddressChange({ target: { name: 'landmark', value: val } });
                            }} placeholder="Landmark (Optional)" className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 rounded-sm font-medium placeholder-gray-500" />
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
                            <button type="submit" className="bg-[var(--color-primary)] text-white px-8 py-3 font-bold rounded-sm hover:opacity-90 transition-opacity uppercase text-[14px]">
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
                      <div className="bg-[var(--color-surface)] border border-gray-200 p-12 rounded-sm flex flex-col items-center justify-center text-center">
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
                      <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {builds.map((build) => {
                          const buildPrice = build.totalPrice || build.totalSalePrice || build.components?.reduce((sum, comp) => sum + (comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0), 0) || 0;
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
                                  <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{build.name}</h3>
                                  <div className="text-xs text-gray-500 mt-1">{build.components?.length || 0} Components • {new Date(build.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-[var(--color-text)] text-lg">₹{buildPrice.toLocaleString()}</div>
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
                      <Pagination
                        page={buildsPage}
                        totalPages={buildsTotalPages}
                        onPageChange={handleBuildsPageChange}
                      />
                      </>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coupons.map((coupon) => (
                          <div key={coupon._id} className="border border-blue-100 bg-[var(--color-surface)] rounded-lg p-4 shadow-sm relative overflow-hidden group flex flex-col">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500 rotate-45 transform translate-x-6 -translate-y-6 group-hover:bg-blue-600 transition-colors"></div>
                            <ConfirmationNumberOutlinedIcon className="absolute top-1.5 right-1.5 text-white z-10 w-3.5 h-3.5" />
                            
                            <h3 className="text-[15px] font-black text-gray-900 mb-1 pr-4 truncate">{coupon.name}</h3>
                            <p className="text-[12px] text-gray-600 mb-3 h-8 overflow-hidden leading-snug">{coupon.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center bg-white border border-dashed border-gray-300 rounded px-2.5 py-1 cursor-copy group/code" onClick={() => { navigator.clipboard.writeText(coupon.code); setCopiedCode(coupon.code); setTimeout(() => setCopiedCode(''), 2000); }}>
                                <span className="font-mono font-bold tracking-wider cursor-pointer text-[13px] text-blue-700">{coupon.code}</span>
                                {copiedCode === coupon.code ? (
                                  <span className="text-[10px] text-green-600 font-bold ml-1.5">COPIED</span>
                                ) : (
                                  <ContentCopyIcon sx={{ fontSize: 13 }} className="text-gray-400 ml-1.5 cursor-pointer group-hover/code:text-blue-500" />
                                )}
                              </div>
                              <div className="text-right">
                                <span className="block text-[9px] font-bold text-gray-500 uppercase">Discount</span>
                                <span className="font-black text-blue-600 text-[15px]">
                                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination
                      page={couponsPage}
                      totalPages={couponsTotalPages}
                      onPageChange={handleCouponsPageChange}
                    />
                  </FadeUp>
                )}

                {activeTab === 'reviews' && (
                  <FadeUp>
                    <div className="mb-6 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
                    </div>
                    {reviewsLoading ? (
                      <div className="text-center py-12 text-gray-400">Loading reviews...</div>
                    ) : (reviewsList || []).length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <StarOutlineRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                        <h3 className="text-lg font-bold text-gray-700">No Reviews Yet</h3>
                        <p className="text-gray-500 mt-2 mb-6">You haven't reviewed any products yet.</p>
                        <button
                          onClick={() => navigate('/')}
                          className="bg-[var(--color-primary)] text-white font-bold py-2.5 px-6 rounded-sm hover:opacity-90 transition-opacity uppercase text-[13px]"
                        >
                          Browse Products
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {(reviewsList || []).map((review) => (
                          <div key={review._id} className="border border-gray-200 p-5 rounded-sm bg-white hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <StarRating rating={review.rating} />
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${review.status === 'approved' ? 'bg-green-100 text-green-700' : review.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                    {review.status || 'pending'}
                                  </span>
                                </div>
                                <div className="text-[13px] font-bold text-gray-900 truncate">
                                  {review.item?.name || review.item?.title || 'Product review'}
                                </div>
                              </div>
                              <span className="text-[11px] text-gray-400 shrink-0">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            {review.title && (
                              <h4 className="font-bold text-gray-800 text-[14px] mb-1">{review.title}</h4>
                            )}
                            <p className="text-gray-600 text-[13px] leading-relaxed">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Pagination
                      page={reviewsPage}
                      totalPages={reviewsTotalPages}
                      onPageChange={handleReviewsPageChange}
                    />
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
              className="bg-white max-w-[600px] w-full flex flex-col shadow-2xl relative max-h-[90vh] overflow-hidden"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
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
                  <div className="text-2xl font-black text-[var(--color-primary)]">
                    ₹{(selectedBuildPopup.components?.reduce((sum, comp) => sum + (comp.product?.priceVal || comp.product?.price || comp.product?.salePrice || 0), 0) || 0).toLocaleString()}
                  </div>
                </div>
                {selectedBuildPopup._id ? (
                  <button 
                    onClick={() => handleAddBuildToCart(selectedBuildPopup)}
                    className="px-8 py-3 font-bold transition-colors uppercase shadow-md rounded-sm w-full sm:w-auto bg-[var(--color-primary)] text-white hover:bg-blue-700"
                  >
                    Add Build to Cart
                  </button>
                ) : (
                  <button 
                    onClick={() => { setSelectedBuildPopup(null); navigate('/builder', { state: { draftBuild } }); }}
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
              className="bg-white max-w-sm w-full p-6 shadow-2xl relative text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
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

      {/* Change Password Modal */}
      <AnimatePresence>
        {passwordOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPasswordOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-sm w-full p-6 shadow-2xl relative"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                <button onClick={() => setPasswordOpen(false)} className="text-gray-400 hover:text-gray-800">
                  <CloseIcon />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full border border-gray-200 text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border border-gray-200 text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium"
                />
                {passwordForm.newPassword && (
                  <div>
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1.5 flex-1 rounded-full ${bar <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border border-gray-200 text-gray-700 px-4 py-3 focus:outline-none rounded-sm font-medium"
                />
                {passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <span className="text-xs font-bold text-red-500">Passwords do not match</span>
                )}
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setPasswordOpen(false)}
                  className="px-6 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword}
                  className="px-6 py-2.5 font-bold text-white bg-[var(--color-primary)] hover:opacity-90 rounded-sm transition-colors disabled:opacity-50"
                >
                  {isSavingPassword ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Deactivate Account Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeactivating && setShowDeactivateModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-sm w-full p-6 shadow-2xl relative text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DeleteOutlineIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deactivate Account</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to deactivate your account? This action cannot be undone and your account can only be restored by an administrator.</p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={isDeactivating}
                  className="px-6 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeactivateAccount}
                  disabled={isDeactivating}
                  className="px-6 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-sm transition-colors flex-1 disabled:opacity-50"
                >
                  {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-sm w-full p-6 shadow-2xl relative text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogoutOutlinedIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to log out of your account?</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowLogoutModal(false); handleLogout(); }}
                  className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors flex-1"
                >
                  Logout
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
