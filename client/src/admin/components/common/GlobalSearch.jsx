import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Divider, CircularProgress, IconButton, useTheme, useMediaQuery } from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandingWatermarkIcon,
  Computer as ComputerIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  RateReview as RateReviewIcon,
  Campaign as CampaignIcon,
  Discount as DiscountIcon,
  HeadsetMic as HeadsetMicIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import { searchService } from "../../services/searchService";
import { getRecentSearches, addRecentSearch, clearRecentSearches } from "../../../utils/recentSearches";

const RECENT_SEARCHES_KEY = "rigcraft_admin_recent_searches";

const MODULES = [
  {
    key: "products",
    label: "Products",
    icon: InventoryIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/products/${id}`,
    primary: (i) => i.name,
    secondary: (i) => i.sku,
  },
  {
    key: "categories",
    label: "Categories",
    icon: CategoryIcon,
    roles: ["admin", "manager"],
    path: () => "/admin/categories",
    primary: (i) => i.name,
  },
  {
    key: "brands",
    label: "Brands",
    icon: BrandingWatermarkIcon,
    roles: ["admin", "manager"],
    path: () => "/admin/brands",
    primary: (i) => i.name,
  },
  {
    key: "prebuiltPCs",
    label: "Prebuilt PCs",
    icon: ComputerIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/prebuilt/${id}`,
    primary: (i) => i.name,
    secondary: (i) => i.sku,
  },
  {
    key: "orders",
    label: "Orders",
    icon: ReceiptIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/orders/${id}`,
    primary: (i) => i.orderNumber,
    secondary: (i) => i.customer?.name || i.customer?.email,
  },
  {
    key: "customers",
    label: "Customers",
    icon: PeopleIcon,
    roles: ["admin"],
    path: (id) => `/admin/users/${id}`,
    primary: (i) => i.name,
    secondary: (i) => i.email,
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: RateReviewIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/reviews/${id}`,
    primary: (i) => i.title || i.text,
    secondary: (i) => i.author,
  },
  {
    key: "deals",
    label: "Deals",
    icon: CampaignIcon,
    roles: ["admin", "manager"],
    path: () => "/admin/deals",
    primary: (i) => i.title,
  },
  {
    key: "coupons",
    label: "Coupons",
    icon: DiscountIcon,
    roles: ["admin"],
    path: () => "/admin/coupons",
    primary: (i) => i.code,
    secondary: (i) => i.name,
  },
  {
    key: "supportTickets",
    label: "Support Tickets",
    icon: HeadsetMicIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/support/${id}`,
    primary: (i) => i.ticketNumber,
    secondary: (i) => i.subject,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    icon: MailIcon,
    roles: ["admin", "manager"],
    path: () => "/admin/newsletter",
    primary: (i) => i.email,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: NotificationsIcon,
    roles: ["admin", "manager"],
    path: (id) => `/admin/notifications/${id}`,
    primary: (i) => i.title,
    secondary: (i) => i.message,
  },
];

const GlobalSearch = () => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches(RECENT_SEARCHES_KEY));
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const searchTimer = useRef(null);

  const allowedModules = MODULES.filter((m) => !role || m.roles.includes(role));

  const runSearch = useCallback(async (value) => {
    if (value.trim().length < 3) {
      setResults({});
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchService.admin(value.trim());
      setResults(data || {});
    } catch {
      setError("Search failed. Please try again.");
      setResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(searchTimer.current);
  }, [query, runSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleSections = allowedModules.filter((m) => (results[m.key] || []).length > 0);
  const hasResults = visibleSections.length > 0;

  const handleSelect = (module, item) => {
    addRecentSearch(RECENT_SEARCHES_KEY, query);
    setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY));
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
    setResults({});
    setActiveIndex(-1);
    navigate(module.path(item.id));
  };

  const runRecent = (term) => {
    setQuery(term);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleClearRecents = () => {
    clearRecentSearches(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setMobileOpen(false);
      setActiveIndex(-1);
      return;
    }
    const q = query.trim();
    const rows = [];
    if (q.length >= 3) {
      visibleSections.forEach((m) => {
        (results[m.key] || []).forEach((item) => rows.push({ module: m, item }));
      });
    } else if (recentSearches.length > 0) {
      recentSearches.forEach((term) => rows.push({ recent: term }));
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (rows.length === 0) return;
      setActiveIndex((prev) => {
        if (prev === -1) return e.key === "ArrowDown" ? 0 : rows.length - 1;
        const next = e.key === "ArrowDown" ? prev + 1 : prev - 1;
        if (next >= rows.length) return 0;
        if (next < 0) return rows.length - 1;
        return next;
      });
    } else if (e.key === "Enter" && activeIndex >= 0 && rows[activeIndex]) {
      e.preventDefault();
      const target = rows[activeIndex];
      if (target.recent) {
        runRecent(target.recent);
      } else {
        handleSelect(target.module, target.item);
      }
    }
  };

  const handleInputChange = (value) => {
    setQuery(value);
    setActiveIndex(-1);
    if (value.trim().length >= 3 || recentSearches.length > 0) setOpen(true);
  };

  const renderDropdown = (mobile) => (
    <Box
      sx={{
        ...(mobile
          ? { width: "100%", mt: 1 }
          : { position: "absolute", top: "calc(100% + 8px)", right: 0, width: 420, maxWidth: "calc(100vw - 24px)", zIndex: 50 }),
        maxHeight: mobile ? "calc(100vh - 140px)" : 480,
        borderRadius: "var(--radius-admin-card, 12px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid var(--color-admin-border, #E5E7EB)",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "var(--color-admin-text, #111827)" }}>
          Search results
        </Typography>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 100 }}>
        {query.trim().length < 3 ? (
          recentSearches.length > 0 ? (
            <Box>
              <Box sx={{ px: 2, pt: 1.25, pb: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--color-admin-muted, #9CA3AF)",
                  }}
                >
                  Recent searches
                </Typography>
                <button
                  onClick={handleClearRecents}
                  className="text-xs font-bold cursor-pointer"
                  style={{
                    color: "var(--color-admin-primary, #2563EB)",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Clear
                </button>
              </Box>
              {recentSearches.map((term, idx) => (
                <Box
                  key={`recent-${term}`}
                  onClick={() => runRecent(term)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  sx={{
                    px: 2,
                    py: 1,
                    mx: 1,
                    borderRadius: "var(--radius-admin-input, 8px)",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    backgroundColor: idx === activeIndex ? "var(--color-admin-bg-tertiary, #F9FAFB)" : "transparent",
                    "&:hover": { backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-admin-text, #111827)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {term}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ fontSize: 13, color: "var(--color-admin-muted, #9CA3AF)" }}>
                Type at least 3 characters
              </Typography>
            </Box>
          )
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ fontSize: 13, color: "var(--color-admin-muted, #9CA3AF)" }}>
              {error}
            </Typography>
            <button
              onClick={() => runSearch(query)}
              className="text-xs font-bold mt-2 cursor-pointer"
              style={{
                color: "var(--color-admin-primary, #2563EB)",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Try again
            </button>
          </Box>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: "var(--color-admin-muted, #9CA3AF)" }} />
          </Box>
        ) : !hasResults ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ fontSize: 13, color: "var(--color-admin-muted, #9CA3AF)", fontWeight: 500 }}>
              No results found for "{query.trim()}"
            </Typography>
          </Box>
        ) : (
          (() => {
            let flatIndex = 0;
            return visibleSections.map((module, idx) => {
              const Icon = module.icon;
              const items = results[module.key];
              return (
                <Box key={module.key}>
                  {idx > 0 && <Divider sx={{ mx: 2 }} />}
                  <Box sx={{ px: 2, pt: 1.25, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: 14, color: "var(--color-admin-muted, #9CA3AF)" }} />
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--color-admin-muted, #9CA3AF)",
                      }}
                    >
                      {module.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "var(--color-admin-muted, #9CA3AF)", ml: "auto" }}>
                      {items.length}
                    </Typography>
                  </Box>
                  {items.map((item) => {
                    const itemIdx = flatIndex++;
                    return (
                      <Box
                        key={item.id}
                        onClick={() => handleSelect(module, item)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                        sx={{
                          px: 2,
                          py: 1,
                          mx: 1,
                          borderRadius: "var(--radius-admin-input, 8px)",
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                          backgroundColor: itemIdx === activeIndex ? "var(--color-admin-bg-tertiary, #F9FAFB)" : "transparent",
                          "&:hover": { backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)" },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-admin-text, #111827)",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {module.primary(item)}
                        </Typography>
                        {module.secondary && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "var(--color-admin-text-secondary, #6B7280)",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {module.secondary(item)}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            });
          })()
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Box ref={rootRef} sx={{ position: "relative" }}>
        <IconButton
          size="small"
          aria-label="Search"
          onClick={() => {
            setMobileOpen(true);
            setOpen(true);
          }}
          sx={{
            color: "var(--color-admin-text-secondary, #6B7280)",
            p: 0.75,
            "&:hover": { backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)" },
          }}
        >
          <SearchIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {mobileOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              px: 2,
              py: 1.5,
              backgroundColor: "var(--color-admin-header, #FFFFFF)",
              borderBottom: "1px solid var(--color-admin-border, #E5E7EB)",
              boxShadow: "var(--shadow-admin-header, 0 1px 2px rgba(0,0,0,0.06))",
              zIndex: 1200,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                height: 40,
                borderRadius: "var(--radius-admin-input, 8px)",
                border: "1px solid var(--color-admin-primary, #2563EB)",
                backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)",
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: "var(--color-admin-muted, #9CA3AF)", flexShrink: 0 }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search anything..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-admin-text, #111827)",
                  fontFamily: "inherit",
                }}
              />
              {loading && <CircularProgress size={14} sx={{ color: "var(--color-admin-muted, #9CA3AF)", flexShrink: 0 }} />}
              <IconButton
                size="small"
                onClick={() => {
                  setMobileOpen(false);
                  setOpen(false);
                  setQuery("");
                  setResults({});
                  setActiveIndex(-1);
                }}
                sx={{ color: "var(--color-admin-muted, #9CA3AF)", flexShrink: 0 }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            {open && renderDropdown(true)}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box ref={rootRef} sx={{ position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          height: 40,
          width: { md: 300, lg: 360, xl: 420 },
          borderRadius: "var(--radius-admin-input, 8px)",
          border: "1px solid transparent",
          backgroundColor: "var(--color-admin-bg-tertiary, #F9FAFB)",
          transition: "background-color 0.15s, border-color 0.15s, box-shadow 0.15s",
          "&:focus-within": {
            backgroundColor: "#FFFFFF",
            borderColor: "var(--color-admin-primary, #2563EB)",
            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
          },
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "var(--color-admin-muted, #9CA3AF)", flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (recentSearches.length > 0 || query.trim().length >= 3) setOpen(true);
          }}
          placeholder="Search anything..."
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-admin-text, #111827)",
            fontFamily: "inherit",
          }}
        />
        {loading && <CircularProgress size={14} sx={{ color: "var(--color-admin-muted, #9CA3AF)", flexShrink: 0 }} />}
      </Box>

      {open && renderDropdown(false)}
    </Box>
  );
};

export default GlobalSearch;
