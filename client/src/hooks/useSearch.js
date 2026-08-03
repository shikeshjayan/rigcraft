import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/search.service';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/recentSearches';

export const RECENT_SEARCHES_KEY = 'rigcraft_recent_searches';

export const SEARCH_SECTIONS = [
  {
    key: 'products',
    label: 'Products',
    link: (item) => `/detail/${item.slug || item.id}`,
    primary: (item) => item.name,
    secondary: (item) => item.sku,
    price: (item) => item.salePrice || item.price,
    image: (item) => item.image,
    badge: () => 'Product',
  },
  {
    key: 'prebuiltPCs',
    label: 'Prebuilt PCs',
    link: (item) => `/detail/${item.slug || item.id}?type=prebuilt`,
    primary: (item) => item.name,
    secondary: (item) => item.sku,
    price: (item) => item.pricing?.salePrice || item.pricing?.price,
    image: (item) => item.image,
    badge: () => 'Prebuilt PC',
  },
  {
    key: 'categories',
    label: 'Categories',
    link: () => `/components`,
    primary: (item) => item.name,
  },
  {
    key: 'brands',
    label: 'Brands',
    link: (item) => `/components?brand=${encodeURIComponent(item.name)}`,
    primary: (item) => item.name,
  },
  {
    key: 'deals',
    label: 'Deals',
    link: () => `/deals`,
    primary: (item) => item.title,
  },
];

export const useSearch = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches(RECENT_SEARCHES_KEY));
  const [activeIndex, setActiveIndex] = useState(-1);

  const desktopRef = useRef(null);
  const mobileRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (desktopRef.current && !desktopRef.current.contains(event.target)) &&
        (mobileRef.current ? !mobileRef.current.contains(event.target) : true)
      ) {
        setShowSearchResults(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      const q = searchQuery.trim();
      if (q.length < 3) {
        setSearchResults({});
        setActiveIndex(-1);
        return;
      }
      const requestId = ++searchRequestIdRef.current;
      setIsSearching(true);
      try {
        const data = await searchService.public(q);
        if (requestId !== searchRequestIdRef.current) return;
        setSearchResults(data || {});
        setActiveIndex(-1);
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) return;
        console.error("Search failed:", error);
        setSearchResults({});
      } finally {
        if (requestId === searchRequestIdRef.current) setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const closeResults = useCallback(() => {
    setShowSearchResults(false);
    setActiveIndex(-1);
  }, []);

  const executeSearch = (term) => {
    const q = (term ?? searchQuery).trim();
    if (!q) return;
    navigate(`/components?search=${encodeURIComponent(q)}`);
    addRecentSearch(RECENT_SEARCHES_KEY, q);
    setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY));
    setShowSearchResults(false);
    setMobileSearchOpen(false);
    setActiveIndex(-1);
  };

  const recordSearchAndNavigate = (path) => {
    const q = searchQuery.trim();
    if (q) addRecentSearch(RECENT_SEARCHES_KEY, q);
    setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY));
    setShowSearchResults(false);
    setSearchQuery('');
    setMobileSearchOpen(false);
    setActiveIndex(-1);
    navigate(path);
  };

  const handleClearRecents = () => {
    clearRecentSearches(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
    setActiveIndex(-1);
  };

  const buildRows = () => {
    const q = searchQuery.trim();
    const rowsArr = [];
    if (q.length >= 3) {
      SEARCH_SECTIONS.forEach((s) => {
        (searchResults?.[s.key] || []).forEach((item) => {
          rowsArr.push({
            key: `${s.key}-${item.id || item.slug}`,
            action: () => recordSearchAndNavigate(s.link(item)),
          });
        });
      });
      rowsArr.push({
        key: 'view-all',
        action: () => executeSearch(q),
      });
    } else if (recentSearches.length > 0) {
      recentSearches.forEach((term) => {
        rowsArr.push({
          key: `recent-${term}`,
          action: () => executeSearch(term),
        });
      });
    }
    return rowsArr;
  };

  const handleSearchKeyDown = (e) => {
    const rowsArr = buildRows();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowsArr.length === 0) return;
      setActiveIndex((prev) => {
        if (prev === -1) return e.key === 'ArrowDown' ? 0 : rowsArr.length - 1;
        const next = e.key === 'ArrowDown' ? prev + 1 : prev - 1;
        if (next >= rowsArr.length) return 0;
        if (next < 0) return rowsArr.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && rowsArr[activeIndex]) {
        e.preventDefault();
        rowsArr[activeIndex].action();
      } else if (searchQuery.trim()) {
        e.preventDefault();
        executeSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchResults(false);
      setActiveIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setActiveIndex(-1);
    setShowSearchResults(true);
  };

  const handleFocus = () => {
    if (searchQuery || recentSearches.length > 0) setShowSearchResults(true);
  };

  return {
    searchQuery,
    handleInputChange,
    handleFocus,
    handleSearchKeyDown,
    executeSearch,
    recordSearchAndNavigate,
    handleClearRecents,
    showSearchResults,
    isSearching,
    searchResults,
    recentSearches,
    activeIndex,
    setActiveIndex,
    closeResults,
    desktopRef,
    mobileRef,
    mobileSearchOpen,
    setMobileSearchOpen,
  };
};
