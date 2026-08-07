import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, FileText, Clock, CheckCircle, AlertTriangle, Zap, Lock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import SEO from '../components/ui/SEO';
import { formatCurrency, formatDate } from '../utils/helpers';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-2">
      <span className="stat-label">{label}</span>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        <Icon size={18} />
      </div>
    </div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { isPro } = useSubscription();

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices', { params: { limit: 50 } }).then((r) => r.data),
  });

  const invoices = invoiceData?.invoices || [];

  // Compute stats
  const paid = invoices.filter((i) => i.status === 'paid');
  const pending = invoices.filter((i) => i.status === 'sent');
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const totalRevenue = paid.reduce((sum, i) => sum + i.total, 0);
  const pendingRevenue = pending.reduce((sum, i) => sum + i.total, 0);

  const recent = [...invoices].slice(0, 8);

  return (
    <AppLayout title="Dashboard">
      <SEO title="Dashboard" />
      {!isPro ? (
        /* ---- Free users: locked dashboard ---- */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)', textAlign: 'center', padding: '40px 24px'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, boxShadow: '0 12px 32px rgba(99,102,241,0.3)'
          }}>
            <Lock size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Dashboard Analytics is a Pro Feature
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, marginBottom: 32, lineHeight: 1.6 }}>
            Upgrade to Pro to unlock total revenue tracking, pending & overdue alerts, recent invoice history, and advanced analytics.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => alert('Upgrades are currently disabled')}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              <Zap size={16} /> Upgrade to Pro
            </button>
            <Link to="/invoices" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Go to Invoices
            </Link>
          </div>
        </div>
      ) : (
        /* ---- Pro users: full dashboard ---- */
        <div>
          {/* Welcome */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="highlight">{user?.name?.split(' ')[0] || 'there'}!</span> 👋
            </h2>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>
              Here's your invoicing overview for today.
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub={`${paid.length} paid invoice${paid.length !== 1 ? 's' : ''}`} icon={TrendingUp} color="#10b981" />
            <StatCard label="Pending" value={formatCurrency(pendingRevenue)} sub={`${pending.length} awaiting payment`} icon={Clock} color="#f59e0b" />
            <StatCard label="Overdue" value={overdue.length} sub={overdue.length ? 'Requires attention!' : 'All clear!'} icon={AlertTriangle} color={overdue.length ? '#ef4444' : '#10b981'} />
            <StatCard label="Total Invoices" value={invoiceData?.pagination?.total || 0} sub="All time" icon={FileText} color="#6366f1" />
          </div>

          {/* Recent Invoices */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Recent Invoices</h3>
              <Link to="/invoices/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> New Invoice
              </Link>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <div className="empty-icon"><FileText size={32} /></div>
                <h3 className="empty-title">No invoices yet</h3>
                <p className="empty-desc">Create your first invoice to get started.</p>
                <Link to="/invoices/new" className="btn btn-primary">
                  <Plus size={16} /> Create Invoice
                </Link>
              </div>
            ) : (
              <div className="table-wrapper" style={{ borderRadius: 10 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((inv) => (
                      <tr key={inv._id}>
                        <td>
                          <Link to={`/invoices/${inv._id}`} style={{ color: '#a5b4fc', fontWeight: 700, textDecoration: 'none' }}>
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="primary-cell">{inv.clientSnapshot?.name || inv.clientId?.name || '—'}</td>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(inv.total, inv.currency)}</td>
                        <td>{formatDate(inv.dueDate)}</td>
                        <td><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {invoices.length > 8 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/invoices" className="btn btn-ghost btn-sm">View all invoices →</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
