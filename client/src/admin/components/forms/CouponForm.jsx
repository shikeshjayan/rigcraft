import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Switch as MuiSwitch } from "@mui/material";
import AdminInput from "../common/Input";
import AdminSelect from "../common/Select";
import AdminButton from "../common/Button";

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(30).regex(/^[A-Z0-9_]+$/, "Uppercase letters, numbers, and underscores only"),
  type: z.string().min(1, "Type is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
  minOrder: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  description: z.string().max(300).optional(),
});

export { couponSchema };

const COUPON_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
  { value: "free_shipping", label: "Free Shipping" },
];

const CouponForm = ({ defaultValues, onSubmit, loading, submitLabel = "Create Coupon" }) => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "", type: "percentage", value: 0, minOrder: 0, maxUses: 100,
      isActive: true, startsAt: "", expiresAt: "", description: "",
      ...defaultValues,
    },
  });

  const type = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="code" control={control} render={({ field }) => (
                  <AdminInput label="Coupon Code" placeholder="SUMMER2025" error={!!errors.code} helperText={errors.code?.message} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                )} />
              </Grid>
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
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="startsAt" control={control} render={({ field }) => (
                  <AdminInput label="Start Date" type="datetime-local" {...field} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="expiresAt" control={control} render={({ field }) => (
                  <AdminInput label="Expiry Date" type="datetime-local" {...field} InputLabelProps={{ shrink: true }} />
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
            </Grid>

            <Controller name="description" control={control} render={({ field }) => (
              <AdminInput label="Description" multiline rows={2} error={!!errors.description} helperText={errors.description?.message} {...field} />
            )} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>Status</Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Active</Typography>
              <Controller name="isActive" control={control} render={({ field }) => (
                <MuiSwitch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />
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
