import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Switch as MuiSwitch } from "@mui/material";
import AdminInput from "../common/Input";
import AdminSelect from "../common/Select";
import ImageUpload from "../common/ImageUpload";
import AdminButton from "../common/Button";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  parentId: z.union([z.number(), z.string(), z.null()]).optional(),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().min(0).optional(),
  image: z.any().optional(),
});

export { categorySchema };

const CategoryForm = ({ defaultValues, onSubmit, loading, categories = [], submitLabel = "Create Category" }) => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
      isActive: true,
      order: "",
      image: null,
      ...defaultValues,
    },
  });



  const parentOptions = categories
    .filter((c) => c.id !== defaultValues?.id)
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AdminInput label="Name" error={!!errors.name} helperText={errors.name?.message} {...field} />
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
              name="parentId"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Parent Category"
                  options={parentOptions}
                  placeholder="None (Top Level)"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />

            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <AdminInput label="Sort Order" type="number" error={!!errors.order} helperText={errors.order?.message} {...field} />
              )}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Category Image
              </Typography>
              <Controller
                name="image"
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

export default CategoryForm;
