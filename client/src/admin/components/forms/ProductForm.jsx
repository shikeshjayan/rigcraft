import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Grid,
  Typography,
  Switch as MuiSwitch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Autocomplete,
} from "@mui/material";
import {
  ExpandMore,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import AdminInput from "../common/Input";
import AdminSelect from "../common/Select";
import ImageUpload from "../common/ImageUpload";
import AdminButton from "../common/Button";
import { CATEGORY_TYPES } from "../../constants/categoryTypes";
import { SPEC_TEMPLATES } from "../../constants/compatibilityFields";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  sku: z.string().min(1, "SKU is required").max(50),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  categoryType: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  regularPrice: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  warrantyDuration: z.coerce.number().int().min(0).optional(),
  warrantyUnit: z.string().optional(),
  warrantyType: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  tags: z.array(z.string()).optional(),
  specifications: z
    .array(z.object({ key: z.string(), value: z.string(), label: z.string() }))
    .optional(),
  compatibility: z.record(z.string(), z.any()).optional(),
  images: z.array(z.any()).optional(),
});

export { productSchema };

const SectionAccordion = ({ title, defaultExpanded = false, children }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    sx={{
      boxShadow: "none",
      border: "1px solid var(--color-admin-border)",
      borderRadius: "var(--radius-admin-card) !important",
      "&:before": { display: "none" },
      mb: 2,
      "&.Mui-expanded": { margin: "0 0 16px 0" },
    }}>
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={{
        fontWeight: 600,
        fontSize: "0.875rem",
        color: "var(--color-admin-text)",
      }}>
      {title}
    </AccordionSummary>
    <AccordionDetails
      sx={{ borderTop: "1px solid var(--color-admin-border)", pt: 3 }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

const ProductForm = ({
  defaultValues,
  onSubmit,
  loading,
  categories = [],
  brands = [],
  submitLabel = "Create Product",
}) => {
  const categoryType = defaultValues?.categoryType || "";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    register,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      brandId: "",
      categoryId: "",
      categoryType: "",
      description: "",
      shortDescription: "",
regularPrice: 0,
       salePrice: null,
       saleStart: "",
       saleEnd: "",
      stock: 0,
      lowStockThreshold: 5,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      warrantyDuration: 0,
      warrantyUnit: "month",
      warrantyType: "manufacturer",
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      tags: [],
      specifications: [],
      compatibility: {},
      images: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });
  const tags = watch("tags") || [];
  const selectedType = watch("categoryType") || categoryType;
  const specTemplate = SPEC_TEMPLATES[selectedType] || [];

  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));

  const addSpecsFromTemplate = () => {
    specTemplate.forEach((tpl) => {
      const exists = fields.find((f) => f.key === tpl.key);
      if (!exists) {
        append({ key: tpl.key, value: "", label: tpl.label });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SectionAccordion title="General Information" defaultExpanded>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Product Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="SKU"
                  error={!!errors.sku}
                  helperText={errors.sku?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Brand"
                  options={brandOptions}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Category"
                  options={categoryOptions}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="categoryType"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Component Type"
                  options={CATEGORY_TYPES}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Short Description"
                  multiline
                  rows={2}
                  error={!!errors.shortDescription}
                  helperText={errors.shortDescription?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Full Description"
                  multiline
                  rows={4}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                color: "var(--color-admin-text)",
                fontWeight: 500,
                fontSize: "0.8125rem",
              }}>
              Tags
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  size="small"
                  sx={{ borderRadius: "var(--radius-admin-badge)" }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <AdminInput
                placeholder="Type and add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <AdminButton
                variant="secondary"
                size="small"
                type="button"
                onClick={addTag}>
                Add
              </AdminButton>
            </Box>
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="Pricing">
<Grid container spacing={2}>
           <Grid size={{ xs: 12, sm: 6 }}>
             <Controller
               name="regularPrice"
               control={control}
               render={({ field }) => (
                 <AdminInput
                   label="Regular Price ($)"
                   type="number"
                   error={!!errors.regularPrice}
                   helperText={errors.regularPrice?.message}
                   {...field}
                 />
               )}
             />
           </Grid>
           <Grid size={{ xs: 12, sm: 6 }}>
             <Controller
               name="salePrice"
               control={control}
               render={({ field }) => (
                 <AdminInput
                   label="Sale Price ($)"
                   type="number"
                   {...field}
                   value={field.value ?? ""}
                 />
               )}
             />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="saleStart"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Sale Start"
                  type="datetime-local"
                  {...field}
                  value={field.value ?? ""}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="saleEnd"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Sale End"
                  type="datetime-local"
                  {...field}
                  value={field.value ?? ""}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="Media">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                color: "var(--color-admin-text)",
                fontWeight: 500,
                fontSize: "0.8125rem",
              }}>
              Product Images
            </Typography>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  images={field.value ?? []}
                  onChange={(files) => field.onChange(files)}
                  maxFiles={10}
                />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="SEO">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="metaTitle"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Meta Title"
                  error={!!errors.metaTitle}
                  helperText={
                    errors.metaTitle?.message ||
                    `${(field.value || "").length}/60 characters`
                  }
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Meta Description"
                  multiline
                  rows={2}
                  error={!!errors.metaDescription}
                  helperText={
                    errors.metaDescription?.message ||
                    `${(field.value || "").length}/160 characters`
                  }
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="Inventory">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <AdminInput label="Stock Quantity" type="number" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <AdminInput
                  label="Low Stock Threshold"
                  type="number"
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="Measurements">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <AdminInput label="Weight (kg)" type="number" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="length"
              control={control}
              render={({ field }) => (
                <AdminInput label="Length (cm)" type="number" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="width"
              control={control}
              render={({ field }) => (
                <AdminInput label="Width (cm)" type="number" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <AdminInput label="Height (cm)" type="number" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      <SectionAccordion title="Warranty">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="warrantyDuration"
              control={control}
              render={({ field }) => (
                <AdminInput label="Duration" type="number" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="warrantyUnit"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Unit"
                  options={[
                    { value: "month", label: "Month(s)" },
                    { value: "year", label: "Year(s)" },
                  ]}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="warrantyType"
              control={control}
              render={({ field }) => (
                <AdminSelect
                  label="Type"
                  options={[
                    { value: "manufacturer", label: "Manufacturer" },
                    { value: "seller", label: "Seller" },
                  ]}
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </SectionAccordion>

      {selectedType && (
        <SectionAccordion title="Specifications">
          <Box sx={{ mb: 2 }}>
            <AdminButton
              variant="secondary"
              size="small"
              type="button"
              onClick={addSpecsFromTemplate}>
              Add specs from template
            </AdminButton>
          </Box>
          {fields.map((field, idx) => {
            const tpl = specTemplate.find((s) => s.key === field.key);
            const isCustom = !tpl;
            return (
              <Grid container spacing={1} key={field.id} sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}>
                  <AdminInput
                    label="Label"
                    {...register(`specifications.${idx}.label`, {
                      onChange: (e) => {
                        if (isCustom && !field.key) {
                          const generated = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                            .replace(/[^a-z0-9_]/g, "");
                          setValue(`specifications.${idx}.key`, generated);
                        }
                      },
                    })}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 7 }}>
                  {tpl?.type === "select" ? (
                    <Controller
                      name={`specifications.${idx}.value`}
                      control={control}
                      render={({ field: f }) => (
                        <AdminSelect
                          label="Value"
                          options={(tpl.options || []).map((o) => ({
                            value: o,
                            label: o,
                          }))}
                          {...f}
                        />
                      )}
                    />
                  ) : (
                    <AdminInput
                      label="Value"
                      {...register(`specifications.${idx}.value`)}
                      size="small"
                    />
                  )}
                </Grid>
                <Grid
                  size={{ xs: 1 }}
                  sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    onClick={() => remove(idx)}
                    size="small"
                    sx={{ color: "var(--color-admin-danger)" }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            );
          })}
          <AdminButton
            variant="ghost"
            size="small"
            type="button"
            icon={<AddIcon />}
            onClick={() => append({ key: "", value: "", label: "" })}>
            Add Custom Spec
          </AdminButton>
        </SectionAccordion>
      )}

      <SectionAccordion title="Status">
        <Box sx={{ display: "flex", gap: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value ?? true}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Typography
              variant="body2"
              sx={{ color: "var(--color-admin-text-secondary)" }}>
              Active
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <MuiSwitch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Typography
              variant="body2"
              sx={{ color: "var(--color-admin-text-secondary)" }}>
              Featured
            </Typography>
          </Box>
        </Box>
      </SectionAccordion>

      <Box
        sx={{
          mt: 3,
          pt: 3,
          borderTop: "1px solid var(--color-admin-border)",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}>
        <AdminButton
          variant="secondary"
          type="button"
          onClick={() => window.history.back()}>
          Cancel
        </AdminButton>
        <AdminButton variant="primary" type="submit" loading={loading}>
          {submitLabel}
        </AdminButton>
      </Box>
    </form>
  );
};

export default ProductForm;
