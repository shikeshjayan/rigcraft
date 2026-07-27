import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { allItems } from '../data/items';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const STEPS = [
  { id: 1, label: 'CPU', category: 'cpu' },
  { id: 2, label: 'Motherboard', category: 'motherboard' },
  { id: 3, label: 'Memory', category: 'ram' },
  { id: 4, label: 'Storage', category: 'ssd' },
  { id: 5, label: 'GPU', category: 'gpu' },
  { id: 6, label: 'Case', category: 'cabinet' },
  { id: 7, label: 'Power', category: 'psu' },
  { id: 8, label: 'Cooling', category: 'cooling' },
  { id: 9, label: 'Review', category: null },
];

const BuilderWorkspace = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedParts, setSelectedParts] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    ssd: null,
    gpu: null,
    cabinet: null,
    psu: null,
    cooling: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [activePopupItem, setActivePopupItem] = useState(null);
  const [assemblyMode, setAssemblyMode] = useState('parts');
  const { addToCart } = useCart();

  // Reset filters when step changes
  useEffect(() => {
    setSearchQuery('');
    setBrandFilter('All Brands');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const activeCategory = STEPS.find(s => s.id === currentStep)?.category;

  // Filter components based on current step and search/filters
  const availableComponents = useMemo(() => {
    if (!activeCategory) return [];
    
    return allItems.filter(item => {
      if (item.category !== activeCategory) return false;
      
      if (brandFilter !== 'All Brands') {
        const itemBrand = (item.brand || '').toLowerCase();
        if (!itemBrand.includes(brandFilter.toLowerCase())) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchString = `${item.title} ${item.brand || ''} ${item.specs?.join(' ') || ''}`.toLowerCase();
        if (!searchString.includes(query)) return false;
      }

      return true;
    });
  }, [activeCategory, searchQuery, brandFilter]);

  // Derived state for summary
  const basePrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, item) => {
      if (!item) return sum;
      return sum + (item.priceVal || 0);
    }, 0);
  }, [selectedParts]);

  const assemblyFee = useMemo(() => {
    return assemblyMode === 'assembled' ? basePrice * 0.005 : 0;
  }, [basePrice, assemblyMode]);

  const totalPrice = basePrice + assemblyFee;

  const estWattage = useMemo(() => {
    // Rough estimation based on selected parts
    let watts = 0;
    if (selectedParts.cpu) watts += 105;
    if (selectedParts.gpu) watts += 250;
    if (selectedParts.motherboard) watts += 40;
    if (selectedParts.ram) watts += 15;
    if (selectedParts.ssd) watts += 10;
    if (selectedParts.cooling) watts += 15;
    return watts;
  }, [selectedParts]);

  const handleSelectPart = (item) => {
    setSelectedParts(prev => ({ ...prev, [item.category]: item }));
    setActivePopupItem(null);
    const currentStepObj = STEPS.find(s => s.category === item.category);
    if (currentStepObj && currentStepObj.id < 9) {
      setCurrentStep(currentStepObj.id + 1);
    }
  };

  const handleRemovePart = (category) => {
    setSelectedParts(prev => ({ ...prev, [category]: null }));
  };

  const handleNextStep = () => {
    if (currentStep < 9) setCurrentStep(prev => prev + 1);
  };

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(priceVal);
  };

  const isReviewStep = currentStep === 9;

  return (
    <section className="w-full pb-20" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      
      {/* 1. Progress Stepper Bar */}
      <div className="w-full bg-white border-b border-[#E2E8F0] py-4 md:py-9 sticky top-[96px] md:top-[108px] z-30 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-2 md:px-4 lg:px-8">
          <div className="grid grid-cols-5 gap-y-4 gap-x-1 lg:flex lg:items-center lg:justify-between lg:overflow-x-auto hide-scrollbar lg:gap-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const hasItem = step.category && selectedParts[step.category] != null;
              
              let stepBg = 'bg-[#F1F5F9] text-[#94A3B8]'; // Default Gray
              if (isActive) {
                stepBg = 'bg-[var(--color-primary)] text-white'; // Blue
              } else if (step.category !== null) {
                if (hasItem) {
                  stepBg = 'bg-[#10B981] text-white'; // Green
                } else if (step.id < currentStep) {
                  stepBg = 'bg-[#EF4444] text-white'; // Red (Missed)
                }
              } else if (step.id === 9 && currentStep === 9) {
                stepBg = 'bg-[var(--color-primary)] text-white';
              }
              
              return (
                <div key={step.id} className="flex flex-col lg:flex-row items-center lg:justify-center gap-1 lg:gap-2 shrink-0 cursor-pointer text-center lg:text-left" onClick={() => setCurrentStep(step.id)}>
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-bold text-[11px] lg:text-[13px] transition-colors mx-auto lg:mx-0 ${stepBg}`}>
                    {step.id}
                  </div>
                  <span className={`text-[10px] lg:text-[14px] leading-tight lg:leading-normal font-bold ${isActive ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                    {step.label}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="w-8 xl:w-12 h-[2px] bg-[#E2E8F0] ml-2 hidden xl:block"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (65%) - Component Selection */}
          <div className="lg:w-[65%] w-full">
            
            {!isReviewStep && (
              <>
                {/* Filter & Search Bar Container */}
                <div className="bg-white border border-[#CBD5E1] p-3 flex flex-col sm:flex-row gap-3 mb-6" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <select 
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="h-10 border border-[#CBD5E1] px-3 bg-white text-[#0F172A] text-[14px] font-medium focus:outline-none focus:border-[#0052FF]"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="All Brands">All Brands</option>
                    <option value="intel">Intel</option>
                    <option value="amd">AMD</option>
                    <option value="nvidia">NVIDIA</option>
                    <option value="asus">ASUS</option>
                    <option value="msi">MSI</option>
                    <option value="gigabyte">Gigabyte</option>
                    <option value="corsair">Corsair</option>
                  </select>

                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Search ${STEPS.find(s => s.id === currentStep)?.label}s...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full border border-[#CBD5E1] pl-10 pr-3 bg-white text-[#0F172A] text-[14px] focus:outline-none focus:border-[#0052FF]"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                  
                  {/* AI Button */}
                  <button className="relative flex flex-col cursor-pointer items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-1 h-10 hover:brightness-110 transition-all flex-shrink-0 group overflow-visible" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-[13px] uppercase tracking-wider">Build with Rig AI</span>
                    <span className="text-[9px] text-purple-200 uppercase tracking-widest -mt-0.5">Beta</span>
                    
                    {/* Shining Star */}
                    <div className="absolute -top-2 -right-1 text-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] animate-[spin_4s_linear_infinite] z-10">
                      <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                    </div>
                  </button>
                </div>

                {/* Component Card Container */}
                <div className="flex flex-col gap-4">
                  {availableComponents.map(item => {
                    const isSelected = selectedParts[activeCategory]?.id === item.id;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white border p-4 flex flex-col sm:flex-row gap-6 items-center transition-all hover:shadow-md ${isSelected ? 'border-[#0052FF] ring-1 ring-[#0052FF]' : 'border-[#CBD5E1] hover:border-[#0052FF]'}`}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        {/* Thumbnail */}
                        <div className="w-32 h-32 shrink-0 bg-[#F8FAFC] flex items-center justify-center p-2 rounded-md">
                          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-grow flex flex-col h-full w-full">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <h3 
                                className="text-[16px] font-bold text-[#0F172A] leading-tight mb-1 cursor-pointer hover:text-[#0052FF] hover:underline transition-colors"
                                onClick={() => setActivePopupItem(item)}
                              >
                                {item.title}
                              </h3>
                              <p className="text-[13px] text-[#64748B]">{item.brand} | {item.category.toUpperCase()}</p>
                            </div>
                            {item.specs && item.specs[0] && (
                              <div className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-[11px] font-bold px-2 py-1 whitespace-nowrap" style={{ borderRadius: 'var(--radius-sm)' }}>
                                {item.specs[0].split(',')[0]}
                              </div>
                            )}
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4 mt-2">
                            {item.specs?.map((spec, i) => (
                              <span key={i} className="bg-[#E2E8F0] text-[#334155] text-[12px] px-2 py-1 rounded-sm">
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Footer / Price & Add */}
                          <div className="mt-auto flex justify-between items-end w-full">
                            <span className="text-[18px] font-bold text-[#0F172A]">{item.price}</span>
                            
                            <button 
                              onClick={() => handleSelectPart(item)}
                              className={`font-bold py-2 px-4 text-[14px] transition-colors cursor-pointer ${isSelected ? 'bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-[var(--color-primary)] border-2 border-[var(--color-primary)] text-white hover:opacity-90'}`}
                              style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                              {isSelected ? 'Selected' : 'Add to Build'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {availableComponents.length === 0 && (
                    <div className="py-12 text-center text-[#64748B] bg-white border border-[#CBD5E1]" style={{ borderRadius: 'var(--radius-sm)' }}>
                      No components found matching your criteria.
                    </div>
                  )}
                </div>
              </>
            )}

            {isReviewStep && (
              <div className="bg-white border border-[#CBD5E1] p-8" style={{ borderRadius: 'var(--radius-sm)' }}>
                <h2 className="text-[24px] font-bold text-[#0F172A] mb-6 border-b pb-4">Review Your Custom Build</h2>
                
                {/* Assembly Options */}
                <div className="mb-8">
                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-4">How would you like your PC?</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`flex-1 border p-4 cursor-pointer transition-colors ${assemblyMode === 'assembled' ? 'border-[#0052FF] bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-[#94A3B8]'}`} style={{ borderRadius: 'var(--radius-sm)' }}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="assemblyMode" value="assembled" checked={assemblyMode === 'assembled'} onChange={() => setAssemblyMode('assembled')} className="w-5 h-5 accent-[#0052FF]" />
                        <div>
                          <div className="font-bold text-[#0F172A]">Completely Assembled</div>
                          <div className="text-[13px] text-[#64748B]">Ready to plug and play out of the box</div>
                        </div>
                      </div>
                    </label>
                    <label className={`flex-1 border p-4 cursor-pointer transition-colors ${assemblyMode === 'parts' ? 'border-[#0052FF] bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-[#94A3B8]'}`} style={{ borderRadius: 'var(--radius-sm)' }}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="assemblyMode" value="parts" checked={assemblyMode === 'parts'} onChange={() => setAssemblyMode('parts')} className="w-5 h-5 accent-[#0052FF]" />
                        <div>
                          <div className="font-bold text-[#0F172A]">Non-assembled parts</div>
                          <div className="text-[13px] text-[#64748B]">Build it yourself, parts shipped separately</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Detailed Selected Parts List */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[16px] font-bold text-[#0F172A]">Selected Components</h3>
                  {STEPS.filter(s => s.category !== null).map(step => {
                    const item = selectedParts[step.category];
                    return (
                      <div key={step.id} className="flex flex-col sm:flex-row gap-4 items-center bg-[#F8FAFC] border border-[#CBD5E1] p-4" style={{ borderRadius: 'var(--radius-sm)' }}>
                        <div className="w-20 h-20 shrink-0 bg-white border border-[#E2E8F0] p-2 flex items-center justify-center rounded">
                          {item ? <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply" /> : <div className="text-[12px] text-[#94A3B8] font-medium">Empty</div>}
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}</div>
                          {item ? (
                            <>
                              <div className="text-[16px] font-bold text-[#0F172A]">{item.title}</div>
                              <div className="text-[13px] text-[#64748B]">{item.brand}</div>
                            </>
                          ) : (
                            <div className="text-[14px] text-[#EF4444] font-medium">Missing Component! Please select a {step.label}.</div>
                          )}
                        </div>
                        <div className="text-[18px] font-bold text-[#0F172A] whitespace-nowrap">
                          {item ? item.price : '---'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (35%) - Sticky Sidebar */}
          <div className="lg:w-[35%] w-full">
            <div className="sticky top-[210px] bg-white border border-[#CBD5E1] flex flex-col" style={{ borderRadius: 'var(--radius-sm)' }}>
              
              {/* Header */}
              <div className="p-4 border-b border-[#CBD5E1] bg-[#F8FAFC] rounded-t-md">
                <h2 className="text-[18px] font-bold text-[#0F172A]">Build Summary</h2>
              </div>
              
              {/* Selected List */}
              <div className="p-4 flex flex-col gap-4 max-h-[32vh] overflow-y-auto">
                {STEPS.filter(s => s.category !== null).map(step => {
                  const item = selectedParts[step.category];
                  return (
                    <div key={step.id} className="flex justify-between items-start gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex-grow pr-2">
                        <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}</div>
                        {item ? (
                          <div className="text-[13px] text-[#0F172A] font-medium leading-tight cursor-pointer hover:text-[#0052FF]" onClick={() => setActivePopupItem(item)}>{item.title}</div>
                        ) : (
                          <div className="text-[13px] text-[#64748B] italic">Pending selection...</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1 mt-1">
                        <div className="text-[14px] font-bold text-[#0F172A] whitespace-nowrap">
                          {item ? item.price : '---'}
                        </div>
                        {item && (
                          <button onClick={() => handleRemovePart(step.category)} className="text-[11px] text-[#EF4444] font-bold hover:underline cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alert Box */}
              <div className="mx-4 mb-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-[13px] font-medium" style={{ borderRadius: 'var(--radius-sm)' }}>
                {selectedParts.cpu && selectedParts.motherboard 
                  ? 'All selected core components are compatible.'
                  : 'Awaiting core components to check compatibility.'}
              </div>

              {/* Bottom Totals Zone */}
              <div className="bg-[#0F172A] p-5 text-white rounded-b-md mt-auto">
                <div className="flex justify-between items-center mb-3 text-[14px]">
                  <span className="text-[#94A3B8]">Est. Wattage</span>
                  <span className="font-bold">{estWattage}W</span>
                </div>
                
                {assemblyFee > 0 && (
                  <div className="flex justify-between items-center mb-3 text-[14px]">
                    <span className="text-[#94A3B8]">Assembly Fee</span>
                    <span className="font-bold">{formatPrice(assemblyFee)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-6 pt-3 border-t border-[#334155]">
                  <span className="text-[16px] font-bold">Total</span>
                  <span className="text-[28px] font-extrabold">{formatPrice(totalPrice)}</span>
                </div>

                {!isReviewStep ? (
                  <button 
                    onClick={handleNextStep}
                    className="w-full bg-[var(--color-primary)] text-white font-bold py-3 px-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {`Next: ${STEPS.find(s => s.id === currentStep + 1)?.label}`} 
                    <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      Object.values(selectedParts).forEach(part => {
                        if (part) addToCart(part);
                      });
                      if (assemblyFee > 0) {
                        addToCart({
                          id: 'assembly-fee',
                          title: 'Assembly & Testing Service',
                          brand: 'Rigcraft',
                          image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=200',
                          priceVal: assemblyFee,
                          price: formatPrice(assemblyFee),
                          description: 'Professional assembly and stress testing of your custom PC.'
                        });
                      }
                      alert('Custom build added to cart!');
                    }}
                    className="w-full bg-[var(--color-primary)] text-white font-bold py-3 px-4 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    Add Build to Cart
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Component Details Popup Modal */}
      <AnimatePresence>
        {activePopupItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActivePopupItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-[800px] w-full flex flex-col md:flex-row rounded-lg overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setActivePopupItem(null)}
                className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>
              
              <div className="w-full md:w-2/5 bg-[#F8FAFC] p-8 flex items-center justify-center border-r border-[#E2E8F0]">
                <img src={activePopupItem.image} alt={activePopupItem.title} className="w-full max-h-[300px] object-contain mix-blend-multiply" />
              </div>
              
              <div className="w-full md:w-3/5 p-8 flex flex-col">
                <div className="text-[13px] font-bold text-[#0052FF] mb-2">{activePopupItem.brand} | {activePopupItem.category?.toUpperCase()}</div>
                <h2 className="text-[24px] font-bold text-[#0F172A] leading-tight mb-4">{activePopupItem.title}</h2>
                <p className="text-[14px] text-[#64748B] mb-6 leading-relaxed">
                  {activePopupItem.description}
                </p>
                
                <div className="flex flex-col gap-2 mb-8">
                  {activePopupItem.specs?.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px] text-[#334155]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></div>
                      {spec}
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Price</div>
                    <div className="text-[24px] font-extrabold text-[#0F172A]">{activePopupItem.price}</div>
                  </div>
                  <button 
                    onClick={() => handleSelectPart(activePopupItem)}
                    className="bg-[var(--color-primary)] hover:bg-[#1E3A8A] text-white font-bold py-3 px-8 transition-colors cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    Add to Build
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default BuilderWorkspace;
