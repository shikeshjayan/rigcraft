import React, { useState } from 'react';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'error', 'success'

  const handleSubscribe = (e) => {
    e.preventDefault();
    
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

    // Simulate successful subscription
    setStatus('success');
    setMessage('Thanks for subscribing!');
    setEmail('');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setStatus('idle');
    }, 3000);
  };

  return (
    <footer className="w-full">
      {/* Newsletter Banner */}
      <div className="w-full py-12" style={{ backgroundColor: 'var(--color-primary, #2563EB)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="text-[24px] md:text-[28px] font-extrabold tracking-wide mb-2">Join the PCForge Community</h3>
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
                className="px-6 py-3 bg-[#1E3A8A] text-white font-bold hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
                style={{ borderRadius: '0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0' }}
              >
                Subscribe
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
            
            {/* Brand Column (Spans 2 cols on large) */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-2 mb-6 cursor-pointer">
                <PrecisionManufacturingIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                <span className="text-[24px] font-black tracking-widest uppercase">PCForge</span>
              </div>
              <p className="text-[15px] text-gray-400 leading-relaxed mb-8 font-medium">
                India's premier PC building platform. Custom gaming PCs, premium components, and expert support — all in one place.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><XIcon /></a>
                <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><LinkedInIcon /></a>
                <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><FacebookIcon /></a>
                <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><YouTubeIcon /></a>
                <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><InstagramIcon /></a>
              </div>
            </div>

            {/* Products */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Products</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Custom PC Builder</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Prebuilt Gaming PCs</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">PC Components</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Gaming Accessories</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Monitors</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Peripherals</li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Support</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Track Order</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Warranty Claims</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Returns & Refunds</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Contact Support</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Live Chat</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">FAQs</li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Company</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">About PCForge</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Careers</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Press Kit</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Blog</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Community</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Affiliate Program</li>
              </ul>
            </div>

            {/* Explore */}
            <div className="flex flex-col">
              <h4 className="text-[14px] font-bold tracking-widest text-white mb-6 uppercase">Explore</h4>
              <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">PC Builder Guide</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Compatibility Checker</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Compare Builds</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Best Sellers</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">New Arrivals</li>
                <li className="cursor-pointer hover:text-[var(--color-primary)] transition-colors">Today's Deals</li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 gap-4 text-[13px] text-gray-400 font-medium">
            <div>
              &copy; 2025 PCForge Technologies Pvt Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Sitemap</a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
