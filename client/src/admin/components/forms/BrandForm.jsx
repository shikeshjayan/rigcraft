import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Switch as MuiSwitch } from "@mui/material";
import AdminInput from "../common/Input";
import ImageUpload from "../common/ImageUpload";
import AdminButton from "../common/Button";

const brandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  logo: z.any().optional(),
});

export { brandSchema };

const BrandForm = ({ defaultValues, onSubmit, loading, submitLabel = "Create Brand" }) => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      isActive: true,
      logo: null,
      ...defaultValues,
    },
  });

  const logo = watch("logo");
  const images = logo ? (Array.isArray(logo) ? logo : [logo]) : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AdminInput label="Brand Name" error={!!errors.name} helperText={errors.name?.message} {...field} />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <AdminInput label="Description" multiline rows={3} error={!!errors.description} helperText={errors.description?.message} {...field} />
              )}
            />

            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <AdminInput label="Website URL" placeholder="https://example.com" error={!!errors.website} helperText={errors.website?.message} {...field} />
              )}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Brand Logo
              </Typography>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    images={images}
                    onChange={(files) => setValue("logo", files[0] || null)}
                    maxFiles={1}
                    multiple={false}
                  />
                )}
              />
            </Box>

            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Active</Typography>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <MuiSwitch
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--color-admin-success)" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--color-admin-success)" },
                      }}
                    />
                  )}
                />
              </Box>
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

export default BrandForm;
