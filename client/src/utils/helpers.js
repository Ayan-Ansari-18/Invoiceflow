// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ' };
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${symbols[currency] || ''}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Date formatting
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const toInputDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// GST calculation
export const calcTotals = (lineItems = [], gstPercent = 18, additionalCharges = [], discount = null) => {
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + (qty * rate);
  }, 0);
  const subtotalRounded = parseFloat(subtotal.toFixed(2));

  let totalAdditionalCharges = 0;
  additionalCharges.forEach(charge => {
    const amt = parseFloat(charge.amount) || 0;
    if (charge.mode === 'Percentage') {
      totalAdditionalCharges += (subtotalRounded * amt) / 100;
    } else {
      totalAdditionalCharges += amt;
    }
  });
  totalAdditionalCharges = parseFloat(totalAdditionalCharges.toFixed(2));

  let totalDiscount = 0;
  if (discount) {
    const amt = parseFloat(discount.amount) || 0;
    if (discount.mode === 'Percentage') {
      totalDiscount = (subtotalRounded * amt) / 100;
    } else {
      totalDiscount = amt;
    }
  }
  totalDiscount = parseFloat(totalDiscount.toFixed(2));

  const taxableAmount = subtotalRounded + totalAdditionalCharges - totalDiscount;
  const taxableAmountRounded = parseFloat(Math.max(0, taxableAmount).toFixed(2));

  const gstAmount = parseFloat(((taxableAmountRounded * gstPercent) / 100).toFixed(2));
  const total = parseFloat((taxableAmountRounded + gstAmount).toFixed(2));
  return { subtotal: subtotalRounded, totalAdditionalCharges, totalDiscount, gstAmount, total };
};

// Invoice status config
export const STATUS_CONFIG = {
  draft: { label: 'Draft', class: 'badge-draft' },
  sent: { label: 'Sent', class: 'badge-sent' },
  viewed: { label: 'Viewed', class: 'badge-viewed' },
  paid: { label: 'Paid', class: 'badge-paid' },
  overdue: { label: 'Overdue', class: 'badge-overdue' },
};

// GST options
export const GST_OPTIONS = [
  { value: 0, label: '0% — Exempt' },
  { value: 5, label: '5% GST' },
  { value: 12, label: '12% GST' },
  { value: 18, label: '18% GST (default)' },
  { value: 28, label: '28% GST' },
];

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR — Indian Rupee' },
  { value: 'USD', label: '$ USD — US Dollar' },
  { value: 'EUR', label: '€ EUR — Euro' },
  { value: 'GBP', label: '£ GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'AUD', label: 'A$ AUD — Australian Dollar' },
  { value: 'CAD', label: 'C$ CAD — Canadian Dollar' },
  { value: 'SGD', label: 'S$ SGD — Singapore Dollar' },
  { value: 'JPY', label: '¥ JPY — Japanese Yen' },
];

// Get user initials for avatar
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Truncate text
export const truncate = (str, len = 40) =>
  str && str.length > len ? str.slice(0, len) + '…' : str;

// Error message extractor
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
