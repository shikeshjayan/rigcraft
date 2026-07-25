import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import FadeUp from '../components/FadeUp';

const Profile = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
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
  const mobile = userData.phone || userData.mobile || ''; // Assuming phone/mobile

  const [gender, setGender] = useState('Male');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:w-1/4 flex flex-col gap-4">
              
              {/* Profile Header Box */}
              <div className="bg-white p-4 shadow-sm flex items-center gap-4 border border-gray-100" style={{ borderRadius: 'var(--radius-sm)' }}>
                <AccountCircleIcon sx={{ fontSize: 48, color: '#2563EB' }} />
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">Hello,</div>
                  <div className="text-[16px] font-black text-gray-900 leading-tight">
                    {firstName} <br/> {lastName}
                  </div>
                </div>
              </div>

              {/* Navigation Box */}
              <div className="bg-white shadow-sm flex flex-col overflow-hidden border border-gray-100" style={{ borderRadius: 'var(--radius-sm)' }}>
                
                {/* Orders */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group">
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
                  <div className="flex flex-col">
                    <div className="pl-14 pr-4 py-3 bg-[#F0F7FF] text-[#2563EB] font-bold text-[14px] cursor-pointer border-l-4 border-[#2563EB]">
                      Profile Information
                    </div>
                    <div className="pl-14 pr-4 py-3 text-gray-600 font-medium text-[14px] hover:bg-gray-50 hover:text-[#2563EB] cursor-pointer transition-colors border-l-4 border-transparent">
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
                      className="pl-14 pr-4 py-2.5 text-gray-600 font-medium text-[14px] hover:bg-gray-50 hover:text-[#2563EB] cursor-pointer transition-colors"
                      onClick={() => navigate('/wishlist')}
                    >
                      My Wishlist
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
              <div className="bg-white shadow-sm p-8 border border-gray-100" style={{ borderRadius: 'var(--radius-sm)' }}>
                
                {/* Personal Information */}
                <div className="mb-10">
                  <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <button className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mb-4">
                    <div>
                      <div className="text-[12px] text-gray-500 mb-1 ml-1">First Name</div>
                      <input 
                        type="text" 
                        value={firstName} 
                        readOnly 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 focus:outline-none" 
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <div className="text-[12px] text-gray-500 mb-1 ml-1">Last Name</div>
                      <input 
                        type="text" 
                        value={lastName} 
                        readOnly 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 focus:outline-none" 
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm text-gray-500 mb-2 ml-1">Your Gender</div>
                    <div className="flex items-center gap-6 ml-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Male" 
                          checked={gender === 'Male'} 
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 text-sm">Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Female" 
                          checked={gender === 'Female'} 
                          onChange={(e) => setGender(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 text-sm">Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-10">
                  <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Email Address</h2>
                    <button className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="max-w-md">
                    <input 
                      type="email" 
                      value={email} 
                      readOnly 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 focus:outline-none" 
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="mb-12">
                  <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Mobile Number</h2>
                    <button className="text-[14px] font-bold text-blue-600 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="max-w-md">
                    <input 
                      type="text" 
                      value={mobile} 
                      readOnly 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 focus:outline-none" 
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      placeholder="Mobile Number"
                    />
                  </div>
                </div>

                <hr className="border-gray-200 mb-8" />

                {/* FAQs */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">FAQs</h2>
                  
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 text-[14px] mb-2">What happens when I update my email address (or mobile number)?</h4>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      Your login identity will be updated to the new email address (or mobile number). You will need to use the updated credentials for future logins and order tracking.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 text-[14px] mb-2">Does my RigCraft account get deactivated if I change my email?</h4>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      No, account data remains persistent. All configurations, order history, and saved compatibility alerts will be transferred to your new primary identifier instantly.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-gray-800 text-[14px] mb-2">Why do I need to verify my account?</h4>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      Verification ensures that hardware warranty claims and high-value orders are securely linked to your identity, preventing unauthorized engineering configuration changes.
                    </p>
                  </div>

                  <button className="text-[13px] font-bold text-red-500 hover:text-red-600">Deactivate Account</button>
                </div>

              </div>
            </div>
            
          </div>
        </FadeUp>
      </div>
    </div>
  );
};

export default Profile;
