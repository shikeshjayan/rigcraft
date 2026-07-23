import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allItems } from '../data/items';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

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
  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, item) => {
      if (!item) return sum;
      return sum + (item.priceVal || 0);
    }, 0);
  }, [selectedParts]);

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
      <div className="w-full bg-white border-b border-[#E2E8F0] py-9 sticky top-[105px] z-30 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto hide-scrollbar gap-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = selectedParts[step.category] != null || (step.id < currentStep && step.category !== null);
              
              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] transition-colors ${isActive ? 'bg-[#0052FF] text-white' : isCompleted ? 'bg-[#10B981] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                    {step.id}
                  </div>
                  <span className={`text-[14px] font-bold ${isActive ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                    {step.label}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="w-8 md:w-12 h-[2px] bg-[#E2E8F0] ml-2 hidden sm:block"></div>
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
                              <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight mb-1">{item.title}</h3>
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
                              className={`font-bold py-2 px-4 text-[14px] transition-colors cursor-pointer ${isSelected ? 'bg-white border-2 border-[#0052FF] text-[#0052FF]' : 'bg-[#0052FF] border-2 border-[#0052FF] text-white hover:opacity-90'}`}
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
              <div className="bg-white border border-[#CBD5E1] p-8 text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
                <h2 className="text-[24px] font-bold text-[#0F172A] mb-4">Your Custom PC is Ready!</h2>
                <p className="text-[#64748B] mb-8">Review your parts on the right and proceed to checkout.</p>
                <button className="bg-[#0052FF] text-white font-bold py-3 px-8 text-[16px] hover:opacity-90 cursor-pointer" style={{ borderRadius: 'var(--radius-sm)' }}>
                  Add Full Build to Cart
                </button>
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
                      <div>
                        <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}</div>
                        {item ? (
                          <div className="text-[13px] text-[#0F172A] font-medium leading-tight">{item.title}</div>
                        ) : (
                          <div className="text-[13px] text-[#64748B] italic">Pending selection...</div>
                        )}
                      </div>
                      <div className="text-[14px] font-bold text-[#0F172A] whitespace-nowrap mt-1">
                        {item ? item.price : '---'}
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
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[16px] font-bold">Total</span>
                  <span className="text-[28px] font-extrabold">{formatPrice(totalPrice)}</span>
                </div>

                {!isReviewStep && (
                  <button 
                    onClick={handleNextStep}
                    className="w-full bg-[#0052FF] text-white font-bold py-3 px-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {`Next: ${STEPS.find(s => s.id === currentStep + 1)?.label}`} 
                    <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BuilderWorkspace;
