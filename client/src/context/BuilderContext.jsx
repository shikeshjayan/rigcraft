/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { BUILDER_CATEGORIES, normalizeDraftBuild } from '../utils/builderProducts';
import { validateBuilderBuild, estimateWattage } from '../utils/builderCompatibility';

export const STEPS = [
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

export const MULTI_SLOT_CATEGORIES = ['ram', 'ssd'];
export const MAX_QUANTITY = 4;
export const MAX_ENTRIES = 4;

const EMPTY_PARTS = {
  cpu: null,
  motherboard: null,
  ram: [],
  ssd: [],
  gpu: null,
  cabinet: null,
  psu: null,
  cooling: null
};

const RECENT_STORAGE_KEY = 'rigcraft_builder_recent';
const RECENT_MAX = 8;

// Maps the compatibility engine's slot names onto selectedParts keys
const SLOT_KEY_MAP = { storage: 'ssd', cooler: 'cooling' };

const BuilderContext = createContext(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};

export const BuilderProvider = ({ children }) => {
  const [selectedParts, setSelectedParts] = useState(EMPTY_PARTS);
  const [currentStep, setCurrentStep] = useState(1);
  const [assemblyMode, setAssemblyMode] = useState('parts');
  const [builderSettings, setBuilderSettings] = useState({
    enabled: true,
    assemblyFeeEnabled: false,
    assemblyFeeType: 'percent',
    assemblyFeeValue: 0.5,
    requireCompleteBuild: true
  });
  const [recentViewed, setRecentViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Restore a draft build passed via navigation state or localStorage
  /* eslint-disable react-hooks/set-state-in-effect */
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

    setSelectedParts(prev => ({ ...prev, ...wrappedDraftBuild }));
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

  // Fetch builder settings (assembly fee, completeness requirement)
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

  // Persist recently viewed components
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentViewed));
    } catch {
      // ignore storage failures
    }
  }, [recentViewed]);

  const recordRecent = useCallback((item) => {
    if (!item || !item.id) return;
    setRecentViewed(prev => [item, ...prev.filter(r => r.id !== item.id)].slice(0, RECENT_MAX));
  }, []);

  // Slot capacity for multi-slot categories, driven by the selected
  // motherboard's specs (maxMemorySlots / storageSlots). Falls back to
  // MAX_ENTRIES when the motherboard or its slot data is unknown.
  const getSlotLimitForCategory = useCallback((category) => {
    const mb = selectedParts.motherboard;
    const key = category === 'ram' ? 'maxMemorySlots' : category === 'ssd' ? 'storageSlots' : null;
    if (key && mb?.compatibility?.[key] != null && mb.compatibility[key] !== '') {
      const n = Math.floor(Number(mb.compatibility[key]));
      if (Number.isFinite(n) && n >= 1 && n <= 8) return n;
    }
    return MAX_ENTRIES;
  }, [selectedParts.motherboard]);

  const getCategoryUnits = useCallback((category) => {
    const entries = selectedParts[category];
    if (!Array.isArray(entries)) return 0;
    return entries.reduce((sum, e) => sum + (Math.max(1, Number(e.quantity) || 1)), 0);
  }, [selectedParts]);

  const slotLimits = useMemo(() => ({
    ram: getSlotLimitForCategory('ram'),
    ssd: getSlotLimitForCategory('ssd'),
  }), [getSlotLimitForCategory]);

  const selectPart = useCallback((item) => {
    recordRecent(item);
    const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(item.category);

    // Auto-advance like single-slot once a multi-slot category is full
    // (reaches its motherboard slot capacity). Quantity bumps never trigger it.
    const shouldAdvance = !isMultiSlot
      ? true
      : (() => {
          const entries = selectedParts[item.category] || [];
          const existing = entries.some(e => e.item?.id === item.id);
          const totalUnits = entries.reduce((s, e) => s + (Math.max(1, Number(e.quantity) || 1)), 0);
          const slotLimit = getSlotLimitForCategory(item.category);
          return !existing && entries.length < MAX_ENTRIES && totalUnits + 1 === slotLimit;
        })();

    if (shouldAdvance) {
      const stepObj = STEPS.find(s => s.category === item.category);
      if (stepObj && stepObj.id < 9) {
        setCurrentStep(stepObj.id + 1);
      }
    }

    setSelectedParts(prev => {
      if (isMultiSlot) {
        const entries = prev[item.category] || [];
        const existing = entries.find(e => e.item?.id === item.id);
        const slotLimit = getSlotLimitForCategory(item.category);
        const totalUnits = entries.reduce((s, e) => s + (Math.max(1, Number(e.quantity) || 1)), 0);
        if (existing) {
          const qty = Math.max(1, Number(existing.quantity) || 1);
          const nextQty = Math.min(MAX_QUANTITY, slotLimit - (totalUnits - qty), qty + 1);
          if (nextQty <= qty) return prev;
          return {
            ...prev,
            [item.category]: entries.map(e =>
              e.item?.id === item.id ? { ...e, quantity: nextQty } : e
            )
          };
        }
        if (entries.length < MAX_ENTRIES && totalUnits + 1 <= slotLimit) {
          return { ...prev, [item.category]: [...entries, { item, quantity: 1 }] };
        }
        return prev;
      }
      return { ...prev, [item.category]: item };
    });
  }, [recordRecent, selectedParts, getSlotLimitForCategory]);

  const removePart = useCallback((category, itemId) => {
    setSelectedParts(prev => {
      if (MULTI_SLOT_CATEGORIES.includes(category)) {
        return {
          ...prev,
          [category]: (prev[category] || []).filter(e => e.item?.id !== itemId)
        };
      }
      return { ...prev, [category]: null };
    });
  }, []);

  const updateEntryQuantity = useCallback((category, itemId, delta) => {
    setSelectedParts(prev => {
      const entries = prev[category] || [];
      const slotLimit = getSlotLimitForCategory(category);
      const totalUnits = entries.reduce((s, e) => s + (Math.max(1, Number(e.quantity) || 1)), 0);
      return {
        ...prev,
        [category]: entries.map(e => {
          if (e.item?.id !== itemId) return e;
          const qty = Math.max(1, Number(e.quantity) || 1);
          if (delta > 0) {
            const next = Math.min(MAX_QUANTITY, qty + delta, slotLimit - (totalUnits - qty));
            if (next <= qty) return e;
            return { ...e, quantity: next };
          }
          return { ...e, quantity: Math.max(1, qty + delta) };
        })
      };
    });
  }, [getSlotLimitForCategory]);

  const resetBuild = useCallback(() => {
    setSelectedParts(EMPTY_PARTS);
    setCurrentStep(1);
  }, []);

  // Derived: pricing
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

  const isSlotFilled = useCallback((type) => {
    const key = SLOT_KEY_MAP[type] || type;
    const value = selectedParts[key];
    if (MULTI_SLOT_CATEGORIES.includes(key)) return Array.isArray(value) && value.length > 0;
    return value != null;
  }, [selectedParts]);

  const progressPercent = useMemo(() => {
    const required = compatibility.required || [];
    if (required.length === 0) return 0;
    const filled = required.filter(type => isSlotFilled(type)).length;
    return Math.round((filled / required.length) * 100);
  }, [compatibility, isSlotFilled]);

  const value = useMemo(() => ({
    selectedParts,
    currentStep,
    setCurrentStep,
    assemblyMode,
    setAssemblyMode,
    builderSettings,
    recentViewed,
    selectPart,
    removePart,
    updateEntryQuantity,
    resetBuild,
    basePrice,
    assemblyFee,
    totalPrice,
    estWattage,
    compatibility,
    incompleteBlocked,
    progressPercent,
    isSlotFilled,
    slotLimits,
    getCategoryUnits
  }), [
    selectedParts, currentStep, assemblyMode, builderSettings, recentViewed,
    selectPart, removePart, updateEntryQuantity, resetBuild,
    basePrice, assemblyFee, totalPrice, estWattage, compatibility,
    incompleteBlocked, progressPercent, isSlotFilled,
    slotLimits, getCategoryUnits
  ]);

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};
