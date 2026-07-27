# Coupon Data Mismatch Fix

## Files to Edit

### 1. client/src/admin/components/forms/CouponForm.jsx
Full rewrite — adds maximumDiscount, applicableTo, usageLimitPerUser, isFirstOrderOnly, date validation, product/category/prebuilt selectors.

### 2. client/src/admin/pages/coupons/CouponCreate.jsx
Fetch products, categories, prebuilt PCs before rendering form.

### 3. client/src/admin/pages/coupons/CouponEdit.jsx  
Same data fetching as Create.

### 4. server/src/validators/coupon.validation.js
Fix update schema superRefine to not require maximumDiscount when discountType isn't being changed.

---

## Change Details

### CouponForm.jsx
- Schema: added maximumDiscount (conditional), applicableTo, usageLimitPerUser, isFirstOrderOnly, products, categories, prebuiltPcs
- superRefine: date validation (startsAt < expiresAt), percentage requires maximumDiscount
- Form UI: maximumDiscount input (shown when type=percentage), applicableTo dropdown, usageLimitPerUser field, isFirstOrderOnly switch
- 3 conditional Autocomplete multi-selects for products/categories/prebuilt PCs based on applicableTo
- New props: products, categories, prebuiltPcs arrays

### CouponCreate.jsx / CouponEdit.jsx  
```js
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [prebuiltPcs, setPrebuiltPcs] = useState([]);

useEffect(() => {
  Promise.all([
    categoryService.getAll(),
    productService.list({ pageSize: 1000 }),
    prebuiltService.list({ pageSize: 1000 }),
  ]).then(([cats, prods, prebuilt]) => {
    setCategories(cats);
    setProducts(prods.data || []);
    setPrebuiltPcs(prebuilt.data || []);
  });
}, []);
```

Pass to `<CouponForm products={products} categories={categories} prebuiltPcs={prebuiltPcs} />`

### coupon.validation.js
Change the maximumDiscount check in updateCouponSchema (line 50):
```js
// Before:
if (!data.maximumDiscount) {
// After (create schema - unchanged):
if (!data.maximumDiscount) {
// Add to update schema's superRefine:
if (data.discountType === DISCOUNT_TYPES.PERCENTAGE && data.maximumDiscount !== undefined && !data.maximumDiscount) {
```
