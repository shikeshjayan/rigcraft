export const ISSUE_TYPE_LABELS = {
  order: 'Order & Cancellation',
  payment: 'Payment & Refund',
  shipping: 'Shipping & Delivery',
  warranty: 'Warranty Claim',
  product: 'Product Enquiry',
  return: 'Return & Replacement',
  refund: 'Refund',
  replacement: 'Replacement',
  other: 'Other'
}

export const issueTypeLabel = (type) =>
  ISSUE_TYPE_LABELS[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : type)

export const REASON_OPTIONS = [
  { value: 'product', label: 'Before Buying / Product Enquiry' },
  { value: 'order', label: 'Order & Cancellation' },
  { value: 'payment', label: 'Payment & Refund' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'warranty', label: 'Warranty Claim' },
  { value: 'return', label: 'Return & Replacement' },
  { value: 'other', label: 'Something Else' }
]

export const normalizeReasonType = (type) => {
  if (!type) return ''
  const value = type.toLowerCase()
  if (REASON_OPTIONS.some((o) => o.value === value)) return value
  if (value === 'refund') return 'payment'
  if (value === 'replacement') return 'return'
  return ''
}
