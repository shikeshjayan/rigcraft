import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicSettings } from '../services/settings.service';
import FadeUp from './FadeUp';
import apiClient from '../api/client';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

const Footer = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success'
  const [showPopup, setShowPopup] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: (emailData) => apiClient.post('/newsletter/subscribe', emailData),
    onSuccess: () => {
      setStatus('success');
      setMessage('');
      setEmail('');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setStatus('idle');
      }, 3000);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to subscribe. Please try again later.');
    }
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!user) {
      setStatus('error');
      setMessage('Please login to subscribe to our newsletter.');
      return;
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter an email address.');
      return;
    }
    
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    subscribeMutation.mutate({ email });
  };

  const { data: brandData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 300000,
  });
  const brand = brandData?.general;

  return (
    <footer className="w-full">
      <FadeUp delay={0.2}>
      {/* Newsletter Banner */}
      <div className="w-full py-12" style={{ backgroundColor: 'var(--color-primary, #2563EB)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="text-[24px] md:text-[28px] font-extrabold tracking-wide mb-2">Join the {brand?.storeName || 'RigCraft'} Community</h3>
            <p className="text-[15px] text-blue-100 font-medium">Get early access to drops, exclusive discounts, and hardware news.</p>
          </div>
          <div className="flex flex-col w-full md:w-[450px] lg:w-[500px] max-w-xl relative">
            <form onSubmit={handleSubscribe} className="flex w-full bg-white" style={{ borderRadius: 'var(--radius-sm)' }}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage('');
                  }
                }}
                placeholder="Enter your email" 
                className="px-4 py-3 w-full text-[#111111] focus:outline-none"
                style={{ borderRadius: 'var(--radius-sm, 8px) 0 0 var(--radius-sm, 8px)' }}
              />
              <button 
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 bg-[var(--color-primary)] border border-white text-white font-bold hover:brightness-110 transition-all whitespace-nowrap cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ borderRadius: '0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0' }}
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {/* Validation Message */}
            {message && (
              <div 
                className={`absolute -bottom-6 left-0 text-[12px] font-bold ${status === 'success' ? 'text-green-300' : 'text-red-200'}`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-full pt-16 pb-8" style={{ backgroundColor: '#1A1A1A', color: 'white' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between gap-10 mb-16">
            
            {/* Brand Column */}
            <div className="flex flex-col lg:max-w-[350px]">
              <div className="flex items-center gap-2 mb-6 cursor-default">
                {brand?.logo?.url ? (
                  <img src={brand.logo.url} alt={brand.storeName || 'RigCraft'} className="w-8 h-8 object-contain brightness-0 invert" />
                ) : (
                  <PrecisionManufacturingIcon sx={{ fontSize: 32, color: 'white' }} />
                )}
                <span className="text-[24px] font-black tracking-widest uppercase"><span style={{ color: 'white',fontSize:"24px" }}>{(brand?.storeName || 'RigCraft').slice(0, 3)}</span>{(brand?.storeName || 'RigCraft').slice(3)}</span>
              </div>
              <p className="text-[15px] text-gray-400 leading-relaxed mb-8 font-medium">
                {brand?.description || "India's premier PC building platform. Custom gaming PCs, premium components, and expert support — all in one place."}
              </p>
              <div className="flex items-center gap-4">
                {brandData?.social?.twitter && (
                  <a href={brandData.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><XIcon /></a>
                )}
                {brandData?.social?.linkedin && (
                  <a href={brandData.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><LinkedInIcon /></a>
                )}
                {brandData?.social?.facebook && (
                  <a href={brandData.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FacebookIcon /></a>
                )}
                {brandData?.social?.youtube && (
                  <a href={brandData.social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><YouTubeIcon /></a>
                )}
                {brandData?.social?.instagram && (
                  <a href={brandData.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon /></a>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Products</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/builder" className="block w-full">Custom PC Builder</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/prebuild" className="block w-full">Prebuilt PCs</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/components" className="block w-full">PC Components</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/components/peripherals" className="block w-full">Peripherals</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Support</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/help" className="block w-full">Help Center</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/about" className="block w-full">About RigCraft</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/orders" className="block w-full">Track Order</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/my-tickets" className="block w-full">My Tickets</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/warranty" className="block w-full">Warranty Claims</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/returns" className="block w-full">Returns & Refunds</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/contact" className="block w-full">Contact Support</Link></li>
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/faq" className="block w-full">FAQs</Link></li>
              </ul>
            </div>


            {/* Explore */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Explore</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-white transition-colors"><Link to="/pc-builder-guide" className="block w-full">PC Builder Guide</Link></li>
                {/* <li className="cursor-pointer hover:text-white transition-colors">Best Sellers</li>
                <li className="cursor-pointer hover:text-white transition-colors">New Arrivals</li>
                <li className="cursor-pointer hover:text-white transition-colors">Today's Deals</li> */}
                {user && ['admin', 'manager'].includes(user.role) && (
                  <li className="cursor-pointer hover:text-white transition-colors"><Link to="/admin" className="block w-full">Dashboard</Link></li>
                )}
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 gap-4 text-[13px] text-gray-400 font-medium">
            <div>
              &copy; {new Date().getFullYear()} {brand?.storeName || 'Rig Craft'} Pvt Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

        </div>
      </div>
      </FadeUp>

      {/* Subscription Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}></div>
          <FadeUp>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center border-t-4 border-[var(--color-primary)]">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-wide">Congratulations!</h3>
              <p className="text-[15px] text-gray-600 font-medium leading-relaxed">
                You have successfully subscribed to our newsletter. You will now receive early access to exclusive offers and our latest hardware deals.
              </p>
            </div>
          </FadeUp>
        </div>
      )}
    </footer>
  );
};

export default Footer;
