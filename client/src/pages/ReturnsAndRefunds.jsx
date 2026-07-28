import React from 'react';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import ComputerIcon from '@mui/icons-material/Computer';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const ReturnsAndRefunds = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Returns & Refunds' }]} />
        <FadeUp>
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">
              Returns & <span className="text-blue-600">Refunds</span>
            </h1>
            <p className="text-[16px] text-gray-600 font-medium max-w-2xl mx-auto">
              We want you to be completely satisfied with your RigCraft purchase. Please review our comprehensive return and refund policies below.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            
            {/* General Policy Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg relative overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <ReplyAllIcon sx={{ fontSize: 40 }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wide mb-2">30-Day Satisfaction Guarantee</h2>
                  <p className="text-blue-50 font-medium text-[15px] leading-relaxed">
                    Most unopened and unused items can be returned within 30 days of delivery for a full refund. 
                    Exceptions apply for custom-built systems and digital products. See specific categories below.
                  </p>
                </div>
              </div>
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Custom PCs Policy */}
              <div className="bg-white p-8 border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <ComputerIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                  <h3 className="text-xl font-bold text-gray-900 uppercase">Custom Built PCs</h3>
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                  Custom-configured RigCraft systems are built to order. If you wish to return a custom PC within the 30-day window, a <strong>15% restocking fee</strong> will apply.
                </p>
                <ul className="text-sm text-gray-600 flex flex-col gap-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Must be returned in original packaging with all accessories.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Physical damage caused by user modifications voids the return policy.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    Original shipping charges are non-refundable.
                  </li>
                </ul>
              </div>

              {/* Individual Components Policy */}
              <div className="bg-white p-8 border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <MemoryIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                  <h3 className="text-xl font-bold text-gray-900 uppercase">Individual Components</h3>
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                  Individual hardware components (GPUs, CPUs, RAM, etc.) can be returned within 30 days. Condition determines eligibility:
                </p>
                <ul className="text-sm text-gray-600 flex flex-col gap-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <strong>Unopened:</strong> 100% refund (minus shipping).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <strong>Opened/Used:</strong> Subject to a 15% restocking fee.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <strong>Defective:</strong> Fully covered under warranty; eligible for 100% refund or free replacement.
                  </li>
                </ul>
              </div>

            </div>

            {/* Refund Process Timeline */}
            <div className="bg-white p-8 md:p-10 border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
              <div className="flex items-center gap-3 mb-8 justify-center">
                <CurrencyExchangeIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                <h3 className="text-2xl font-black text-gray-900 uppercase">Refund Process</h3>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
                {/* Horizontal Line for Desktop */}
                <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-gray-200 z-0"></div>
                
                {/* Vertical Line for Mobile */}
                <div className="md:hidden absolute top-10 bottom-10 left-6 w-0.5 bg-gray-200 z-0"></div>

                {[
                  { step: 1, title: 'Initiate Return', desc: 'Contact support to receive your Return Merchandise Authorization (RMA) number and shipping label.' },
                  { step: 2, title: 'Ship Item', desc: 'Pack the item securely in its original packaging and drop it off at the designated courier.' },
                  { step: 3, title: 'Inspection', desc: 'Once received, our engineers inspect the item within 2-3 business days.' },
                  { step: 4, title: 'Refund Issued', desc: 'Approved refunds take 3-5 business days to appear on your original payment method.' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-row md:flex-col items-start md:items-center gap-4 relative z-10 w-full md:w-1/4 mb-8 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-md">
                      {item.step}
                    </div>
                    <div className="md:text-center pt-2 md:pt-0">
                      <h4 className="text-[15px] font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-[12px] text-gray-500 font-medium leading-relaxed px-0 md:px-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-returnable Items & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-100 p-8 border border-gray-200" style={{ borderRadius: 'var(--radius-sm)' }}>
                <h4 className="text-[15px] font-bold text-gray-900 uppercase mb-4">Non-Returnable Items</h4>
                <ul className="text-sm text-gray-600 flex flex-col gap-3 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} /> Digital software licenses and OS keys.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} /> Gift cards and promotional credits.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} /> Items damaged due to user overclocking or mishandling.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} /> "Final Sale" clearance items.
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-8 border border-blue-100 flex flex-col justify-center items-center text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
                <ContactSupportIcon sx={{ fontSize: 48, color: '#2563EB' }} className="mb-4" />
                <h4 className="text-[18px] font-black text-gray-900 uppercase mb-2">Ready to Start a Return?</h4>
                <p className="text-sm text-gray-600 font-medium mb-6">
                  Have your Order ID ready and contact our support team to get your RMA number.
                </p>
                <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-sm hover:bg-blue-700 transition-colors uppercase tracking-wide text-[13px]">
                  Contact Support
                </button>
              </div>
            </div>

          </div>
        </FadeUp>
      </div>
    </div>
  );
};

export default ReturnsAndRefunds;
