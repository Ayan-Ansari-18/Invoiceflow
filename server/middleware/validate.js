const { z } = require('zod');

// Middleware factory: validates req.body against a Zod schema
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    const message = errors.map((e) => `${e.field || 'input'}: ${e.message}`).join(', ');
    return res.status(400).json({ success: false, message: `Validation failed: ${message}`, errors });
  }
  req.body = result.data; // Replace with parsed/coerced data
  next();
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Invoice Schemas ───────────────────────────────────────────────────────────
const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.coerce.number().positive('Quantity must be positive'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
  amount: z.coerce.number(),
});

const additionalChargeSchema = z.object({
  type: z.string().min(1, 'Charge type is required'),
  name: z.string().optional(),
  mode: z.enum(['Fixed Amount', 'Percentage']),
  amount: z.coerce.number().positive('Amount must be positive')
}).refine(data => {
  if (data.type === 'Other (Custom)' && (!data.name || data.name.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Charge Name is required when type is Other (Custom)',
  path: ['name']
}).refine(data => {
  if (data.mode === 'Percentage' && data.amount > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage cannot exceed 100',
  path: ['amount']
});

const discountSchema = z.object({
  mode: z.enum(['Fixed Amount', 'Percentage']),
  amount: z.coerce.number().positive('Amount must be positive')
}).refine(data => {
  if (data.mode === 'Percentage' && data.amount > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage cannot exceed 100',
  path: ['amount']
});

const invoiceSchema = z.object({
  clientId: z.string().optional().nullable(),
  clientSnapshot: z
    .object({
      name: z.string().min(1, 'Client name is required'),
      email: z.string().email('Invalid client email'),
      phone: z.string().optional(),
      address: z.string().optional(),
      GSTIN: z.string().optional(),
      country: z.string().default('India').optional(),
    })
    .optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  additionalCharges: z.array(additionalChargeSchema).optional().default([]),
  discount: discountSchema.optional().nullable(),
  subtotal: z.number().min(0),
  gstPercent: z.number().refine((v) => [0, 5, 12, 18, 28].includes(v), 'Invalid GST rate'),
  gstAmount: z.number().min(0),
  total: z.number().min(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED']).default('INR'),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid due date'),
  issueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  terms: z.string().max(1000).optional(),
  paymentLink: z.string().url('Invalid payment link').optional().or(z.literal('')),
});

const updateInvoiceSchema = invoiceSchema.partial();

// ─── Profile Schema ────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  businessName: z.string().max(200).optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  GSTIN: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN')
    .optional()
    .or(z.literal('')),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  invoicePrefix: z.string().max(10).optional(),
  logo: z.string().optional().nullable(),
  signature: z.string().optional().nullable(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  invoiceSchema,
  updateInvoiceSchema,
  profileSchema,
};
