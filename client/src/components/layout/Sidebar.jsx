import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Plus, Users, Settings, LogOut, Zap,
  Mail, Palette, Lock, Folder
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { useSubscription } from '../../hooks/useSubscription';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/clients', icon: Users, label: 'Clients' },
];

const PRO_NAV_ITEMS = [
  { id: 'client-groups', icon: Folder, label: 'Client Groups' },
  { id: 'email', icon: Mail, label: 'Email Campaigns' },
  { id: 'branding', icon: Palette, label: 'Custom Branding' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { isPro } = useSubscription();

  const handleLogout = () => {
    localStorage.removeItem('invoiceFlow_isPro');
    window.dispatchEvent(new Event('subscriptionChange'));
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/company-logo.png"
            alt="Company Logo"
            style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }}
          />
          <div>
            <div className="sidebar-logo-text">InvoiceFlow</div>
            <div className="sidebar-logo-sub">Freelancer Edition</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="sidebar-section-label">Main Menu</div>
        </motion.div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }, i) => (
          <motion.div key={to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
            <NavLink
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Pro Features</div>
        </motion.div>
        {PRO_NAV_ITEMS.map(({ id, icon: Icon, label }, i) => (
          <motion.div key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
            <div 
              onClick={(e) => {
                if (!isPro) {
                  e.preventDefault();
                  alert('Upgrades are currently disabled');
                } else {
                  navigate(`/${id}`);
                }
              }}
              className="nav-item"
              style={{ cursor: 'pointer', opacity: isPro ? 1 : 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={18} />
                {label}
              </div>
              {!isPro && <Lock size={14} color="#6366f1" />}
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Quick Actions</div>
          <NavLink to="/invoices/new" className="nav-item" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
          }}>
            <Plus size={18} />
            New Invoice
          </NavLink>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Account</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Settings size={18} />
            Profile & Settings
          </NavLink>
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ flexDirection: 'column', gap: 12, padding: 16 }}>

        <div className="sidebar-user" onClick={handleLogout} title="Logout" style={{ width: '100%', margin: 0 }}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.businessName || user?.name}</div>
            <div className="user-plan">{isPro ? '⚡ Pro Plan' : '🆓 Free Plan'}</div>
          </div>
          <LogOut size={14} color="var(--text-dim)" />
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
