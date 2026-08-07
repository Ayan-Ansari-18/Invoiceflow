import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import SEO from '../components/ui/SEO';

const CommunityPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Community" description="Join the InvoiceFlow Community" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 64, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ padding: 24, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Users size={48} color="#10b981" />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Community</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 500, margin: '0 auto', marginBottom: 32 }}>
          Join thousands of Indian freelancers growing their business with InvoiceFlow. Connect, share, and learn together.
        </p>
        
        <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }} onClick={() => alert('Community Discord joining soon!')}>
          Join Discord Server
        </button>
      </div>
    </div>
  );
};

export default CommunityPage;
