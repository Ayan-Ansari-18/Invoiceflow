import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, FileText, Download, Edit2, Trash2, Filter, Send, Loader } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import SEO from '../components/ui/SEO';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import api from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPro } = useSubscription();
  const [statusFilter, setStatusFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () =>
      api.get('/invoices', { params: statusFilter ? { status: statusFilter } : {} })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleDelete = (id, invoiceNumber) => {
    if (window.confirm(`Delete ${invoiceNumber}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = async (invoice) => {
    setDownloadingId(invoice._id);
    try {
      const response = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (inv) => {
    if (!isPro) {
      alert('Upgrades are currently disabled');
      return;
    }
    if (!inv.clientSnapshot?.email) {
      toast.error('This invoice has no client email address.');
      return;
    }
    setSendingId(inv._id);
    try {
      const res = await api.post(`/email/send/${inv._id}`);
      toast.success(res.data.message || `Invoice sent to ${inv.clientSnapshot.email}!`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send email';
      if (msg.includes('Gmail not connected')) {
        toast.error('Gmail not connected! Go to Email Campaigns to connect your Gmail first.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSendingId(null);
    }
  };

  const invoices = data?.invoices || [];

  const statuses = ['', 'draft', 'sent', 'paid', 'overdue'];

  return (
    <AppLayout title="Invoices">
      <SEO title="Invoices" />
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted text-sm">{data?.pagination?.total || 0} total invoices</p>
          </div>
          <div className="flex gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} color="var(--text-dim)" />
              <select
                className="form-select"
                style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: 13 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={(e) => {
                if (!isPro && data?.pagination?.total >= 5) {
                  e.preventDefault();
                  alert('Upgrades are currently disabled');
                  toast.error('Free plan limit reached (5 invoices). Upgrade to Pro.');
                } else {
                  navigate('/invoices/new');
                }
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> New Invoice
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon"><FileText size={36} /></div>
              <h3 className="empty-title">No invoices yet</h3>
              <p className="empty-desc">
                Create your first professional GST invoice in minutes.
              </p>
              <Link to="/invoices/new" className="btn btn-primary">
                <Plus size={16} /> Create First Invoice
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.map((inv) => (
                  <tr key={inv._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv._id}`)}>
                    <td data-label="Invoice #" className="primary-cell" style={{ fontWeight: 700, color: '#a5b4fc' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td data-label="Client" className="primary-cell">
                      {inv.clientSnapshot?.name || inv.clientId?.name || '—'}
                    </td>
                    <td data-label="Amount" style={{ color: '#fff', fontWeight: 600 }}>
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td data-label="Issue Date">{formatDate(inv.issueDate || inv.createdAt)}</td>
                    <td data-label="Due Date">{formatDate(inv.dueDate)}</td>
                    <td data-label="Status"><StatusBadge status={inv.status} /></td>
                    <td data-label="Actions">
                      <div
                        className="flex gap-2 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/invoices/${inv._id}/edit`)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleSendEmail(inv)}
                          disabled={sendingId === inv._id}
                          title="Send via Email (Pro)"
                          style={{ color: '#818CF8' }}
                        >
                          {sendingId === inv._id ? <Loader className="spin" size={14} /> : <Send size={14} />}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDownload(inv)}
                          disabled={downloadingId === inv._id}
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InvoiceListPage;
