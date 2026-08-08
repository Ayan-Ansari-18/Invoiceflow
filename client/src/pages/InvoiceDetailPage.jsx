import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download, Edit2, Trash2, ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import InvoicePreview from '../components/ui/InvoicePreview';
import StatusBadge from '../components/ui/StatusBadge';
import SEO from '../components/ui/SEO';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { useSubscription } from '../hooks/useSubscription';
import { Loader } from 'lucide-react';

const STATUS_ACTIONS = [
  { status: 'draft', icon: Clock, label: 'Draft' },
  { status: 'sent', icon: Send, label: 'Mark Sent' },
  { status: 'viewed', icon: Eye, label: 'Mark Viewed' },
  { status: 'paid', icon: CheckCircle, label: 'Mark Paid' },
  { status: 'overdue', icon: AlertTriangle, label: 'Mark Overdue' },
];

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isPro } = useSubscription();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`).then((r) => r.data.invoice),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
      navigate('/invoices');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.patch(`/invoices/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Status updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data?.invoiceNumber || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!data?.clientSnapshot?.email) {
      toast.error('This invoice has no client email address.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await api.post(`/email/send/${data._id}`);
      toast.success(res.data.message || `Invoice sent to ${data.clientSnapshot.email}!`);
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      if (data?.status === 'draft') {
        statusMutation.mutate('sent');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send email';
      if (msg.includes('Gmail not connected')) {
        toast.error('Gmail not connected! Go to Email Campaigns to connect your Gmail first.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Invoice Detail">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!data) return <AppLayout title="Invoice Not Found"><p>Invoice not found.</p></AppLayout>;

  const invoice = data;

  return (
    <AppLayout title={`Invoice ${invoice.invoiceNumber}`}>
      <SEO title={`Invoice ${invoice.invoiceNumber}`} />
      <div>
        {/* Top Actions */}
        <div className="detail-actions-top mb-6">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} /> Back to Invoices
          </button>
          <div className="flex gap-3">
            <Link to={`/invoices/${id}/edit`} className="btn btn-secondary btn-sm">
              <Edit2 size={14} /> Edit
            </Link>
            <button 
              onClick={handleSendEmail} 
              disabled={isSendingEmail}
              className="btn btn-secondary btn-sm" 
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              {isSendingEmail ? <Loader className="spin" size={14} /> : <Send size={14} />}
              Send via Email
            </button>
            <button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="btn btn-primary btn-sm"
            >
              {isDownloading ? <Loader className="spin" size={14} /> : <Download size={14} />}
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('Delete this invoice?')) deleteMutation.mutate();
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="invoice-detail-grid">
          {/* Left: Preview */}
          <div id="invoice-pdf-content">
            <InvoicePreview data={invoice} user={user} />
          </div>

          {/* Right: Sidebar Info */}
          <div className="flex flex-col gap-4">
            {/* Status Card */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Payment Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUS_ACTIONS.map(({ status, icon: Icon, label }) => (
                  <button
                    key={status}
                    className={`btn btn-sm ${invoice.status === status ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => invoice.status !== status && statusMutation.mutate(status)}
                    disabled={statusMutation.isPending}
                  >
                    <Icon size={14} />
                    {label}
                    {invoice.status === status && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Invoice #', value: invoice.invoiceNumber },
                  { label: 'Status', value: <StatusBadge status={invoice.status} /> },
                  { label: 'Client', value: invoice.clientSnapshot?.name || '—' },
                  { label: 'Issue Date', value: formatDate(invoice.issueDate || invoice.createdAt) },
                  { label: 'Due Date', value: formatDate(invoice.dueDate) },
                  { label: 'Subtotal', value: formatCurrency(invoice.subtotal, invoice.currency) },
                  invoice.gstPercent > 0 && { label: `GST (${invoice.gstPercent}%)`, value: formatCurrency(invoice.gstAmount, invoice.currency) },
                  { label: 'Total', value: formatCurrency(invoice.total, invoice.currency), bold: true },
                ].filter(Boolean).map(({ label, value, bold }) => (
                  <div key={label} className="flex justify-between" style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                    <span style={{ color: bold ? '#a5b4fc' : 'var(--text)', fontWeight: bold ? 800 : 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoiceDetailPage;
