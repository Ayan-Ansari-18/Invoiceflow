import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, FileText, Mail, BarChart2, Shield, Smartphone,
  ArrowRight, CheckCircle, LayoutDashboard
} from 'lucide-react';
import SEO from '../components/ui/SEO';
import { useSubscription } from '../hooks/useSubscription';
import useAuthStore from '../store/authStore';

const FEATURES = [
  {
    icon: FileText,
    title: 'GST-Compliant PDF Invoices',
    desc: 'Auto-calculate GST at 0%, 5%, 12%, 18% or 28%. Professional PDF output in seconds.',
  },
  {
    icon: Mail,
    title: 'Send Directly to Clients',
    desc: 'Email invoices with PDF attached from within the app. No switching between tools.',
  },
  {
    icon: BarChart2,
    title: 'Payment Tracking Dashboard',
    desc: 'See total earnings, pending invoices, overdue alerts, and top clients at a glance.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT auth, bcrypt-hashed passwords, HTTPS only. Your data stays yours.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-Friendly',
    desc: 'Create invoices from your phone. Fully responsive — works anywhere, anytime.',
  },
  {
    icon: Zap,
    title: 'UPI Payment Links',
    desc: 'Add your UPI ID or Razorpay link directly to the invoice for instant payments.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    badge: null,
    features: ['5 invoices/month', 'PDF download', 'INR currency'],
    cta: 'Start Free',
    variant: 'btn-secondary',
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    badge: 'Most Popular',
    features: ['Unlimited invoices', 'Email sending', 'Dashboard & analytics', 'Client management', 'Custom branding', 'Multi-currency', 'GST calculation'],
    cta: 'Get Pro',
    variant: 'btn-primary',
  },
];

const LandingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { upgradeToPro, isUpgrading } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [location.hash]);

  return (
    <div className="landing" style={{ position: 'relative', overflow: 'hidden' }}>
      <SEO title="Home" />
      
      <style>{`
        @media (max-width: 480px) {
          .landing-nav {
            padding: 0 16px !important;
          }
          .landing-logo-text {
            display: none !important;
          }
          .landing-nav-btns {
            gap: 8px !important;
          }
        }
      `}</style>

      {/* Background Effects */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '80vw', height: '80vw', maxWidth: 1000, maxHeight: 1000,
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Nav */}
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/company-logo.png"
            alt="Company Logo"
            style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
          />
          <span className="landing-logo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            InvoiceFlow
          </span>
        </div>
        <div className="landing-nav-btns" style={{ display: 'flex', gap: 12 }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              <LayoutDashboard size={14} style={{ marginRight: 6 }} /> Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 80, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)',
              color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 24
            }}>
              <Zap size={14} /> Made for Modern Freelancers · GST Ready
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.04em' }}>
              Invoicing, <br/>
              <span style={{ background: 'linear-gradient(135deg, #fff, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>reimagined.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Stop wasting time on Word or Excel. InvoiceFlow lets you create premium GST-compliant PDF invoices, manage clients, and track payments instantly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: 16 }}>
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: 16 }}>
                  Start Free <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              marginTop: 80, padding: 8, background: 'rgba(255,255,255,0.03)', 
              borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ background: '#0C0C0E', borderRadius: 16, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              {/* 3D Card Stack Animation */}
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1000 }}>
                
                {/* Back Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.7, rotateZ: -15 }}
                  animate={{ opacity: 0.4, y: -40, scale: 0.8, rotateZ: -10 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  style={{ 
                    position: 'absolute', width: 280, height: 320, background: 'rgba(255,255,255,0.05)', 
                    borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                    zIndex: 1, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ width: '40%', height: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 24 }} />
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '80%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '90%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                </motion.div>

                {/* Middle Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8, rotateZ: 10 }}
                  animate={{ opacity: 0.7, y: -15, scale: 0.9, rotateZ: 5 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  style={{ 
                    position: 'absolute', width: 280, height: 320, background: 'rgba(255,255,255,0.08)', 
                    borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
                    zIndex: 2, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}
                >
                  <div style={{ width: '50%', height: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: 24 }} />
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '80%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '95%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                </motion.div>

                {/* Front Card (Main Invoice) */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9, rotateZ: -5 }}
                  animate={{ opacity: 1, y: 15, scale: 1, rotateZ: -2 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                  whileHover={{ y: 5, scale: 1.02, rotateZ: 0, transition: { duration: 0.3 } }}
                  style={{ 
                    position: 'absolute', width: 280, height: 340, background: '#ffffff', 
                    borderRadius: 16, zIndex: 3, padding: 24, 
                    boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>INVOICE</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>#INV-2026</div>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4F46E5, #9333EA)' }} />
                  </div>

                  {/* Body */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>BILLED TO</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Acme Corp</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>Design Services</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 10, color: '#0f172a', fontWeight: 500 }}>
                      <span>App Design</span>
                      <span style={{ fontWeight: 700 }}>₹45,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#0f172a', fontWeight: 500 }}>
                      <span>Branding</span>
                      <span style={{ fontWeight: 700 }}>₹25,000</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>TOTAL</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}>₹70,000</div>
                  </div>

                  {/* Floating badge */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: -15, right: -15, background: '#10B981', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, boxShadow: '0 8px 16px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <CheckCircle size={12} /> PAID
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: '2.5rem' }}>Everything you need. <span style={{ color: 'var(--text-dim)' }}>Nothing you don't.</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div 
                key={title} 
                className="card-glass" 
                style={{ padding: 32 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 12, color: '#fff' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
            </div>
          </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: '2.5rem' }}>Simple, Honest Pricing</h2>
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Start free, upgrade when you need more.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'center' }}>
            {PLANS.map(({ name, price, period, badge, features, cta, variant }, i) => (
              <motion.div 
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  position: 'relative',
                  padding: 40,
                  background: badge ? 'rgba(79,70,229,0.05)' : 'rgba(255,255,255,0.02)',
                  border: badge ? '1px solid rgba(79,70,229,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  transform: badge ? 'scale(1.05)' : 'scale(1)',
                  zIndex: badge ? 10 : 1,
                  boxShadow: badge ? '0 24px 48px rgba(79,70,229,0.1)' : 'none'
                }}
              >
                {badge && (
                  <span style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
                    color: '#fff', padding: '6px 16px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(79,70,229,0.3)'
                  }}>{badge}</span>
                )}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: badge ? '#818CF8' : 'var(--text-muted)', marginBottom: 12 }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{price}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>{period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                      <CheckCircle size={18} color={badge ? "#818CF8" : "#10b981"} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={(e) => {
                    if (name === 'Free') {
                      localStorage.setItem('invoiceFlow_isPro', 'false');
                      window.dispatchEvent(new Event('subscriptionChange'));
                      if (!user) navigate('/register');
                      else navigate('/dashboard');
                    } else if (name === 'Pro') {
                      if (!user) {
                        localStorage.setItem('pendingUpgrade', 'true');
                        navigate('/register');
                      } else {
                        upgradeToPro();
                      }
                    }
                  }}
                  className={`btn ${variant === 'btn-primary' ? 'btn-primary' : 'btn-secondary'} btn-full`} 
                  style={{ padding: '16px 24px', fontSize: 15 }}
                  disabled={name === 'Pro' && isUpgrading}
                >
                  {name === 'Pro' && isUpgrading ? 'Upgrading...' : cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '80px 5% 32px 5%',
        background: '#040914',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
          maxWidth: '1200px',
          margin: '0 auto 64px auto'
        }}>
          {/* Brand Column */}
          <div style={{ gridColumn: '1 / -1', '@media (min-width: 768px)': { gridColumn: 'span 2' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <img
                src="/company-logo.png"
                alt="InvoiceFlow Logo"
                style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
              />
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>InvoiceFlow</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 320 }}>
              The ultimate invoicing and client management solution built exclusively for Indian freelancers. Fast, secure, and beautifully designed.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 24, fontSize: 16 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <a href="/#features" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Features</a>
              <a href="/#pricing" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Pricing</a>
              <Link to="/changelog" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Changelog</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 24, fontSize: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Link to="/docs" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Documentation</Link>
              <Link to="/blog" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Blog</Link>
              <Link to="/community" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Community</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 24, fontSize: 16 }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Link to="/privacy" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }}>Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          paddingTop: 32,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} InvoiceFlow. Engineered for excellence.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Twitter</a>
            <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>LinkedIn</a>
            <a href="#" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
