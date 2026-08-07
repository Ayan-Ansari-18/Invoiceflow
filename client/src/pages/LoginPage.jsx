import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/ui/SEO';
import useAuthStore from '../store/authStore';
import { getErrorMessage } from '../utils/helpers';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  website_url: z.string().optional(),

});

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password, website_url }) => {
    if (website_url) return; // Honeypot trap: if filled, quietly do nothing (bot detected)
    setIsLoading(true);
    try {
      await login({ email, password });
      localStorage.removeItem('invoiceFlow_isPro');
      window.dispatchEvent(new Event('subscriptionChange'));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      await googleLogin(credentialResponse.access_token);
      localStorage.removeItem('invoiceFlow_isPro');
      window.dispatchEvent(new Event('subscriptionChange'));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const performGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign-In failed'),
  });

  return (
    <div className="auth-page">
      <SEO title="Log In" />
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <img
            src="/company-logo.png"
            alt="Company Logo"
            style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }}
          />
          <div>
            <div className="auth-logo" style={{ marginBottom: 0 }}>InvoiceFlow</div>
            <div className="auth-tagline" style={{ marginBottom: 0 }}>For Indian Freelancers</div>
          </div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button 
            type="button"
            onClick={() => performGoogleLogin()}
            className="btn btn-secondary btn-full btn-lg"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 12,
              background: '#fff',
              color: '#000',
              border: 'none',
              fontWeight: 600,
              fontSize: 15
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 20, height: 20 }} />
            Continue with Google
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0', color: 'var(--text-dim)' }}>
          <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 12 }}>OR CONTINUE WITH EMAIL</span>
          <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot Field */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website_url">Website URL</label>
            <input type="text" id="website_url" name="website_url" tabIndex="-1" autoComplete="off" {...register('website_url')} />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              {...register('email')}
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                className={`form-input ${errors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
