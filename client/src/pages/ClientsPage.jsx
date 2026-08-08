import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Users, Edit2, Trash2, Mail, Phone, Lock, Zap } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';
import { getErrorMessage } from '../utils/helpers';
import api from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

const ClientsPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', GSTIN: '' });
  const { isPro } = useSubscription();

  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/clients', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client added!'); setShowForm(false); setForm({ name: '', email: '', phone: '', address: '', GSTIN: '' }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/clients/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client updated!'); setEditing(null); setShowForm(false); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/clients/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client deleted'); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Client name is required');
    if (editing) updateMutation.mutate({ id: editing._id, data: form });
    else createMutation.mutate(form);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', address: client.address || '', GSTIN: client.GSTIN || '' });
    setShowForm(true);
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '', GSTIN: '' }); setShowForm(true); };

  const clients = data?.clients || [];

  return (
    <AppLayout title="Clients">
      <SEO title="Clients" />
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          <button className="btn btn-primary" onClick={openCreate} disabled={!isPro}>
            <Plus size={16} /> Add Client
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{editing ? 'Edit Client' : 'New Client'}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name <span className="required">*</span></label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Pvt. Ltd." />
                </div>
                <div className="form-row form-row-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@acme.com" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone <span className="required">*</span></label>
                    <input className="form-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">GSTIN</label>
                  <input className="form-input" value={form.GSTIN} onChange={(e) => setForm({ ...form, GSTIN: e.target.value.toUpperCase() })} placeholder="29ABCDE1234F1Z5" maxLength={15} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Address <span className="required">*</span></label>
                  <textarea className="form-textarea" required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State PIN" />
                </div>
                <div className="flex gap-3 justify-end" style={{ marginTop: 4 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${(createMutation.isPending || updateMutation.isPending) ? 'btn-loading' : ''}`}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editing ? 'Save Changes' : 'Add Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pro Wall Overlay Container */}
        <div style={{ position: 'relative' }}>
          {!isPro && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(9, 9, 11, 0.4)'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99,102,241,0.3)',
                padding: '32px 40px', borderRadius: 16, textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: 400
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={24} color="#fff" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Client Management Locked</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Upgrade to Pro to save, manage, and reuse client details across all your invoices.</p>
                <button onClick={() => alert('Upgrades are currently disabled')} className="btn btn-primary btn-full" style={{ padding: '12px 16px' }}>
                  <Zap size={16} /> Upgrade to Pro
                </button>
              </div>
            </div>
          )}

          <div style={{ filter: !isPro ? 'blur(8px)' : 'none', pointerEvents: !isPro ? 'none' : 'auto', userSelect: !isPro ? 'none' : 'auto' }}>
            {/* Client Grid */}
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
              </div>
            ) : clients.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon"><Users size={36} /></div>
                  <h3 className="empty-title">No clients yet</h3>
                  <p className="empty-desc">Add your first client to auto-fill invoices quickly.</p>
                  <button className="btn btn-primary" onClick={openCreate} style={{ pointerEvents: 'auto' }}><Plus size={16} /> Add Client</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {clients.map((client) => (
                  <div key={client._id} className="card" style={{ transition: 'all 0.2s' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#a5b4fc', fontSize: 16
                      }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(client)} title="Edit"><Edit2 size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(`Delete ${client.name}?`)) deleteMutation.mutate(client._id); }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 8 }}>{client.name}</div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted" style={{ marginBottom: 4 }}>
                        <Mail size={12} /> {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted" style={{ marginBottom: 4 }}>
                        <Phone size={12} /> {client.phone}
                      </div>
                    )}
                    {client.GSTIN && (
                      <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        GSTIN: {client.GSTIN}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientsPage;
