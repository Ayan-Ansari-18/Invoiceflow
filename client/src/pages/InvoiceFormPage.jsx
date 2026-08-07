import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Download, Save, Eye, User, FileText,
  Calculator, StickyNote, ArrowLeft, Lock
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import InvoicePreview from '../components/ui/InvoicePreview';
import SEO from '../components/ui/SEO';
import { calcTotals, GST_OPTIONS, CURRENCY_OPTIONS, getErrorMessage, formatCurrency } from '../utils/helpers';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  qty: z.coerce.number().positive('Must be > 0'),
  rate: z.coerce.number().min(0, 'Cannot be negative'),
  amount: z.coerce.number().optional(),
});

const schema = z.object({
  clientSnapshot: z.object({
    name: z.string().min(1, 'Client name required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    address: z.string().optional(),
    GSTIN: z.string().optional(),
  }),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one item'),
  gstPercent: z.coerce.number(),
  currency: z.string(),
  dueDate: z.string().min(1, 'Due date required'),
  issueDate: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentLink: z.string().optional(),
});

// ─── Form Section Wrapper ──────────────────────────────────────────────────────
const FormSection = ({ icon: Icon, title, children }) => (
  <div className="form-section">
    <div className="form-section-header">
      <div className="form-section-icon"><Icon size={16} /></div>
      <h3 className="form-section-title">{title}</h3>
    </div>
    <div className="form-section-body">{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoiceFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isPro } = useSubscription();
  const [isDownloading, setIsDownloading] = useState(false);

  const defaultValues = {
    clientSnapshot: { name: '', email: '', phone: '', address: '', GSTIN: '' },
    lineItems: [{ description: '', qty: 1, rate: 0, amount: 0 }],
    gstPercent: 18,
    currency: 'INR',
    dueDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    terms: 'Payment due within 30 days of invoice date.',
    paymentLink: '',
  };

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const { fields: additionalChargesFields, append: appendCharge, remove: removeCharge } = useFieldArray({ control, name: 'additionalCharges' });

  // Load existing invoice for editing
  const { data: existingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`).then((r) => r.data.invoice),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingInvoice) {
      reset({
        clientSnapshot: existingInvoice.clientSnapshot || {},
        lineItems: existingInvoice.lineItems,
        additionalCharges: existingInvoice.additionalCharges || [],
        discount: existingInvoice.discount || null,
        gstPercent: existingInvoice.gstPercent,
        currency: existingInvoice.currency,
        dueDate: existingInvoice.dueDate?.split('T')[0] || '',
        issueDate: existingInvoice.issueDate?.split('T')[0] || '',
        notes: existingInvoice.notes || '',
        terms: existingInvoice.terms || '',
        paymentLink: existingInvoice.paymentLink || '',
      });
    }
  }, [existingInvoice, reset]);

  // Reset form when clicking "+ New Invoice" while already on the page
  useEffect(() => {
    if (!isEditing) {
      reset({
        clientSnapshot: { name: '', email: '', phone: '', address: '', GSTIN: '', country: 'India' },
        lineItems: [{ description: '', qty: 1, rate: 0, amount: 0 }],
        additionalCharges: [],
        discount: null,
        gstPercent: 18,
        currency: 'INR',
        dueDate: '',
        issueDate: new Date().toISOString().split('T')[0],
        notes: '',
        terms: 'Payment due within 30 days of invoice date.',
        paymentLink: '',
      });
    }
  }, [location.key, isEditing, reset]);

  // Watch form for live preview
  const watched = watch();

  const items = watched?.lineItems || [];
  const effectiveGst = watched?.clientSnapshot?.country === 'India' ? Number(watched?.gstPercent || 0) : 0;
  const { subtotal, totalAdditionalCharges, totalDiscount, gstAmount, total } = calcTotals(items, effectiveGst, watched?.additionalCharges || [], watched?.discount || null);
  
  const previewData = {
    ...watched,
    lineItems: items,
    subtotal,
    totalAdditionalCharges,
    totalDiscount,
    gstAmount,
    total,
    invoiceNumber: existingInvoice?.invoiceNumber || 'INV-???',
    status: existingInvoice?.status || 'draft',
  };

  // Auto-calculate line item amounts
  useEffect(() => {
    const currentItems = watched?.lineItems || [];
    if (currentItems.length === 0) return;
    currentItems.forEach((item, i) => {
      const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
      setValue(`lineItems.${i}.amount`, parseFloat(amount.toFixed(2)));
    });
  }, [JSON.stringify((watched?.lineItems || [])?.map((l) => `${l?.qty}x${l?.rate}`))]);

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const isIndia = formData.clientSnapshot?.country === 'India' || !formData.clientSnapshot?.country;
      const gstPercent = isIndia ? Number(formData.gstPercent) : 0;
      const { subtotal, totalAdditionalCharges, totalDiscount, gstAmount, total } = calcTotals(formData.lineItems, gstPercent, formData.additionalCharges || [], formData.discount || null);
      const payload = { ...formData, gstPercent, subtotal, totalAdditionalCharges, totalDiscount, gstAmount, total };

      if (isEditing) {
        return api.put(`/invoices/${id}`, payload).then((r) => r.data.invoice);
      }
      return api.post('/invoices', payload).then((r) => r.data.invoice);
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(isEditing ? 'Invoice updated!' : 'Invoice created!');
      navigate(`/invoices/${invoice._id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data) => saveMutation.mutate(data);

  const handleDownloadPDF = async () => {
    if (!isEditing) {
      toast.error('Save the invoice first, then download PDF');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${existingInvoice?.invoiceNumber || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const isLimitReached = !isPro && !isEditing && user?.invoiceCounter >= 5;

  return (
    <AppLayout title={isEditing ? 'Edit Invoice' : 'New Invoice'}>
      <SEO title={isEditing ? 'Edit Invoice' : 'New Invoice'} />
      <div>
        {/* Top Bar Actions */}
        <div className="flex items-center justify-between mb-6">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-3">
            {isEditing && (
              <button
                className={`btn btn-secondary ${isDownloading ? 'btn-loading' : ''}`}
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                <Download size={16} /> Download PDF
              </button>
            )}
            <button
              className={`btn btn-primary ${isSubmitting || saveMutation.isPending ? 'btn-loading' : ''}`}
              onClick={isLimitReached ? () => alert('Upgrades are currently disabled') : handleSubmit(onSubmit)}
              disabled={isSubmitting || saveMutation.isPending}
            >
              {isLimitReached ? <><Lock size={16} /> Upgrade to Create</> : <><Save size={16} /> {isEditing ? 'Save Changes' : 'Create Invoice'}</>}
            </button>
          </div>
        </div>

        {isLimitReached && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12
          }}>
            <Lock size={20} color="#ef4444" />
            <div>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>Free Plan Limit Reached</div>
              <div style={{ color: '#fca5a5', fontSize: 13 }}>You've created 5/5 free invoices. Upgrade to Pro for unlimited invoices.</div>
            </div>
            <button 
              className="btn btn-sm" 
              style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff' }}
              onClick={() => alert('Upgrades are currently disabled')}
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Two-column Layout */}
        <div className="invoice-form-layout">
          {/* Left: Form */}
          <div className="invoice-form-panel">
            {/* Client Details */}
            <FormSection icon={User} title="Client Details">
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Client Name <span className="required">*</span></label>
                  <input
                    {...register('clientSnapshot.name')}
                    className={`form-input ${errors.clientSnapshot?.name ? 'error' : ''}`}
                    placeholder="Acme Pvt. Ltd."
                  />
                  {errors.clientSnapshot?.name && (
                    <p className="form-error">{errors.clientSnapshot.name.message}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Client Email <span className="required">*</span></label>
                  <input
                    {...register('clientSnapshot.email')}
                    className={`form-input ${errors.clientSnapshot?.email ? 'error' : ''}`}
                    placeholder="client@company.com"
                    type="email"
                  />
                  {errors.clientSnapshot?.email && (
                    <p className="form-error">{errors.clientSnapshot.email.message}</p>
                  )}
                </div>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    {...register('clientSnapshot.phone')}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN</label>
                  <input
                    {...register('clientSnapshot.GSTIN')}
                    className="form-input"
                    placeholder="29ABCDE1234F1Z5"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country <span className="required">*</span></label>
                  <select {...register('clientSnapshot.country')} className="form-select">
                    <option value="India">India</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address</label>
                <textarea
                  {...register('clientSnapshot.address')}
                  className="form-textarea"
                  placeholder="123 MG Road, Bangalore, Karnataka 560001"
                  rows={2}
                />
              </div>
            </FormSection>

            {/* Invoice Details */}
            <FormSection icon={FileText} title="Invoice Details">
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    {...register('issueDate')}
                    className="form-input"
                    type="date"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date <span className="required">*</span></label>
                  <input
                    {...register('dueDate')}
                    className={`form-input ${errors.dueDate ? 'error' : ''}`}
                    type="date"
                  />
                  {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Currency
                    {!isPro && <span style={{ fontSize: 10, background: 'rgba(79,70,229,0.1)', color: '#6366f1', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={10} /> Pro Feature</span>}
                  </label>
                  <select 
                    {...register('currency')} 
                    className="form-select" 
                    disabled={!isPro}
                    style={{ opacity: !isPro ? 0.7 : 1, cursor: !isPro ? 'not-allowed' : 'pointer' }}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {!isPro && (
                    <button type="button" onClick={() => alert('Upgrades are currently disabled')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 11, marginTop: 4, cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                      Unlock Multi-currency
                    </button>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Line Items */}
            <FormSection icon={Calculator} title="Line Items">
              <div style={{ overflowX: 'auto' }}>
                <table className="line-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Description</th>
                      <th style={{ width: '12%' }}>Qty</th>
                      <th style={{ width: '20%' }}>Rate</th>
                      <th style={{ width: '17%', textAlign: 'right' }}>Amount</th>
                      <th style={{ width: '6%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fields || [])?.map((field, i) => {
                      const qty = parseFloat(watched?.lineItems?.[i]?.qty) || 0;
                      const rate = parseFloat(watched?.lineItems?.[i]?.rate) || 0;
                      const amount = qty * rate;
                      return (
                        <tr key={field.id}>
                          <td>
                            <input
                              {...register(`lineItems.${i}.description`)}
                              className="line-input"
                              placeholder="Web development services"
                            />
                          </td>
                          <td>
                            <input
                              {...register(`lineItems.${i}.qty`)}
                              className="line-input line-input-sm"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="1"
                            />
                          </td>
                          <td>
                            <input
                              {...register(`lineItems.${i}.rate`)}
                              className="line-input line-input-md"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="amount-cell">
                            {formatCurrency(amount, watched.currency || 'INR')}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="remove-row-btn"
                              onClick={() => fields.length > 1 && remove(i)}
                              disabled={fields.length === 1}
                              title="Remove row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.lineItems && (
                <p className="form-error" style={{ marginTop: 8 }}>
                  {typeof errors.lineItems.message === 'string' ? errors.lineItems.message : 'Fix line items'}
                </p>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => append({ description: '', qty: 1, rate: 0, amount: 0 })}
              >
                <Plus size={14} /> Add Line Item
              </button>

              {/* GST + Totals */}
              <div className="divider" />

              {/* Additional Charges */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>Additional Charges (Optional)</h4>
                {(additionalChargesFields || []).map((field, i) => (
                  <div key={field.id} className="form-row form-row-4" style={{ marginBottom: 8, alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Charge Type</label>
                      <select {...register(`additionalCharges.${i}.type`)} className="form-select">
                        <option value="">Select Charge Type</option>
                        <option value="Payment Processing Fee">Payment Processing Fee</option>
                        <option value="Bank Transfer Fee">Bank Transfer Fee</option>
                        <option value="Consultation Fee">Consultation Fee</option>
                        <option value="Maintenance Fee">Maintenance Fee</option>
                        <option value="Rush Delivery Fee">Rush Delivery Fee</option>
                        <option value="Service Charge">Service Charge</option>
                        <option value="Other (Custom)">Other (Custom)</option>
                      </select>
                    </div>
                    {watched?.additionalCharges?.[i]?.type === 'Other (Custom)' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Charge Name *</label>
                        <input {...register(`additionalCharges.${i}.name`)} className="form-input" placeholder="Name" />
                      </div>
                    )}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Mode</label>
                      <select {...register(`additionalCharges.${i}.mode`)} className="form-select">
                        <option value="Fixed Amount">Fixed Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Amount</label>
                      <input type="number" step="0.01" {...register(`additionalCharges.${i}.amount`)} className="form-input" placeholder="0.00" />
                    </div>
                    <button type="button" className="btn btn-ghost" onClick={() => removeCharge(i)} style={{ color: '#ef4444', height: 42 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => appendCharge({ type: '', mode: 'Fixed Amount', amount: 0 })}>
                  <Plus size={14} /> Add Charge
                </button>
              </div>

              <div className="divider" />
              
              {/* Discount */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Discount (Optional)</h4>
                  {watched?.discount === null ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setValue('discount', { mode: 'Percentage', amount: 0 })}>
                      <Plus size={14} /> Add Discount
                    </button>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setValue('discount', null)} style={{ color: '#ef4444' }}>
                      <Trash2 size={14} /> Remove Discount
                    </button>
                  )}
                </div>
                {watched?.discount !== null && (
                  <div className="form-row form-row-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Discount Mode</label>
                      <select {...register('discount.mode')} className="form-select">
                        <option value="Fixed Amount">Fixed Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Amount</label>
                      <input type="number" step="0.01" {...register('discount.amount')} className="form-input" placeholder="0.00" />
                    </div>
                  </div>
                )}
              </div>

              <div className="divider" />
              <div className="form-row form-row-2" style={{ alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    GST Rate
                    {!isPro && watched?.clientSnapshot?.country === 'India' && <span style={{ fontSize: 10, background: 'rgba(79,70,229,0.1)', color: '#6366f1', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={10} /> Pro Feature</span>}
                  </label>
                  <select 
                    {...register('gstPercent')} 
                    className="form-select"
                    disabled={!isPro || watched?.clientSnapshot?.country !== 'India'}
                    style={{ opacity: (!isPro || watched?.clientSnapshot?.country !== 'India') ? 0.7 : 1, cursor: (!isPro || watched?.clientSnapshot?.country !== 'India') ? 'not-allowed' : 'pointer' }}
                  >
                    {watched?.clientSnapshot?.country !== 'India' ? (
                      <option value="0">0% (N/A for Non-India)</option>
                    ) : isPro ? (
                      GST_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))
                    ) : (
                      <option value="0">0% (Pro Required)</option>
                    )}
                  </select>
                  {!isPro && watched?.clientSnapshot?.country === 'India' && (
                    <button type="button" onClick={() => alert('Upgrades are currently disabled')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 11, marginTop: 4, cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                      Unlock GST Calculation
                    </button>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
                    Subtotal: <strong style={{ color: 'var(--text)' }}>{formatCurrency(previewData.subtotal || 0, watched.currency || 'INR')}</strong>
                  </div>
                  {Number(watched.gstPercent) > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
                      GST ({watched.gstPercent}%): <strong style={{ color: 'var(--text)' }}>
                        {formatCurrency(previewData.gstAmount || 0, watched.currency || 'INR')}
                      </strong>
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#a5b4fc' }}>
                    Total: {formatCurrency(previewData.total || 0, watched.currency || 'INR')}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Notes & Terms */}
            <FormSection icon={StickyNote} title="Notes & Terms">
              <div className="form-group">
                <label className="form-label">Notes (visible on invoice)</label>
                <textarea
                  {...register('notes')}
                  className="form-textarea"
                  placeholder="Thank you for your business! Payment via NEFT/UPI preferred."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea
                  {...register('terms')}
                  className="form-textarea"
                  placeholder="Payment due within 30 days. Late payments subject to 2% monthly interest."
                  rows={3}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Link (UPI / Bank)</label>
                <input
                  {...register('paymentLink')}
                  className="form-input"
                  placeholder="upi://pay?pa=yourname@upi or https://razorpay.com/..."
                />
              </div>
            </FormSection>
          </div>

          {/* Right: Preview */}
          <div className="invoice-preview-sticky">
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={16} color="var(--text-dim)" />
              <span className="text-sm text-dim">Live Preview</span>
            </div>
            <InvoicePreview data={previewData} user={user} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoiceFormPage;
