import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Switch as MuiSwitch, Autocomplete, TextField, Chip } from "@mui/material";
import AdminInput from "../common/Input";
import AdminSelect from "../common/Select";
import AdminButton from "../common/Button";

const couponSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(1, "Code is required").max(30).regex(/^[A-Z0-9_]+$/, "Uppercase letters, numbers, and underscores only"),
  type: z.string().min(1, "Type is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
  maximumDiscount: z.coerce.number().min(0).optional().nullable(),
  minOrder: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(0).optional(),
  usageLimitPerUser: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  isFirstOrderOnly: z.boolean().optional(),
  startsAt: z.string().min(1, "Start date is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  description: z.string().max(300).optional(),
  applicableTo: z.string().optional(),
  products: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  prebuiltPcs: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.startsAt && data.expiresAt && new Date(data.startsAt) >= new Date(data.expiresAt)) {
    ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry date must be after start date" });
  }
  if (data.type === "percentage" && (!data.maximumDiscount || data.maximumDiscount <= 0)) {
    ctx.addIssue({ code: "custom", path: ["maximumDiscount"], message: "Maximum discount is required for percentage coupons" });
  }
});

export { couponSchema };

const COUPON_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
  { value: "free_shipping", label: "Free Shipping" },
];

const APPLICABLE_TO_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "product", label: "Specific Products" },
  { value: "category", label: "Specific Categories" },
  { value: "prebuilt", label: "Specific Prebuilt PCs" },
];

const CouponForm = ({ defaultValues, onSubmit, loading, submitLabel = "Create Coupon", products = [], categories = [], prebuiltPcs = [] }) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      name: "", code: "", type: "percentage", value: 0, maximumDiscount: null, minOrder: 0, maxUses: 100,
      usageLimitPerUser: 1, isActive: true, isFirstOrderOnly: false, startsAt: "", expiresAt: "",
      description: "", applicableTo: "all", products: [], categories: [], prebuiltPcs: [],
      ...defaultValues,
    },
  });

  const type = watch("type");
  const applicableTo = watch("applicableTo") || "all";

  const productOptions = products.map((p) => ({ value: p.id || p._id, label: p.name }));
  const categoryOptions = categories.map((c) => ({ value: c.id || c._id, label: c.name }));
  const prebuiltOptions = prebuiltPcs.map((p) => ({ value: p.id || p._id, label: p.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <AdminInput label="Coupon Name" error={!!errors.name} helperText={errors.name?.message} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="code" control={control} render={({ field }) => (
                  <AdminInput label="Coupon Code" placeholder="SUMMER2025" error={!!errors.code} helperText={errors.code?.message} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                )} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type" control={control} render={({ field }) => (
                  <AdminSelect label="Discount Type" options={COUPON_TYPES} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="value" control={control} render={({ field }) => (
                  <AdminInput label={type === "percentage" ? "Percentage (%)" : type === "fixed" ? "Amount ($)" : "N/A"} type="number" disabled={type === "free_shipping"} error={!!errors.value} helperText={errors.value?.message} {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                {type === "percentage" && (
                  <Controller name="maximumDiscount" control={control} render={({ field }) => (
                    <AdminInput label="Max Discount ($)" type="number" error={!!errors.maximumDiscount} helperText={errors.maximumDiscount?.message} {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  )} />
                )}
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="startsAt" control={control} render={({ field }) => (
                  <AdminInput label="Start Date" type="datetime-local" error={!!errors.startsAt} helperText={errors.startsAt?.message} {...field} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="expiresAt" control={control} render={({ field }) => (
                  <AdminInput label="Expiry Date" type="datetime-local" error={!!errors.expiresAt} helperText={errors.expiresAt?.message} {...field} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="minOrder" control={control} render={({ field }) => (
                  <AdminInput label="Minimum Order ($)" type="number" {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="maxUses" control={control} render={({ field }) => (
                  <AdminInput label="Max Uses" type="number" {...field} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="usageLimitPerUser" control={control} render={({ field }) => (
                  <AdminInput label="Max Uses Per User" type="number" {...field} />
                )} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="applicableTo" control={control} render={({ field }) => (
                  <AdminSelect label="Applicable To" options={APPLICABLE_TO_OPTIONS} {...field} />
                )} />
              </Grid>
            </Grid>

            {applicableTo === "product" && (
              <Grid size={{ xs: 12 }}>
                <Controller name="products" control={control} render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={productOptions}
                    value={productOptions.filter((o) => (field.value || []).includes(o.value))}
                    onChange={(_, newVal) => field.onChange(newVal.map((v) => v.value))}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Products" placeholder="Search products..." />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option.label} {...getTagProps({ index })} size="small" />
                      ))
                    }
                    size="small"
                  />
                )} />
              </Grid>
            )}

            {applicableTo === "category" && (
              <Grid size={{ xs: 12 }}>
                <Controller name="categories" control={control} render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={categoryOptions}
                    value={categoryOptions.filter((o) => (field.value || []).includes(o.value))}
                    onChange={(_, newVal) => field.onChange(newVal.map((v) => v.value))}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Categories" placeholder="Search categories..." />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option.label} {...getTagProps({ index })} size="small" />
                      ))
                    }
                    size="small"
                  />
                )} />
              </Grid>
            )}

            {applicableTo === "prebuilt" && (
              <Grid size={{ xs: 12 }}>
                <Controller name="prebuiltPcs" control={control} render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={prebuiltOptions}
                    value={prebuiltOptions.filter((o) => (field.value || []).includes(o.value))}
                    onChange={(_, newVal) => field.onChange(newVal.map((v) => v.value))}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Prebuilt PCs" placeholder="Search prebuilt PCs..." />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option.label} {...getTagProps({ index })} size="small" />
                      ))
                    }
                    size="small"
                  />
                )} />
              </Grid>
            )}

            <Controller name="description" control={control} render={({ field }) => (
              <AdminInput label="Description" multiline rows={2} error={!!errors.description} helperText={errors.description?.message} {...field} />
            )} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>Status</Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Active</Typography>
              <Controller name="isActive" control={control} render={({ field }) => (
                <MuiSwitch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />
              )} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>First Order Only</Typography>
              <Controller name="isFirstOrderOnly" control={control} render={({ field }) => (
                <MuiSwitch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />
              )} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid var(--color-admin-border)", display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <AdminButton variant="secondary" type="button" onClick={() => window.history.back()}>Cancel</AdminButton>
        <AdminButton variant="primary" type="submit" loading={loading}>{submitLabel}</AdminButton>
      </Box>
    </form>
  );
};

export default CouponForm;
