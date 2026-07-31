const FIELD_LABELS = {
  name: "Name",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone number",
  mobile: "Mobile number",
  password: "Password",
  confirmPassword: "Confirm password",
  currentPassword: "Current password",
  newPassword: "New password",
  role: "Role",
  sku: "SKU",
  slug: "Slug",
  title: "Title",
  subtitle: "Subtitle",
  description: "Description",
  shortDescription: "Short description",
  website: "Website",
  logo: "Logo",
  image: "Image",
  images: "Images",
  price: "Price",
  regularPrice: "Regular price",
  salePrice: "Sale price",
  saleStart: "Sale start date",
  saleEnd: "Sale end date",
  comparePrice: "Compare price",
  stock: "Stock",
  lowStockThreshold: "Low stock threshold",
  weight: "Weight",
  quantity: "Quantity",
  currency: "Currency",
  category: "Category",
  categoryType: "Category type",
  productType: "Product type",
  brand: "Brand",
  status: "Status",
  priority: "Priority",
  rating: "Rating",
  comment: "Comment",
  review: "Review",
  subject: "Subject",
  body: "Message",
  question: "Question",
  couponCode: "Coupon code",
  code: "Code",
  discountType: "Discount type",
  discountValue: "Discount value",
  minOrderAmount: "Minimum order amount",
  maxDiscountAmount: "Maximum discount amount",
  startDate: "Start date",
  endDate: "End date",
  expiresAt: "Expiry date",
  usageLimit: "Usage limit",
  orderNumber: "Order number",
  shippingAddress: "Shipping address",
  shippingMethod: "Shipping method",
  address: "Address",
  city: "City",
  state: "State",
  country: "Country",
  postalCode: "Postal code",
  zip: "ZIP code",
  warrantyDuration: "Warranty duration",
  warrantyUnit: "Warranty unit",
  warrantyType: "Warranty type",
  dimensions: "Dimensions",
  specifications: "Specifications",
  compatibility: "Compatibility",
  isActive: "Active status",
  isFeatured: "Featured status",
  isBlocked: "Blocked status",
  featuredOrder: "Featured order",
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  tags: "Tags",
  url: "URL",
  content: "Content",
};

export const humanizeField = (field = "") => {
  const raw = String(field).trim();
  if (!raw) return "";
  const segment = raw.split(".").filter(Boolean).pop() || raw;
  if (FIELD_LABELS[segment]) return FIELD_LABELS[segment];
  const spaced = segment.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  const lower = spaced.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const toSentence = (msg) => {
  const m = String(msg || "").trim();
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : "";
};

const translateFieldMessage = (fieldLabel, message) => {
  const msg = String(message || "").trim();
  if (!msg) return "";
  const lower = msg.toLowerCase();
  if (lower === "required") return `${fieldLabel} is required`;
  let m = lower.match(/string must contain at least (\d+) character/);
  if (m) return `${fieldLabel} must be at least ${m[1]} characters`;
  m = lower.match(/string must contain at most (\d+) character/);
  if (m) return `${fieldLabel} must be no more than ${m[1]} characters`;
  if (lower.includes("expected number")) return `${fieldLabel} must be a number`;
  if (lower.includes("expected string")) return `${fieldLabel} must be text`;
  if (lower.includes("expected boolean")) return `${fieldLabel} must be true or false`;
  if (lower.includes("expected date")) return `${fieldLabel} must be a valid date`;
  if (lower.includes("invalid email")) return `${fieldLabel} must be a valid email address`;
  if (lower.includes("invalid url")) return `${fieldLabel} must be a valid URL`;
  if (lower.includes("must be a valid url")) return `${fieldLabel} must be a valid URL`;
  if (lower === "invalid id") return "Please provide a valid ID";
  if (lower.includes("invalid input") || lower.includes("expected enum")) return `${fieldLabel} has an invalid value`;
  return toSentence(msg);
};

const humanizeError = (field, message) => {
  const label = humanizeField(field);
  const translated = translateFieldMessage(label, message);
  if (!translated) return "";
  if (label && !translated.toLowerCase().includes(label.toLowerCase())) {
    return `${label}: ${translated}`;
  }
  return translated;
};

const humanizeStringMessage = (message) => {
  const msg = String(message || "").trim();
  if (!msg) return "";
  let m = msg.match(/^Path `([^`]+)` is required/i);
  if (!m) m = msg.match(/^`([^`]+)` is required/i);
  if (!m) m = msg.match(/^"([^"]+)" is required/i);
  if (m) return `${humanizeField(m[1])} is required`;
  if (/^Cast to /.test(msg)) return "Please enter a valid value";
  if (/duplicate (?:value|key)/i.test(msg)) return "That value is already in use. Please choose a different one";
  return toSentence(msg);
};

export const extractError = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  const status = err?.response?.status;
  const rawMessage = err?.message || "";

  if (!err?.response) {
    if (err?.code === "ECONNABORTED" || /timeout/i.test(rawMessage)) {
      return "The request timed out. Please try again";
    }
    if (err?.code === "ERR_NETWORK" || /network error/i.test(rawMessage)) {
      return "Unable to reach the server. Please check your connection and try again";
    }
  }

  if (status >= 500) {
    return fallback || "Something went wrong. Please try again";
  }

  const messages = [];
  const errors = data?.errors;
  if (Array.isArray(errors) && errors.length) {
    errors.forEach((item) => {
      if (item && typeof item === "object") {
        const formatted = humanizeError(item.field, item.message);
        if (formatted) messages.push(formatted);
      } else if (item) {
        const formatted = humanizeStringMessage(item);
        if (formatted) messages.push(formatted);
      }
    });
  }
  if (messages.length) {
    const visible = messages.slice(0, 2);
    const hidden = messages.length - visible.length;
    return visible.join(" ") + (hidden > 0 ? ` (and ${hidden} more)` : "");
  }

  const message = typeof data?.message === "string" ? data.message.trim() : "";
  if (message) {
    const dup = message.match(/^Duplicate value for (.+)$/i);
    if (dup) {
      const label = humanizeField(dup[1].trim());
      return `This ${label.toLowerCase()} is already in use. Please use a different one`;
    }
    if (/invalid or expired token/i.test(message)) return "Your session has expired. Please sign in again";
    if (/invalid id format/i.test(message)) return "The requested record ID is invalid";
    if (/internal server error/i.test(message)) return fallback || "Something went wrong. Please try again";
    if (/network error/i.test(message)) return "Unable to reach the server. Please check your connection and try again";
    if (/validation failed/i.test(message)) return fallback || "Please check your input and try again";
    return toSentence(message);
  }

  if (rawMessage) {
    if (/timeout/i.test(rawMessage)) return "The request timed out. Please try again";
    if (/network error/i.test(rawMessage) || rawMessage.includes("ERR_NETWORK")) return "Unable to reach the server. Please check your connection and try again";
    if (!/^request failed with status/i.test(rawMessage)) return toSentence(rawMessage);
  }

  return fallback || "Something went wrong. Please try again";
};
