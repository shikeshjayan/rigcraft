import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeUp from '../components/FadeUp';
import MemoryIcon from '@mui/icons-material/Memory';
import ExtensionIcon from '@mui/icons-material/Extension';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HardwareIcon from '@mui/icons-material/Hardware';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const PcBuilderGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeUp>
          {/* Header */}
          <div className="text-center mb-16 relative">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">
              PC Builder <span className="text-blue-600">Guide</span>
            </h1>
            <p className="text-[16px] text-gray-600 font-medium max-w-2xl mx-auto mb-8">
              Welcome to the ultimate guide for using the RigCraft Custom PC Builder. Follow these steps to build a perfectly optimized, compatibility-checked rig of your dreams.
            </p>
            <button 
              onClick={() => navigate('/builder')}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-sm hover:bg-blue-700 transition-colors uppercase tracking-widest text-[13px] shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"
            >
              <RocketLaunchIcon fontSize="small" /> Launch Builder
            </button>
          </div>

          <div className="relative">
            {/* Center Timeline Line (Desktop only) */}
            <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-600 via-indigo-400 to-gray-200 -translate-x-1/2 z-0"></div>

            <div className="flex flex-col gap-12 lg:gap-24 relative z-10">
              
              {/* Step 1: Core Components (Workspace) */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="lg:w-1/2 flex justify-end text-left lg:text-right">
                  <div className="bg-white p-8 border border-gray-200 shadow-sm w-full" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex lg:flex-row-reverse items-center gap-3 mb-4">
                      <MemoryIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                      <h3 className="text-2xl font-black text-gray-900 uppercase">1. Core Components</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                      Start in the <strong>Builder Workspace</strong>. Here, you select the brain and muscle of your PC: the Processor (CPU), Graphics Card (GPU), Motherboard, and Memory (RAM).
                    </p>
                    <ul className="text-sm text-gray-500 flex flex-col gap-2 font-medium">
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Pick a CPU tailored to your needs (Gaming, Editing, etc.).
                      </li>
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Select a motherboard that automatically filters to fit your CPU socket.
                      </li>
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Choose a GPU to drive your visual performance.
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Timeline Dot */}
                <div className="hidden lg:flex w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl items-center justify-center border-4 border-white shadow-xl flex-shrink-0 z-10">1</div>
                <div className="lg:w-1/2 hidden lg:block"></div> {/* Spacer */}
              </div>

              {/* Step 2: Upgrades (Storage, Cooling, PSU) */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
                <div className="lg:w-1/2 text-left">
                  <div className="bg-white p-8 border border-gray-200 shadow-sm w-full" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <ExtensionIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                      <h3 className="text-2xl font-black text-gray-900 uppercase">2. Essential Upgrades</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                      Move down to the <strong>Builder Upgrades</strong> section. A great PC needs fast storage, reliable power, and excellent thermals.
                    </p>
                    <ul className="text-sm text-gray-500 flex flex-col gap-2 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Add NVMe SSDs for lightning-fast boot and load times.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Select an AIO Liquid Cooler or a beefy air cooler for your CPU.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Pick a Power Supply (PSU) with enough wattage to comfortably run your chosen components.
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Timeline Dot */}
                <div className="hidden lg:flex w-16 h-16 rounded-full bg-indigo-500 text-white font-black text-2xl items-center justify-center border-4 border-white shadow-xl flex-shrink-0 z-10">2</div>
                <div className="lg:w-1/2 hidden lg:block"></div> {/* Spacer */}
              </div>

              {/* Step 3: Accessories */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="lg:w-1/2 flex justify-end text-left lg:text-right">
                  <div className="bg-white p-8 border border-gray-200 shadow-sm w-full" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex lg:flex-row-reverse items-center gap-3 mb-4">
                      <KeyboardIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                      <h3 className="text-2xl font-black text-gray-900 uppercase">3. Accessories & Peripherals</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                      Complete your setup in the <strong>Builder Accessories</strong> section. What's a great PC without the gear to use it?
                    </p>
                    <ul className="text-sm text-gray-500 flex flex-col gap-2 font-medium">
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Choose mechanical keyboards and high-precision mice.
                      </li>
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Select high refresh rate monitors for the ultimate gaming experience.
                      </li>
                      <li className="flex lg:flex-row-reverse items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Add extra case fans for improved airflow and RGB aesthetics.
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Timeline Dot */}
                <div className="hidden lg:flex w-16 h-16 rounded-full bg-blue-400 text-white font-black text-2xl items-center justify-center border-4 border-white shadow-xl flex-shrink-0 z-10">3</div>
                <div className="lg:w-1/2 hidden lg:block"></div> {/* Spacer */}
              </div>

              {/* Step 4: Checkout & Build */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
                <div className="lg:w-1/2 text-left">
                  <div className="bg-white p-8 border border-gray-200 shadow-sm w-full" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <BuildCircleIcon sx={{ fontSize: 32, color: '#2563EB' }} />
                      <h3 className="text-2xl font-black text-gray-900 uppercase">4. Let RigCraft Build It</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                      Once you've selected all your parts, proceed to checkout. Our expert technicians take over from here.
                    </p>
                    <ul className="text-sm text-gray-500 flex flex-col gap-2 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Professional assembly with pristine cable management.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Rigorous stress testing and benchmarking before shipping.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Securely packaged and delivered straight to your door.
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Timeline Dot */}
                <div className="hidden lg:flex w-16 h-16 rounded-full bg-gray-400 text-white font-black text-2xl items-center justify-center border-4 border-white shadow-xl flex-shrink-0 z-10">
                  <HardwareIcon />
                </div>
                <div className="lg:w-1/2 hidden lg:block"></div> {/* Spacer */}
              </div>
            </div>
            
          </div>

          {/* Compatibility Engine Info */}
          <div className="mt-24 bg-gradient-to-br from-gray-900 to-blue-950 p-10 text-white shadow-2xl relative overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="bg-blue-600/30 p-5 rounded-full border border-blue-500/50">
                <VerifiedUserIcon sx={{ fontSize: 56, color: '#60A5FA' }} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-wide uppercase mb-3">Auto-Compatibility Engine</h2>
                <p className="text-blue-100 font-medium text-[16px] leading-relaxed max-w-3xl">
                  Don't worry about picking the wrong parts. Our advanced builder engine automatically filters components in real-time. If you pick an Intel CPU, you'll only see compatible Intel Motherboards. If you pick a massive GPU, we'll ensure your case and PSU can handle it. <strong>Build with absolute confidence.</strong>
                </p>
              </div>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 opacity-20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500 opacity-20 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
          </div>

        </FadeUp>
      </div>
    </div>
  );
};

export default PcBuilderGuide;
