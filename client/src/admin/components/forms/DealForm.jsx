import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Grid, Typography, Switch as MuiSwitch, Autocomplete, TextField, Chip, IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import AdminInput from "../common/Input";
import AdminButton from "../common/Button";
import ImageUpload from "../common/ImageUpload";
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
  desktopBanner: z.any().optional(),
  mobileBanner: z.any().optional(),
  isFeatured: z.boolean().optional().default(false),
  promotion: z.object({
    topBar: z.array(z.object({
      enabled: z.boolean().optional().default(false),
      text: z.string().max(200).optional().default(""),
    })).optional().default([]),
    homeOffer: z.array(z.object({
      enabled: z.boolean().optional().default(false),
      title: z.string().max(200).optional().default(""),
      description: z.string().max(500).optional().default(""),
      banner: z.any().optional(),
    })).optional().default([]),
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
      desktopBanner: null,
      mobileBanner: null,
      isFeatured: false,
      promotion: { topBar: [], homeOffer: [] },
      ...defaultValues,
    },
  });

  const topBarArray = useFieldArray({ control, name: "promotion.topBar" });
  const homeOfferArray = useFieldArray({ control, name: "promotion.homeOffer" });

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
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Featured as Main Deal</Typography>
              <Controller
                name="isFeatured"
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
        </Grid>
      </Box>

      {/* Section 2 - Main Deal Images */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Main Deal Images
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--color-admin-text)", fontWeight: 600 }}>Desktop Banner</Typography>
            <Controller
              name="desktopBanner"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  images={field.value ? [field.value] : []}
                  onChange={(files) => field.onChange(files[0] || null)}
                  maxFiles={1}
                  multiple={false}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--color-admin-text)", fontWeight: 600 }}>Mobile Banner</Typography>
            <Controller
              name="mobileBanner"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  images={field.value ? [field.value] : []}
                  onChange={(files) => field.onChange(files[0] || null)}
                  maxFiles={1}
                  multiple={false}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 3 - Countdown */}
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

      {/* Section 4 - Featured Products */}
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

      {/* Section 5 - Featured Prebuilt PCs */}
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

      {/* Section 6 - Promotion */}
      <Box sx={{ p: 3, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "var(--color-admin-text)" }}>
          Promotions
        </Typography>

        {/* Top Bar Announcements */}
        <Box sx={{ mb: 3, p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "var(--color-admin-text)", fontWeight: 600 }}>
              Top Announcement Bar
            </Typography>
            <AdminButton variant="ghost" size="small" icon={<AddIcon />} onClick={() => topBarArray.append({ enabled: true, text: "" })}>
              Add Announcement
            </AdminButton>
          </Box>
          {topBarArray.fields.length === 0 && (
            <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", mb: 1 }}>
              No announcements yet — the navbar bar will be hidden.
            </Typography>
          )}
          {topBarArray.fields.map((item, index) => (
            <Box key={item.id} sx={{ mb: 2, p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", backgroundColor: "var(--color-admin-bg-tertiary)" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Enable</Typography>
                    <Controller
                      name={`promotion.topBar.${index}.enabled`}
                      control={control}
                      render={({ field }) => (
                        <MuiSwitch
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                          sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-success)" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-success)" } }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name={`promotion.topBar.${index}.text`}
                    control={control}
                    render={({ field }) => (
                      <AdminInput label={`Announcement Text ${index + 1}`} placeholder="🎉 Free Shipping Above ₹999" {...field} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => topBarArray.remove(index)}
                    sx={{ color: "var(--color-admin-danger)" }}
                    aria-label="Remove announcement"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>

        {/* Homepage Offers */}
        <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "var(--color-admin-text)", fontWeight: 600 }}>
              Homepage Offer Section
            </Typography>
            <AdminButton variant="ghost" size="small" icon={<AddIcon />} onClick={() => homeOfferArray.append({ enabled: true, title: "", description: "", banner: null })}>
              Add Home Offer
            </AdminButton>
          </Box>
          {homeOfferArray.fields.length === 0 && (
            <Typography variant="body2" sx={{ color: "var(--color-admin-muted)", mb: 1 }}>
              No home offers yet — the homepage offer carousel will be hidden.
            </Typography>
          )}
          {homeOfferArray.fields.map((item, index) => (
            <Box key={item.id} sx={{ mb: 2, p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)", backgroundColor: "var(--color-admin-bg-tertiary)" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Enable</Typography>
                    <Controller
                      name={`promotion.homeOffer.${index}.enabled`}
                      control={control}
                      render={({ field }) => (
                        <MuiSwitch
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                          sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-success)" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-success)" } }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name={`promotion.homeOffer.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <AdminInput label="Offer Title" placeholder="Weekend Mega Sale" {...field} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => homeOfferArray.remove(index)}
                    sx={{ color: "var(--color-admin-danger)" }}
                    aria-label="Remove home offer"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`promotion.homeOffer.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <AdminInput label="Offer Description" placeholder="Up to 30% OFF Gaming Accessories" {...field} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`promotion.homeOffer.${index}.banner`}
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        images={field.value ? [field.value] : []}
                        onChange={(files) => field.onChange(files[0] || null)}
                        maxFiles={1}
                        multiple={false}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 3, borderTop: "1px solid var(--color-admin-border)", flexWrap: "wrap" }}>
        <AdminButton variant="secondary" type="button" onClick={() => window.history.back()}>Cancel</AdminButton>
        <AdminButton variant="primary" type="submit" loading={loading}>{submitLabel}</AdminButton>
      </Box>
    </Box>
  );
};

export default DealForm;
