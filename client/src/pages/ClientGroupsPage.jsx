import { Users, Plus, Folder, Trash2, ArrowLeft, TrendingUp, AlertTriangle, Send, Zap, CheckSquare, Square } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const ClientGroupsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState({}); // { [groupId]: [clientId, clientId] }
  const [newGroupName, setNewGroupName] = useState('');
  
  const [activeGroup, setActiveGroup] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  const [bulkForm, setBulkForm] = useState({ amount: '', description: '' });
  const [isBulking, setIsBulking] = useState(false);

  // Fetch real data to calculate analytics and show clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(r => r.data)
  });
  
  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(r => r.data)
  });

  const allClients = clientsData?.clients || [];
  const allInvoices = invoicesData?.invoices || [];

  // Load from local storage
  useEffect(() => {
    const savedGroups = localStorage.getItem('invoiceFlow_clientGroups');
    const savedAssignments = localStorage.getItem('invoiceFlow_groupAssignments');
    if (savedGroups) {
      try { setGroups(JSON.parse(savedGroups)); } catch(e) {}
    }
    if (savedAssignments) {
      try { setAssignments(JSON.parse(savedAssignments)); } catch(e) {}
    }
  }, []);

  const saveAssignments = (newAssigns) => {
    setAssignments(newAssigns);
    localStorage.setItem('invoiceFlow_groupAssignments', JSON.stringify(newAssigns));
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = { id: Date.now().toString(), name: newGroupName };
    const updated = [...groups, newGroup];
    setGroups(updated);
    localStorage.setItem('invoiceFlow_clientGroups', JSON.stringify(updated));
    setNewGroupName('');
    toast.success('Client group created!');
  };

  const handleDeleteGroup = (id) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    localStorage.setItem('invoiceFlow_clientGroups', JSON.stringify(updated));
    
    // clean up assignments
    const newAssigns = { ...assignments };
    delete newAssigns[id];
    saveAssignments(newAssigns);
    
    toast.success('Group deleted');
  };

  const toggleClientInGroup = (clientId, groupId) => {
    const groupClients = assignments[groupId] || [];
    let updatedGroupClients;
    if (groupClients.includes(clientId)) {
      updatedGroupClients = groupClients.filter(id => id !== clientId);
    } else {
      updatedGroupClients = [...groupClients, clientId];
    }
    saveAssignments({ ...assignments, [groupId]: updatedGroupClients });
  };

  // Bulk Modal is removed, using InvoiceFormPage instead

  // Smart Group Logic
  const defaulterClients = allClients.filter(c => {
    // Has at least one overdue invoice
    return allInvoices.some(inv => 
      (inv.clientSnapshot?._id === c._id || inv.clientId?._id === c._id) && 
      inv.status === 'overdue'
    );
  });

  // Calculate Group Analytics
  const getGroupAnalytics = (groupId) => {
    const clientIds = groupId === 'defaulters' ? defaulterClients?.map(c => c._id) : (assignments[groupId] || []);
    let revenue = 0;
    allInvoices.forEach(inv => {
      const cid = inv.clientSnapshot?._id || inv.clientId?._id;
      if (clientIds.includes(cid) && inv.status !== 'draft') {
        revenue += inv.total;
      }
    });
    return { count: clientIds.length, revenue };
  };

  const renderGroupDashboard = () => {
    const isSmart = activeGroup === 'defaulters';
    const groupName = isSmart ? 'Smart Group: Defaulters' : activeGroup.name;
    const clientIds = isSmart ? defaulterClients?.map(c => c._id) : (assignments[activeGroup.id] || []);
    const groupClients = allClients.filter(c => clientIds.includes(c._id));
    const analytics = getGroupAnalytics(isSmart ? 'defaulters' : activeGroup.id);

    return (
      <div className="fade-in">
        <button className="btn btn-ghost" onClick={() => setActiveGroup(null)} style={{ marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Groups
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{groupName}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{analytics.count} clients assigned</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {!isSmart && (
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(true)}>
                <Users size={16} /> Manage Clients
              </button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/invoices/new', { state: { bulkClientIds: clientIds, bulkGroupName: groupName } })} disabled={analytics.count === 0}>
              <Zap size={16} /> Bulk Invoice
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(analytics.revenue, 'INR')}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Automation</span>
            <div className="stat-value" style={{ fontSize: 18, marginTop: 8 }}>Bulk Invoicing Ready</div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Assigned Clients</h3>
        <div className="card">
          {groupClients.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No clients assigned yet. {isSmart ? 'No defaulters found (yay!).' : 'Click "Manage Clients" to add some.'}
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {groupClients?.map(c => (
                  <tr key={c._id}>
                    <td style={{ color: '#fff' }}>{c.name}</td>
                    <td>{c.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Bulk Modal has been replaced by the full invoice form */}

        {/* Assign Modal */}
        {showAssignModal && !isSmart && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h3 className="modal-title">Manage Clients</h3>
                <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allClients?.map(c => {
                  const isAssigned = (assignments[activeGroup.id] || []).includes(c._id);
                  return (
                    <div 
                      key={c._id} 
                      onClick={() => toggleClientInGroup(c._id, activeGroup.id)}
                      style={{ 
                        padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, 
                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                        border: isAssigned ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent'
                      }}
                    >
                      {isAssigned ? <CheckSquare size={20} color="#818CF8" /> : <Square size={20} color="#475569" />}
                      <div>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary btn-full" onClick={() => setShowAssignModal(false)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout title="Client Groups">
      <SEO title="Client Groups - Pro" />
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {activeGroup ? renderGroupDashboard() : (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Client Groups</h2>
                <p style={{ color: 'var(--text-muted)' }}>Organize your clients into segments for bulk invoicing and analytics.</p>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: 24 }}>
              <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. VIP Clients, Monthly Retainers..." 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={!newGroupName.trim()}>
                  <Plus size={16} /> Create Group
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {/* Smart Group Card */}
              <div 
                className="card" 
                style={{ padding: 20, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', background: 'linear-gradient(135deg, rgba(239,68,68,0.05), transparent)' }}
                onClick={() => setActiveGroup('defaulters')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Smart Group: Defaulters</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{defaulterClients.length} clients with overdue invoices</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#ef4444' }}>Auto-updates based on invoice status</div>
              </div>

              {/* Custom Groups */}
              {groups?.map((g) => {
                const analytics = getGroupAnalytics(g.id);
                return (
                  <div key={g.id} className="card" style={{ padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => setActiveGroup(g)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{g.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{analytics.count} clients</div>
                        </div>
                      </div>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                        style={{ color: '#ef4444' }}
                        title="Delete Group"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Revenue</div>
                        <div style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(analytics.revenue, 'USD')}</div>
                      </div>
                      <div style={{ color: '#818CF8', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        View Group <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClientGroupsPage;
