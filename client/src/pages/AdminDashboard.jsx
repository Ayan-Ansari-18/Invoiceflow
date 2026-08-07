import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import SEO from '../components/ui/SEO';
import api from '../services/api';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.stats;
    },
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users;
    },
  });

  // Toggle Ban Mutation
  const toggleBanMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.put(`/admin/users/${userId}/ban`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User ban status updated');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update ban status');
    }
  });

  // Update Plan Mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }) => {
      const res = await api.put(`/admin/users/${userId}/plan`, { plan });
      return res.data;
    },
    onSuccess: () => {
      toast.success('User plan updated');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      if (!window.confirm('Are you sure you want to permanently delete this user?')) return null;
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries(['adminUsers']);
        queryClient.invalidateQueries(['adminStats']);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  });

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <SEO title="Super Admin Dashboard" />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Super Admin Dashboard</h1>
        <p style={{ color: 'var(--text-dim)' }}>Manage users and platform statistics.</p>
      </div>

      {statsLoading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 600 }}>{statsData?.totalUsers}</p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Pro/Business Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{statsData?.proUsers}</p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Banned Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>{statsData?.bannedUsers}</p>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Invoices</h3>
            <p style={{ fontSize: '2rem', fontWeight: 600 }}>{statsData?.totalInvoices}</p>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Registered Users</h2>
        </div>
        
        {usersLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-dim)' }}>User</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-dim)' }}>Plan</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-dim)' }}>Joined</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-dim)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', opacity: user.isBanned ? 0.5 : 1 }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{user.name} {user.isAdmin && <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Admin</span>}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <select 
                        value={user.plan} 
                        onChange={(e) => updatePlanMutation.mutate({ userId: user._id, plan: e.target.value })}
                        disabled={updatePlanMutation.isPending || user.isAdmin}
                        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 4 }}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: 14 }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => toggleBanMutation.mutate(user._id)}
                          disabled={user.isAdmin || toggleBanMutation.isPending}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: 12, borderColor: user.isBanned ? 'var(--primary)' : 'var(--border)', color: user.isBanned ? 'var(--primary)' : 'var(--text)' }}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(user._id)}
                          disabled={user.isAdmin || deleteMutation.isPending}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: 12, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usersData?.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
