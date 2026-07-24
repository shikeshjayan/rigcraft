import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box,
} from "@mui/material";
import AdminButton from "../common/Button";
import { productService } from "../../services/productService";

const ComponentSelector = ({ open, onClose, onSelect, categoryType, excludeIds = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && categoryType) {
      setLoading(true);
      productService.list({ page: 0, pageSize: 50, categoryType, search })
        .then((res) => {
          setProducts(res.data.filter((p) => !excludeIds.includes(p.id)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, categoryType, search, excludeIds]);

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
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", textAlign: "center", py: 4 }}>Loading...</Typography>
        ) : products.length === 0 ? (
          <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", textAlign: "center", py: 4 }}>No products found</Typography>
        ) : (
          <List disablePadding>
            {products.map((p) => (
              <ListItem key={p.id} disablePadding>
                <ListItemButton onClick={() => onSelect(p)} sx={{ borderRadius: "var(--radius-admin-badge)", mb: 0.5 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "var(--color-admin-bg-tertiary)", color: "var(--color-admin-text)", fontSize: "0.75rem" }}>
                      {p.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={p.name}
                    secondary={`SKU: ${p.sku} - $${p.price.toFixed(2)}`}
                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AdminButton variant="secondary" size="small" onClick={onClose}>Cancel</AdminButton>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentSelector;
