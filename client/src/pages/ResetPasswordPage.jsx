import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/ui/SEO';
import api from '../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setStatus('success');
      setMessage('Your password has been successfully reset.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid or expired token.');
      setStatus('error');
    }
  };

  return (
    <div className="auth-page">
      <SEO title="Reset Password" />
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <img
            src="/company-logo.png"
            alt="Company Logo"
            style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }}
          />
          <div style={{ textAlign: 'left' }}>
            <div className="auth-logo" style={{ marginBottom: 0 }}>InvoiceFlow</div>
            <div className="auth-tagline" style={{ marginBottom: 0 }}>For Indian Freelancers</div>
          </div>
        </div>

        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">Enter your new password below.</p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <CheckCircle size={32} color="#10B981" />
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Password Reset Successful</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '14px' }}>
              {message} Redirecting you to login...
            </p>
            <Link
              to="/login"
              className="btn btn-primary btn-full btn-lg"
              style={{ display: 'inline-flex', justifyContent: 'center', textDecoration: 'none' }}
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 0 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Lock size={18} color="var(--text-dim)" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input ${status === 'error' ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 0 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Lock size={18} color="var(--text-dim)" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input ${status === 'error' ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              {status === 'error' && (
                <p className="form-error" style={{ marginTop: '8px' }}>
                  {message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`btn btn-primary btn-full btn-lg ${status === 'loading' ? 'btn-loading' : ''}`}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}
            >
              {status !== 'loading' && (
                <>
                  Reset Password
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
