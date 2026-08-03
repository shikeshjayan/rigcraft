import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { normalizeBuilderProduct, normalizeDraftBuild, BUILDER_CATEGORIES } from '../utils/builderProducts';
import { validateBuilderBuild, estimateWattage } from '../utils/builderCompatibility';
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

const getTypeName = (type) => typeof type === 'string' ? type : type?.name || 'UNKNOWN';

const MULTI_SLOT_CATEGORIES = ['ram', 'ssd'];
const MAX_QUANTITY = 4;
const MAX_ENTRIES = 4;

const BuilderWorkspace = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [allItems, setAllItems] = useState([]);
  const [selectedParts, setSelectedParts] = useState({
    cpu: null,
    motherboard: null,
    ram: [],
    ssd: [],
    gpu: null,
    cabinet: null,
    psu: null,
    cooling: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [activePopupItem, setActivePopupItem] = useState(null);
  const [assemblyMode, setAssemblyMode] = useState('parts');
  const [buildPopupMessage, setBuildPopupMessage] = useState(null);
  const [builderSettings, setBuilderSettings] = useState({
    enabled: true,
    assemblyFeeEnabled: false,
    assemblyFeeType: 'percent',
    assemblyFeeValue: 0.5,
    requireCompleteBuild: true
  });
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const rawDraft = location.state?.draftBuild || JSON.parse(localStorage.getItem('draftBuild') || 'null');
    if (!rawDraft) return;

    const mappedDraftBuild = normalizeDraftBuild(rawDraft);

    if (Object.keys(mappedDraftBuild).length === 0) return;

    const wrappedDraftBuild = { ...mappedDraftBuild };
    for (const cat of MULTI_SLOT_CATEGORIES) {
      if (mappedDraftBuild[cat]) {
        wrappedDraftBuild[cat] = Array.isArray(mappedDraftBuild[cat])
          ? mappedDraftBuild[cat].map(e => ({ item: e.item || e, quantity: e.quantity || 1 }))
          : [{ item: mappedDraftBuild[cat], quantity: 1 }];
      }
    }

    setSelectedParts(prev => ({
      ...prev,
      ...wrappedDraftBuild
    }));
    localStorage.removeItem('draftBuild');

    // Navigate to the next empty step
    let nextStep = 1;
    for (let i = 0; i < BUILDER_CATEGORIES.length; i++) {
      const key = BUILDER_CATEGORIES[i];
      const value = wrappedDraftBuild[key];
      const isFilled = MULTI_SLOT_CATEGORIES.includes(key)
        ? (Array.isArray(value) ? value.length > 0 : value != null)
        : value != null;
      if (!isFilled) {
        nextStep = i + 1;
        break;
      }
    }
    setCurrentStep(nextStep);

    // Clean up location state using React Router so refresh doesn't trigger it again
    navigate('.', { replace: true, state: {} });
  }, [location.state, navigate]);

  const handleSaveBuild = async () => {
    const typeMapping = {
      cpu: 'cpu',
      motherboard: 'motherboard',
      ram: 'ram',
      ssd: 'storage',
      gpu: 'gpu',
      cabinet: 'cabinet',
      psu: 'psu',
      cooling: 'cooler'
    };

    const components = [];
    for (const [type, part] of Object.entries(selectedParts)) {
      if (part == null) continue;
      if (MULTI_SLOT_CATEGORIES.includes(type)) {
        for (const entry of part) {
          if (entry && entry.item) {
            components.push({
              type: typeMapping[type] || type,
              product: entry.item,
              quantity: Math.max(1, Number(entry.quantity) || 1)
            });
          }
        }
      } else {
        components.push({
          type: typeMapping[type] || type,
          product: part,
          quantity: 1
        });
      }
    }

    if (components.length === 0) {
      alert('Please select at least one component to save a build.');
      return;
    }

    if (builderSettings.requireCompleteBuild && compatibility.status === 'incomplete') {
      alert(`Your build is incomplete. ${compatibility.issues[0] || ''}`);
      return;
    }

    try {
      const payload = {
        name: `Custom PC - ${new Date().toLocaleDateString()}`,
        components,
        assemblyMode
      };
      const { data } = await apiClient.post('/builds', payload);
      if (data.success) {
        setBuildPopupMessage('Build Added Successfully!');
        setTimeout(() => setBuildPopupMessage(null), 4000);
        
        // Reset builder state
        setSelectedParts({
          cpu: null,
          motherboard: null,
          ram: [],
          ssd: [],
          gpu: null,
          cabinet: null,
          psu: null,
          cooling: null
        });
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Failed to save build', error);
      const serverMessage = error?.response?.data?.message;
      alert(serverMessage || 'Failed to save build. Make sure you are logged in.');
    }
  };

  // Reset filters when step changes
  useEffect(() => {
    setSearchQuery('');
    setBrandFilter('All Brands');
  }, [currentStep]);

  const activeCategory = STEPS.find(s => s.id === currentStep)?.category;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=1000');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];
          
          const formatted = pcArray.map(p => normalizeBuilderProduct(p));
          setAllItems(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch components', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchBuilderSettings = async () => {
      try {
        const { data } = await apiClient.get('/builds/settings');
        if (data && data.data) {
          setBuilderSettings(prev => ({ ...prev, ...data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch builder settings', error);
      }
    };
    fetchBuilderSettings();
  }, []);

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
  }, [activeCategory, searchQuery, brandFilter, allItems]);

  // Derived state for summary
  const basePrice = useMemo(() => {
    return Object.entries(selectedParts).reduce((sum, [category, item]) => {
      if (!item) return sum;
      if (MULTI_SLOT_CATEGORIES.includes(category)) {
        return sum + item.reduce((s, entry) => s + (entry.item?.priceVal || 0) * (Math.max(1, Number(entry.quantity) || 1)), 0);
      }
      return sum + (item.priceVal || 0);
    }, 0);
  }, [selectedParts]);

  const assemblyFee = useMemo(() => {
    if (assemblyMode !== 'assembled' || !builderSettings.assemblyFeeEnabled) return 0;
    const feeValue = Number(builderSettings.assemblyFeeValue) || 0;
    return builderSettings.assemblyFeeType === 'fixed' ? feeValue : basePrice * (feeValue / 100);
  }, [assemblyMode, builderSettings, basePrice]);

  const totalPrice = basePrice + assemblyFee;

  const estWattage = useMemo(() => estimateWattage(selectedParts), [selectedParts]);

  const compatibility = useMemo(() => validateBuilderBuild(selectedParts), [selectedParts]);

  const incompleteBlocked = builderSettings.requireCompleteBuild && compatibility.status === 'incomplete';

  const handleSelectPart = (item) => {
    if (MULTI_SLOT_CATEGORIES.includes(item.category)) {
      const entries = selectedParts[item.category] || [];
      const exists = entries.some(e => e.item?.id === item.id);
      if (!exists && entries.length < MAX_ENTRIES) {
        setSelectedParts(prev => ({
          ...prev,
          [item.category]: [...(prev[item.category] || []), { item, quantity: 1 }]
        }));
      }
      setActivePopupItem(null);
      return;
    }
    setSelectedParts(prev => ({ ...prev, [item.category]: item }));
    setActivePopupItem(null);
    const currentStepObj = STEPS.find(s => s.category === item.category);
    if (currentStepObj && currentStepObj.id < 9) {
      setCurrentStep(currentStepObj.id + 1);
    }
  };

  const handleRemovePart = (category, itemId) => {
    if (MULTI_SLOT_CATEGORIES.includes(category)) {
      setSelectedParts(prev => ({
        ...prev,
        [category]: (prev[category] || []).filter(e => e.item?.id !== itemId)
      }));
    } else {
      setSelectedParts(prev => ({ ...prev, [category]: null }));
    }
  };

  const updateEntryQuantity = (category, itemId, delta) => {
    setSelectedParts(prev => ({
      ...prev,
      [category]: (prev[category] || []).map(e => {
        if (e.item?.id !== itemId) return e;
        const next = Math.max(1, Math.min(MAX_QUANTITY, (Number(e.quantity) || 1) + delta));
        return { ...e, quantity: next };
      })
    }));
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
        <div className="max-w-[1500px] mx-auto px-2 md:px-4 lg:px-[100px]">
          <div className="grid grid-cols-5 gap-y-4 gap-x-1 lg:flex lg:items-center lg:justify-between lg:overflow-x-auto hide-scrollbar lg:gap-2">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const hasItem = step.category && (
                MULTI_SLOT_CATEGORIES.includes(step.category)
                  ? (selectedParts[step.category]?.length || 0) > 0
                  : selectedParts[step.category] != null
              );
              
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
                <div key={step.id} className="flex flex-col lg:flex-row items-center lg:justify-center gap-1 lg:gap-1.5 shrink-0 cursor-pointer text-center lg:text-left" onClick={() => setCurrentStep(step.id)}>
                  <div className={`w-7 h-7 lg:w-7 lg:h-7 rounded-full flex items-center justify-center font-bold text-[11px] lg:text-[12px] transition-colors mx-auto lg:mx-0 ${stepBg}`}>
                    {step.id}
                  </div>
                  <span className={`text-[10px] lg:text-[13px] leading-tight lg:leading-normal font-bold ${isActive ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                    {step.label}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="w-4 lg:w-4 xl:w-6 h-[2px] bg-[#E2E8F0] ml-1 hidden xl:block"></div>
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
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-rig-ai'))}
                    className="relative flex flex-col cursor-pointer items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-1 h-10 hover:brightness-110 transition-all flex-shrink-0 group overflow-visible" 
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
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
                    const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(activeCategory);
                    const isSelected = isMultiSlot
                      ? (selectedParts[activeCategory] || []).some(e => e.item?.id === item.id)
                      : selectedParts[activeCategory]?.id === item.id;
                    const isFull = isMultiSlot && (selectedParts[activeCategory]?.length || 0) >= MAX_ENTRIES;
                    
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
                              <p className="text-[13px] text-[#64748B]">{getTypeName(item.brand)} | {getTypeName(item.category).toUpperCase()}</p>
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
                              disabled={isSelected || (isMultiSlot && isFull)}
                              className={`font-bold py-2 px-4 text-[14px] transition-colors ${isSelected || (isMultiSlot && isFull) ? 'bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] opacity-60 cursor-not-allowed' : 'bg-[var(--color-primary)] border-2 border-[var(--color-primary)] text-white hover:opacity-90 cursor-pointer'}`}
                              style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                              {isMultiSlot ? (isSelected ? 'Added' : isFull ? 'Max 4 added' : 'Add to Build') : (isSelected ? 'Selected' : 'Add to Build')}
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

                {/* Selected parts list for multi-capable categories (RAM / Storage) */}
                {MULTI_SLOT_CATEGORIES.includes(activeCategory) && (
                  <div className="bg-white border border-[#CBD5E1] p-4 mt-4" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[14px] font-bold text-[#0F172A]">Selected {STEPS.find(s => s.category === activeCategory)?.label}</div>
                        <div className="text-[12px] text-[#64748B]">Add up to {MAX_ENTRIES} different {STEPS.find(s => s.category === activeCategory)?.label.toLowerCase()} parts (max {MAX_QUANTITY} of each)</div>
                      </div>
                      <span className="text-[13px] font-bold text-[var(--color-primary)] shrink-0 ml-2">{(selectedParts[activeCategory] || []).length}/{MAX_ENTRIES}</span>
                    </div>
                    {(selectedParts[activeCategory] || []).length === 0 ? (
                      <div className="text-[13px] text-[#64748B] py-2">No {STEPS.find(s => s.category === activeCategory)?.label.toLowerCase()} selected yet. Pick from the list above.</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {(selectedParts[activeCategory] || []).map(entry => {
                          const qty = Math.max(1, Number(entry.quantity) || 1);
                          return (
                            <div key={entry.item?.id} className="flex items-center gap-3 border border-[#E2E8F0] p-3" style={{ borderRadius: 'var(--radius-sm)' }}>
                              <div className="w-12 h-12 shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] p-1 flex items-center justify-center rounded">
                                <img src={entry.item?.image} alt={entry.item?.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="text-[13px] font-bold text-[#0F172A] truncate">{entry.item?.title}</div>
                                <div className="text-[12px] text-[#64748B]">{getTypeName(entry.item?.brand)}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => updateEntryQuantity(activeCategory, entry.item?.id, -1)}
                                  disabled={qty <= 1}
                                  className="w-8 h-8 flex items-center justify-center text-[18px] font-bold border border-[#CBD5E1] bg-white text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                                  style={{ borderRadius: 'var(--radius-sm)' }}
                                >−</button>
                                <span className="text-[16px] font-extrabold text-[#0F172A] w-7 text-center">{qty}</span>
                                <button
                                  onClick={() => updateEntryQuantity(activeCategory, entry.item?.id, 1)}
                                  disabled={qty >= MAX_QUANTITY}
                                  className="w-8 h-8 flex items-center justify-center text-[18px] font-bold border border-[#CBD5E1] bg-white text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                                  style={{ borderRadius: 'var(--radius-sm)' }}
                                >+</button>
                                <div className="w-[92px] text-right text-[14px] font-bold text-[#0F172A] whitespace-nowrap">{formatPrice((entry.item?.priceVal || 0) * qty)}</div>
                                <button
                                  onClick={() => handleRemovePart(activeCategory, entry.item?.id)}
                                  className="text-[#EF4444] hover:text-[#B91C1C] ml-1 cursor-pointer"
                                  title="Remove"
                                >
                                  <CloseIcon sx={{ fontSize: 18 }} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                    const value = selectedParts[step.category];
                    const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(step.category);
                    const entries = isMultiSlot ? (Array.isArray(value) ? value : []) : (value ? [{ item: value, quantity: 1 }] : []);
                    if (entries.length === 0) {
                      const isOptional = compatibility.optional && compatibility.optional.includes(step.category);
                      return (
                        <div key={step.id} className="flex flex-col sm:flex-row gap-4 items-center bg-[#F8FAFC] border border-[#CBD5E1] p-4" style={{ borderRadius: 'var(--radius-sm)' }}>
                          <div className="w-20 h-20 shrink-0 bg-white border border-[#E2E8F0] p-2 flex items-center justify-center rounded">
                            <div className="text-[12px] text-[#94A3B8] font-medium">Empty</div>
                          </div>
                          <div className="flex-grow text-center sm:text-left">
                            <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}</div>
                            {isOptional ? (
                              <div className="text-[14px] text-[#64748B] font-medium">Optional — not required for this build.</div>
                            ) : (
                              <div className="text-[14px] text-[#EF4444] font-medium">Missing Component! Please select a {step.label}.</div>
                            )}
                          </div>
                          <div className="text-[18px] font-bold text-[#0F172A] whitespace-nowrap">---</div>
                        </div>
                      );
                    }
                    return (
                      <div key={step.id} className="flex flex-col gap-3">
                        {entries.map((entry, i) => {
                          const item = entry.item;
                          const qty = Math.max(1, Number(entry.quantity) || 1);
                          return (
                            <div key={item?.id || i} className="flex flex-col sm:flex-row gap-4 items-center bg-[#F8FAFC] border border-[#CBD5E1] p-4" style={{ borderRadius: 'var(--radius-sm)' }}>
                              <div className="w-20 h-20 shrink-0 bg-white border border-[#E2E8F0] p-2 flex items-center justify-center rounded">
                                {item ? <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain mix-blend-multiply" /> : <div className="text-[12px] text-[#94A3B8] font-medium">Empty</div>}
                              </div>
                              <div className="flex-grow text-center sm:text-left">
                                <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}{qty > 1 ? ` × ${qty}` : ''}</div>
                                {item ? (
                                  <>
                                    <div className="text-[16px] font-bold text-[#0F172A]">{item.title || item.name}</div>
                                    <div className="text-[13px] text-[#64748B]">{item.brand?.name || item.brand || 'Generic'}</div>
                                  </>
                                ) : (
                                  <div className="text-[14px] text-[#EF4444] font-medium">Missing Component!</div>
                                )}
                              </div>
                              <div className="text-[18px] font-bold text-[#0F172A] whitespace-nowrap">
                                {item ? (typeof item.priceVal === 'number' ? formatPrice(item.priceVal * qty) : typeof item.price === 'number' ? formatPrice(item.price * qty) : item.price) : '---'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Compatibility Check */}
                <div className="mt-8">
                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-4">Compatibility Check</h3>
                  <div
                    className={`border p-4 text-[13px] font-medium ${compatibility.status === 'compatible' ? 'bg-[#E6F4EA] border-[#A8D5B5] text-[#137333]' : compatibility.status === 'incompatible' ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]' : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {compatibility.status === 'compatible' && (
                      <div className="flex items-center gap-2 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        All selected components are compatible.
                      </div>
                    )}
                    {compatibility.status === 'incompatible' && (
                      <>
                        <div className="font-bold mb-1">Compatibility Issues Found:</div>
                        <ul className="list-disc pl-5 flex flex-col gap-1">
                          {compatibility.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {compatibility.status === 'incomplete' && (
                      <div>{compatibility.issues[0]}</div>
                    )}
                  </div>
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
                  const value = selectedParts[step.category];
                  const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(step.category);
                  const entries = isMultiSlot ? (Array.isArray(value) ? value : []) : (value ? [{ item: value, quantity: 1 }] : []);
                  if (entries.length === 0) {
                    const isOptional = compatibility.optional && compatibility.optional.includes(step.category);
                    return (
                      <div key={step.id} className="flex justify-between items-start gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex-grow pr-2">
                          <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}</div>
                          {isOptional ? (
                            <div className="text-[13px] text-[#64748B] italic">Optional — not required for this build.</div>
                          ) : (
                            <div className="text-[13px] text-[#64748B] italic">Pending selection...</div>
                          )}
                        </div>
                        <div className="text-[14px] font-bold text-[#0F172A] whitespace-nowrap">---</div>
                      </div>
                    );
                  }
                  return entries.map((entry, i) => {
                    const item = entry.item;
                    const qty = Math.max(1, Number(entry.quantity) || 1);
                    return (
                      <div key={`${step.id}-${item?.id || i}`} className="flex justify-between items-start gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex-grow pr-2">
                          <div className="text-[14px] font-bold text-[#0052FF] mb-1">{step.label}{qty > 1 ? ` × ${qty}` : ''}</div>
                          {item ? (
                            <div className="text-[13px] text-[#0F172A] font-medium leading-tight cursor-pointer hover:text-[#0052FF]" onClick={() => setActivePopupItem(item)}>{item.title || item.name}</div>
                          ) : (
                            <div className="text-[13px] text-[#64748B] italic">Pending selection...</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1 mt-1">
                          <div className="text-[14px] font-bold text-[#0F172A] whitespace-nowrap">
                            {item ? (typeof item.priceVal === 'number' ? formatPrice(item.priceVal * qty) : typeof item.price === 'number' ? formatPrice(item.price * qty) : item.price) : '---'}
                          </div>
                          {item && (
                            <button onClick={() => handleRemovePart(step.category, item?.id)} className="text-[11px] text-[#EF4444] font-bold hover:underline cursor-pointer">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })}
              </div>

              {/* Compatibility Alert Box */}
              <div
                className={`mx-4 mb-4 p-3 border text-[13px] font-medium ${compatibility.status === 'compatible' ? 'bg-[#E6F4EA] border-[#A8D5B5] text-[#137333]' : compatibility.status === 'incompatible' ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]' : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {compatibility.status === 'compatible' && (
                  <span className="font-bold">All selected components are compatible.</span>
                )}
                {compatibility.status === 'incompatible' && (
                  <>
                    <div className="font-bold mb-1">Compatibility Issues Found:</div>
                    <ul className="list-disc pl-4 flex flex-col gap-1">
                      {compatibility.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </>
                )}
                {compatibility.status === 'incomplete' && (
                  <span>{compatibility.issues[0]}</span>
                )}
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
                    onClick={handleSaveBuild}
                    disabled={incompleteBlocked}
                    className={`w-full bg-[var(--color-primary)] text-white font-bold py-3 px-4 flex items-center justify-center transition-opacity ${incompleteBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    title={incompleteBlocked ? 'Select all required components to save this build' : undefined}
                  >
                    {incompleteBlocked ? 'Complete Required Parts' : 'Add Build'}
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
                <div className="text-[13px] font-bold text-[#0052FF] mb-2">{getTypeName(activePopupItem.brand)} | {getTypeName(activePopupItem.category)?.toUpperCase()}</div>
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

      {/* Success Popup */}
      <AnimatePresence>
        {buildPopupMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 z-[200] bg-white px-8 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-3 border border-[#E2E8F0]"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <div className="w-14 h-14 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A]">{buildPopupMessage}</h3>
            <p className="text-[14px] text-[#64748B]">You can view your custom build in your profile.</p>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default BuilderWorkspace;
