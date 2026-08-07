export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_COLOR = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
  OUT_OF_STOCK: "out_of_stock",
};

export const PRODUCT_STATUS_COLOR = {
  active: "success",
  draft: "warning",
  archived: "muted",
  out_of_stock: "error",
};

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const REVIEW_STATUS_COLOR = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const USER_STATUS_COLOR = {
  active: "success",
  blocked: "error",
  deactivated: "warning",
};

export const COUPON_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  DISABLED: "disabled",
};

export const COUPON_STATUS_COLOR = {
  active: "success",
  expired: "muted",
  disabled: "error",
};

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
};
