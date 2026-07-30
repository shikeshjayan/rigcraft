import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Grid, Typography, Switch as MuiSwitch, Autocomplete, TextField, Chip,
} from "@mui/material";
import AdminInput from "../common/Input";
import AdminButton from "../common/Button";
import { productService } from "../../services/productService";
import { prebuiltService } from "../../services/prebuiltService";
import { useDebounce } from "../../hooks/useDebounce";

const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  products: z.array(z.any()).optional().default([]),
  prebuiltPCs: z.array(z.any()).optional().default([]),
  promotion: z.object({
    topBar: z.object({
      enabled: z.boolean().optional().default(false),
      text: z.string().max(200).optional().default(""),
    }).optional().default({}),
    homeOffer: z.object({
      enabled: z.boolean().optional().default(false),
      title: z.string().max(200).optional().default(""),
      description: z.string().max(500).optional().default(""),
    }).optional().default({}),
  }).optional().default({}),
});



const DealForm = ({ defaultValues, onSubmit, loading, submitLabel = "Create Deal" }) => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      products: [],
      prebuiltPCs: [],
      promotion: { topBar: { enabled: false, text: "" }, homeOffer: { enabled: false, title: "", description: "" } },
      ...defaultValues,
    },
  });

  const [productOptions, setProductOptions] = useState([]);
  const [prebuiltOptions, setPrebuiltOptions] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [prebuiltSearch, setPrebuiltSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const debouncedPrebuiltSearch = useDebounce(prebuiltSearch, 300);

  const selectedProducts = watch("products") || [];
  const selectedPrebuiltPCs = watch("prebuiltPCs") || [];

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await productService.list({ search: debouncedProductSearch, pageSize: 100, page: 0 });
      if (active) setProductOptions(result.data);
    })();
    return () => { active = false; };
  }, [debouncedProductSearch]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await prebuiltService.list({ search: debouncedPrebuiltSearch, pageSize: 100, page: 0 });
      if (active) setPrebuiltOptions(result.data);
    })();
    return () => { active = false; };
  }, [debouncedPrebuiltSearch]);

  const handleProductChange = useCallback((_, value) => {
    setValue("products", value, { shouldValidate: true });
  }, [setValue]);

  const handlePrebuiltChange = useCallback((_, value) => {
    setValue("prebuiltPCs", value, { shouldValidate: true });
  }, [setValue]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Section 1 - Basic Information */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Basic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <AdminInput label="Title" required error={!!errors.title} helperText={errors.title?.message} {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <AdminInput label="Description" multiline rows={3} error={!!errors.description} helperText={errors.description?.message} {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 2 - Countdown */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Countdown Timer
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <AdminInput label="Start Date" type="datetime-local" required error={!!errors.startDate} helperText={errors.startDate?.message} {...field} InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <AdminInput label="End Date" type="datetime-local" required error={!!errors.endDate} helperText={errors.endDate?.message} {...field} InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 3 - Featured Products */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Featured Products
        </Typography>
        <Autocomplete
          multiple
          options={productOptions}
          value={selectedProducts}
          onChange={handleProductChange}
          onInputChange={(_, v) => setProductSearch(v)}
          getOptionLabel={(option) => option.name || ""}
          isOptionEqualToValue={(option, value) => (option.id || option._id) === (value.id || value._id)}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField {...params} label="Search products by name or SKU" placeholder="Type to search..." size="small" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} size="small" {...getTagProps({ index })} />
            ))
          }
        />
      </Box>

      {/* Section 4 - Featured Prebuilt PCs */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Featured Prebuilt PCs
        </Typography>
        <Autocomplete
          multiple
          options={prebuiltOptions}
          value={selectedPrebuiltPCs}
          onChange={handlePrebuiltChange}
          onInputChange={(_, v) => setPrebuiltSearch(v)}
          getOptionLabel={(option) => option.name || ""}
          isOptionEqualToValue={(option, value) => (option.id || option._id) === (value.id || value._id)}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField {...params} label="Search prebuilt PCs" placeholder="Type to search..." size="small" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} size="small" {...getTagProps({ index })} />
            ))
          }
        />
      </Box>

      {/* Section 5 - Promotion */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Promotion
        </Typography>

        {/* Top Bar */}
        <Box sx={{ mb: 3, p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
            Top Announcement Bar
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Enable</Typography>
                <Controller
                  name="promotion.topBar.enabled"
                  control={control}
                  render={({ field }) => (
                    <MuiSwitch
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-success)" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-success)" } }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller
                name="promotion.topBar.text"
                control={control}
                render={({ field }) => (
                  <AdminInput label="Announcement Text" placeholder="🎉 Free Shipping Above ₹999" {...field} />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Homepage Offer */}
        <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
            Homepage Offer Section
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Enable</Typography>
                <Controller
                  name="promotion.homeOffer.enabled"
                  control={control}
                  render={({ field }) => (
                    <MuiSwitch
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-success)" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-success)" } }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller
                name="promotion.homeOffer.title"
                control={control}
                render={({ field }) => (
                  <AdminInput label="Offer Title" placeholder="Weekend Mega Sale" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="promotion.homeOffer.description"
                control={control}
                render={({ field }) => (
                  <AdminInput label="Offer Description" placeholder="Up to 30% OFF Gaming Accessories" {...field} />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 3, borderTop: "1px solid var(--color-admin-border)" }}>
        <AdminButton variant="secondary" type="button" onClick={() => window.history.back()}>Cancel</AdminButton>
        <AdminButton variant="primary" type="submit" loading={loading}>{submitLabel}</AdminButton>
      </Box>
    </Box>
  );
};

export default DealForm;
