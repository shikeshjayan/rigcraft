import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress,
} from "@mui/material";
import AdminButton from "../common/Button";
import { productService } from "../../services/productService";

const ComponentSelector = ({ open, onClose, onSelect, categoryType, excludeIds = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open || !categoryType) return;
    setPage(0);
    setProducts([]);
    setTotal(0);
    fetchPage(0, true);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [open, categoryType]);

  useEffect(() => {
    if (!open || !categoryType) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setProducts([]);
      setTotal(0);
      fetchPage(0, true);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchPage = async (pageNum, reset) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await productService.list({ page: pageNum, pageSize: 50, categoryType, search, isActive: "true" });
      setProducts(prev => reset ? (res.data || []) : [...prev, ...(res.data || [])]);
      setTotal(res.total ?? 0);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, false);
  };

  const visibleProducts = products.filter((p) => !excludeIds.includes(p.id));
  const displayPrice = (p) => `₹${Number(p.regularPrice ?? p.price ?? 0).toFixed(2)}`;
  const hasMore = products.length < total;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: "var(--color-admin-text)" }}>
        Select {categoryType ? categoryType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Component"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1, mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "var(--radius-admin-input)" } }}
        />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : visibleProducts.length === 0 ? (
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", textAlign: "center", py: 4 }}>No products found</Typography>
        ) : (
          <>
            <List disablePadding>
              {visibleProducts.map((p) => (
                <ListItem key={p.id} disablePadding>
                  <ListItemButton onClick={() => onSelect(p)} sx={{ borderRadius: "var(--radius-admin-badge)", mb: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "var(--color-admin-bg-tertiary)", color: "var(--color-admin-text)", fontSize: "0.75rem" }}>
                        {p.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={p.name}
                      secondary={`SKU: ${p.sku} - ${displayPrice(p)}`}
                      primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {hasMore && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <AdminButton variant="ghost" size="small" onClick={handleLoadMore} loading={loadingMore}>
                  Load More ({products.length} of {total})
                </AdminButton>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AdminButton variant="secondary" size="small" onClick={onClose}>Cancel</AdminButton>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentSelector;
