import { formatCurrency, formatDate } from '../../utils/helpers';
import { useSubscription } from '../../hooks/useSubscription';

const InvoicePreview = ({ data, user }) => {
  const {
    clientSnapshot = {},
    lineItems = [],
    subtotal = 0,
    gstPercent = 18,
    gstAmount = 0,
    total = 0,
    currency = 'INR',
    invoiceNumber = 'INV-001',
    issueDate,
    dueDate,
    notes,
    terms,
    status = 'draft',
    additionalCharges = [],
    discount = null,
    totalAdditionalCharges = 0,
    totalDiscount = 0,
  } = data || {};

  const { isPro } = useSubscription();
  const brandColor = user?.brandColor || '#6366f1';
  const logoData = isPro ? user?.logo : null;
  const signatureData = isPro ? user?.signature : null;

  return (
    <div className="invoice-preview fade-in">
      {/* Header */}
      <div className="preview-header" style={{ background: `linear-gradient(135deg, ${brandColor}, #4f46e5)` }}>
        <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {logoData && (
            <img src={logoData} alt="Logo" style={{ height: 40, width: 40, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 2 }} />
          )}
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {user?.businessName || user?.name || 'Your Business'}
          </div>
        </div>
          <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.5 }}>
            {user?.businessAddress || ''}
            {user?.GSTIN && <><br />GSTIN: {user.GSTIN}</>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: '1px', textTransform: 'uppercase' }}>Invoice</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{invoiceNumber}</div>
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 12,
            background: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', marginTop: 4
          }}>{status}</span>
        </div>
      </div>

      {/* Body */}
      <div className="preview-body">
        {/* Dates */}
        <div className="preview-meta-row">
          {[
            { label: 'Issue Date', value: formatDate(issueDate || new Date()) },
            { label: 'Due Date', value: formatDate(dueDate), danger: true },
            { label: 'Currency', value: currency },
          ].map(({ label, value, danger }) => (
            <div key={label} className="preview-meta-block">
              <div className="preview-section-label">{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: danger && dueDate ? '#dc2626' : '#1a1a2e' }}>
                {value || '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Bill To / From */}
        <div className="preview-bill-row">
          <div style={{ flex: 1 }}>
            <div className="preview-section-label">Bill To</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{clientSnapshot.name || '—'}</div>
            {clientSnapshot.email && <div style={{ fontSize: 11, color: '#6b7280' }}>{clientSnapshot.email}</div>}
            {clientSnapshot.address && <div style={{ fontSize: 11, color: '#6b7280' }}>{clientSnapshot.address}</div>}
            {clientSnapshot.GSTIN && (
              <span style={{
                display: 'inline-block', marginTop: 4, padding: '1px 6px',
                background: '#eff6ff', color: '#1d4ed8', borderRadius: 4,
                fontSize: 10, fontWeight: 600
              }}>GSTIN: {clientSnapshot.GSTIN}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="preview-section-label">From</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
              {user?.businessName || user?.name || '—'}
            </div>
            {user?.email && <div style={{ fontSize: 11, color: '#6b7280' }}>{user.email}</div>}
          </div>
        </div>

        {/* Line Items Table */}
        <table className="preview-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '50%' }}>Description</th>
              <th style={{ textAlign: 'center', width: '12%' }}>Qty</th>
              <th style={{ textAlign: 'center', width: '18%' }}>Rate</th>
              <th style={{ textAlign: 'right', width: '20%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(!lineItems || lineItems.length === 0) ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '16px' }}>
                  Add line items to see preview
                </td>
              </tr>
            ) : (
              (lineItems || [])?.map((item, i) => {
                const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <tr key={i}>
                    <td style={{ color: '#374151' }}>{item.description || '—'}</td>
                    <td style={{ textAlign: 'center', color: '#374151' }}>{item.qty || 0}</td>
                    <td style={{ textAlign: 'center', color: '#374151' }}>
                      {formatCurrency(item.rate || 0, currency)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                      {formatCurrency(amount, currency)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="preview-totals">
          <div className="preview-totals-box">
            <div className="preview-total-row">
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal, currency)}</span>
            </div>
            
            {additionalCharges?.map((charge, i) => {
              const chargeName = charge.type === 'Other (Custom)' ? (charge.name || charge.type) : charge.type;
              let chargeAmt = parseFloat(charge.amount) || 0;
              if (charge.mode === 'Percentage') {
                chargeAmt = (subtotal * chargeAmt) / 100;
              }
              if (!chargeName) return null;
              return (
                <div key={i} className="preview-total-row">
                  <span style={{ color: '#6b7280' }}>{chargeName}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(chargeAmt, currency)}</span>
                </div>
              );
            })}

            {discount !== null && totalDiscount > 0 && (
              <div className="preview-total-row">
                <span style={{ color: '#6b7280' }}>Discount</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(totalDiscount, currency)}</span>
              </div>
            )}

            {gstPercent > 0 && (
              <div className="preview-total-row">
                <span style={{ color: '#6b7280' }}>GST ({gstPercent}%)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(gstAmount, currency)}</span>
              </div>
            )}
            <div className="preview-total-row final" style={{ color: brandColor }}>
              <span>Total Due</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f9fafb', borderLeft: `3px solid ${brandColor}`, borderRadius: 4 }}>
            <div className="preview-section-label">Notes</div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>{notes}</div>
          </div>
        )}

        {signatureData && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <div style={{ textAlign: 'center', width: 'fit-content' }}>
              <img src={signatureData} alt="Signature" style={{ maxHeight: 60, objectFit: 'contain', marginBottom: 8 }} />
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 4, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                Authorized Signature
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="preview-footer">
        <span>Thank you for your business!</span>
        <span>Generated with InvoiceFlow</span>
      </div>
    </div>
  );
};

export default InvoicePreview;
