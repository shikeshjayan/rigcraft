import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Switch as MuiSwitch, Chip, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import AdminInput from "../common/Input";
import ImageUpload from "../common/ImageUpload";
import AdminButton from "../common/Button";
import ComponentSelector from "./ComponentSelector";
import { COMPONENT_SLOTS } from "../../services/prebuiltService";
import { useToast } from "../common/Toast";

const requiredSlotKeys = COMPONENT_SLOTS.filter((s) => s.required).map((s) => s.key);

const prebuiltSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  sku: z.string().min(1, "SKU is required").max(50),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  regularPrice: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  category: z.string().optional(),
  warrantyDuration: z.coerce.number().int().min(0).optional(),
  warrantyUnit: z.string().optional(),
  warrantyType: z.string().optional(),
  components: z.record(z.string(), z.union([z.string(), z.null()])).optional(),
  tags: z.array(z.string()).optional(),
  image: z.any().optional(),
}).superRefine((data, ctx) => {
  const comps = data.components || {};
  for (const key of requiredSlotKeys) {
    if (!comps[key]) {
      const slot = COMPONENT_SLOTS.find((s) => s.key === key);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${slot?.label || key} is required`,
        path: ["components", key],
      });
    }
  }
});

export { prebuiltSchema };

const PrebuiltForm = ({ defaultValues, onSubmit, loading, submitLabel = "Create Prebuilt PC" }) => {
  const { toast } = useToast();
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(prebuiltSchema),
    defaultValues: {
      name: "", sku: "", description: "", shortDescription: "",
      regularPrice: 0, salePrice: null, saleStart: "", saleEnd: "",
      stock: 0, isActive: true, isFeatured: false,
      category: "", warrantyDuration: 0, warrantyUnit: "month", warrantyType: "manufacturer",
      components: {},
      tags: [], image: null,
      ...defaultValues,
    },
  });

  const [slotSelector, setSlotSelector] = useState({ open: false, slot: null });
  const [tagInput, setTagInput] = useState("");

  const components = watch("components") || {};
  const tags = watch("tags") || [];


  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setValue("tags", tags.filter((t) => t !== tag));

  const handleSlotSelect = (product) => {
    if (slotSelector.slot) {
      setValue(`components.${slotSelector.slot.key}`, product.id);
    }
    setSlotSelector({ open: false, slot: null });
  };

  const removeSlot = (key) => {
    setValue(`components.${key}`, null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast("Please fix the validation errors before submitting", "error"))}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <AdminInput label="Name" error={!!errors.name} helperText={errors.name?.message} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="sku" control={control} render={({ field }) => (
                  <AdminInput label="SKU" error={!!errors.sku} helperText={errors.sku?.message} {...field} />
                )} />
              </Grid>
            </Grid>

            <Controller name="shortDescription" control={control} render={({ field }) => (
              <AdminInput label="Short Description" multiline rows={2} {...field} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <AdminInput label="Full Description" multiline rows={4} {...field} />
            )} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="regularPrice" control={control} render={({ field }) => (
                  <AdminInput label="Regular Price ($)" type="number" error={!!errors.regularPrice} helperText={errors.regularPrice?.message} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="salePrice" control={control} render={({ field }) => (
                  <AdminInput label="Sale Price ($)" type="number" {...field} value={field.value ?? ""} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="stock" control={control} render={({ field }) => (
                  <AdminInput label="Stock" type="number" {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="saleStart" control={control} render={({ field }) => (
                  <AdminInput label="Sale Start" type="datetime-local" {...field} value={field.value ?? ""} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller name="saleEnd" control={control} render={({ field }) => (
                  <AdminInput label="Sale End" type="datetime-local" {...field} value={field.value ?? ""} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="warrantyDuration" control={control} render={({ field }) => (
                  <AdminInput label="Warranty Duration" type="number" {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="warrantyUnit" control={control} render={({ field }) => (
                  <AdminSelect label="Warranty Unit" options={[{ value: "month", label: "Month(s)" }, { value: "year", label: "Year(s)" }]} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="warrantyType" control={control} render={({ field }) => (
                  <AdminSelect label="Warranty Type" options={[{ value: "manufacturer", label: "Manufacturer" }, { value: "seller", label: "Seller" }]} {...field} />
                )} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Component Slots
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {COMPONENT_SLOTS.map((slot) => {
                  const selectedId = components[slot.key];
                  return (
                    <Box key={slot.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, border: "1px solid", borderColor: errors.components?.[slot.key] ? "var(--color-admin-danger)" : "var(--color-admin-border)", borderRadius: "var(--radius-admin-badge)", backgroundColor: "var(--color-admin-bg-tertiary)" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--color-admin-text)" }}>
                          {slot.label} {slot.required && <span style={{ color: "var(--color-admin-danger)" }}>*</span>}
                        </Typography>
                        <Typography variant="caption" sx={{ color: errors.components?.[slot.key] ? "var(--color-admin-danger)" : selectedId ? "var(--color-admin-success)" : "var(--color-admin-muted)" }}>
                          {errors.components?.[slot.key] ? errors.components[slot.key].message : selectedId ? `Product ID: ${selectedId}` : "Not assigned"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <AdminButton variant="ghost" size="small" icon={<EditIcon />} onClick={() => setSlotSelector({ open: true, slot })}>
                          {selectedId ? "Change" : "Select"}
                        </AdminButton>
                        {selectedId && (
                          <IconButton size="small" onClick={() => removeSlot(slot.key)} sx={{ color: "var(--color-admin-danger)" }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "var(--color-admin-text)", fontWeight: 600 }}>Tags</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} size="small" sx={{ borderRadius: "var(--radius-admin-badge)" }} />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <AdminInput placeholder="Type and add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <AdminButton variant="secondary" size="small" type="button" onClick={addTag}>Add</AdminButton>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>Image</Typography>
              <Controller name="image" control={control} render={({ field }) => (
                <ImageUpload images={field.value ? [field.value] : []} onChange={(files) => field.onChange(files[0] || null)} maxFiles={1} multiple={false} />
              )} />
            </Box>

            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>Category</Typography>
              <Controller name="category" control={control} render={({ field }) => (
                <AdminSelect label="Category" options={[
                  { value: "gaming", label: "Gaming" },
                  { value: "streaming", label: "Streaming" },
                  { value: "workstation", label: "Workstation" },
                  { value: "office", label: "Office" },
                  { value: "budget", label: "Budget" },
                ]} {...field} value={field.value ?? ""} />
              )} />
            </Box>

            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>Status</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Active</Typography>
                  <Controller name="isActive" control={control} render={({ field }) => (
                    <MuiSwitch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />
                  )} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Featured</Typography>
                  <Controller name="isFeatured" control={control} render={({ field }) => (
                    <MuiSwitch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />
                  )} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid var(--color-admin-border)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <AdminButton variant="secondary" type="button" onClick={() => window.history.back()}>Cancel</AdminButton>
        <AdminButton variant="primary" type="submit" loading={loading}>{submitLabel}</AdminButton>
      </Box>

      {slotSelector.open && (
        <ComponentSelector
          open={slotSelector.open}
          onClose={() => setSlotSelector({ open: false, slot: null })}
          onSelect={handleSlotSelect}
          categoryType={slotSelector.slot?.categoryType}
          excludeIds={Object.values(components).filter(Boolean)}
        />
      )}
    </form>
  );
};

export default PrebuiltForm;
