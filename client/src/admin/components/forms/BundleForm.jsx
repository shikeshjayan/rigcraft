import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Typography, Autocomplete, Chip, TextField } from "@mui/material";
import AdminInput from "../common/Input";
import AdminSwitch from "../common/Switch";
import ImageUpload from "../common/ImageUpload";
import AdminButton from "../common/Button";

const bundleSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(1000).optional(),
    products: z.array(z.string()).optional().default([]),
    prebuiltPcs: z.array(z.string()).optional().default([]),
    bundlePrice: z.coerce.number().min(0, "Bundle price must be positive"),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    displayOrder: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    image: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.products || []).length + (data.prebuiltPcs || []).length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["products"],
        message: "Add at least one product or prebuilt PC",
      });
    }
    if (
      data.startsAt &&
      data.endsAt &&
      new Date(data.startsAt) >= new Date(data.endsAt)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be after start date",
      });
    }
  });

const getMemberPrice = (item) => {
  if (!item) return 0;
  const sale = Number(item.salePrice);
  const regular = Number(item.regularPrice ?? item.price ?? 0);
  return sale > 0 ? sale : regular;
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const BundleForm = ({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Create Bundle",
  products = [],
  prebuiltPcs = [],
}) => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: "",
      description: "",
      products: [],
      prebuiltPcs: [],
      bundlePrice: 0,
      startsAt: "",
      endsAt: "",
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      image: null,
      ...defaultValues,
    },
  });

  const image = watch("image");
  const images = image ? (Array.isArray(image) ? image : [image]) : [];
  const selectedProducts = watch("products") || [];
  const selectedPrebuilts = watch("prebuiltPcs") || [];
  const bundlePrice = Number(watch("bundlePrice")) || 0;

  const productOptions = products.map((p) => ({ value: p.id || p._id, label: p.name, data: p }));
  const prebuiltOptions = prebuiltPcs.map((p) => ({ value: p.id || p._id, label: p.name, data: p }));

  const itemsTotal = [
    ...productOptions.filter((o) => selectedProducts.includes(o.value)),
    ...prebuiltOptions.filter((o) => selectedPrebuilts.includes(o.value)),
  ].reduce((sum, o) => sum + getMemberPrice(o.data), 0);

  const savings = Math.max(0, itemsTotal - bundlePrice);
  const discountPct = itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AdminInput label="Bundle Name" error={!!errors.name} helperText={errors.name?.message} {...field} />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <AdminInput label="Description" multiline rows={3} error={!!errors.description} helperText={errors.description?.message} {...field} />
              )}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Products in Bundle
              </Typography>
              <Controller
                name="products"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={productOptions}
                    getOptionLabel={(o) => o.label}
                    value={productOptions.filter((o) => selectedProducts.includes(o.value))}
                    onChange={(_, newVal) => field.onChange(newVal.map((v) => v.value))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Products"
                        placeholder="Search products..."
                        error={!!errors.products}
                        helperText={errors.products?.message}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option.value}
                          label={`${option.label} · ${formatINR(getMemberPrice(option.data))}`}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                    size="small"
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Prebuilt PCs in Bundle
              </Typography>
              <Controller
                name="prebuiltPcs"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={prebuiltOptions}
                    getOptionLabel={(o) => o.label}
                    value={prebuiltOptions.filter((o) => selectedPrebuilts.includes(o.value))}
                    onChange={(_, newVal) => field.onChange(newVal.map((v) => v.value))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Prebuilt PCs"
                        placeholder="Search prebuilt PCs..."
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          key={option.value}
                          label={`${option.label} · ${formatINR(getMemberPrice(option.data))}`}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                    size="small"
                  />
                )}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="bundlePrice"
                  control={control}
                  render={({ field }) => (
                    <AdminInput label="Bundle Price (₹)" type="number" error={!!errors.bundlePrice} helperText={errors.bundlePrice?.message} {...field} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="startsAt"
                  control={control}
                  render={({ field }) => (
                    <AdminInput label="Start Date" type="datetime-local" error={!!errors.startsAt} helperText={errors.startsAt?.message} {...field} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="endsAt"
                  control={control}
                  render={({ field }) => (
                    <AdminInput label="End Date" type="datetime-local" error={!!errors.endsAt} helperText={errors.endsAt?.message} {...field} />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="displayOrder"
              control={control}
              render={({ field }) => (
                <AdminInput label="Display Order" type="number" error={!!errors.displayOrder} helperText={errors.displayOrder?.message} {...field} />
              )}
            />

            <Box
              sx={{
                p: 2,
                border: "1px dashed var(--color-admin-border)",
                borderRadius: "var(--radius-admin-card)",
                backgroundColor: "var(--color-admin-bg-soft)",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--color-admin-text)", fontWeight: 700 }}>
                Pricing Preview
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Items Total</Typography>
                  <Typography sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>{formatINR(itemsTotal)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>Bundle Price</Typography>
                  <Typography sx={{ fontWeight: 700, color: "var(--color-admin-text)" }}>{formatINR(bundlePrice)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>You Save</Typography>
                  <Typography sx={{ fontWeight: 700, color: "green" }}>{formatINR(savings)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" sx={{ color: "var(--color-admin-text-secondary)" }}>OFF</Typography>
                  <Typography sx={{ fontWeight: 700, color: "var(--color-admin-primary)" }}>{discountPct}%</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Bundle Image
              </Typography>
              <Controller
                name="image"
                control={control}
                render={() => (
                  <ImageUpload
                    images={images}
                    onChange={(files) => setValue("image", files[0] || null)}
                    maxFiles={1}
                    multiple={false}
                  />
                )}
              />
            </Box>

            <Box sx={{ p: 2, border: "1px solid var(--color-admin-border)", borderRadius: "var(--radius-admin-card)" }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "var(--color-admin-text)", fontWeight: 600 }}>
                Status
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <AdminSwitch
                      label="Active (visible on store)"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <AdminSwitch
                      label="Featured (shows first)"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Box>
            </Box>

            <AdminButton type="submit" loading={loading} fullWidth>
              {submitLabel}
            </AdminButton>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default BundleForm;
