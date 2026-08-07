import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/ui/SEO';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Password reset link has been sent to your email.');
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="auth-page">
      <SEO title="Forgot Password" />
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

        <h2 className="auth-title">Forgot your password?</h2>
        <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%' }}>
                <CheckCircle size={32} color="#10B981" />
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Check your inbox</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '14px' }}>
              {message}
            </p>
            <Link
              to="/login"
              className="btn btn-primary btn-full btn-lg"
              style={{ display: 'inline-flex', justifyContent: 'center', textDecoration: 'none' }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 0 0 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Mail size={18} color="var(--text-dim)" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input ${status === 'error' ? 'error' : ''}`}
                  placeholder="you@example.com"
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
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {status !== 'loading' && (
                <>
                  Send reset link
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="auth-footer" style={{ marginTop: '24px' }}>
              <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                Wait, I remember my password
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
