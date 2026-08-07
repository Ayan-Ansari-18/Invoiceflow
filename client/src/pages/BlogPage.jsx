import { Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import SEO from '../components/ui/SEO';

const BlogPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Blog" description="InvoiceFlow Blog and Articles" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 64, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ padding: 24, background: 'rgba(147, 51, 234, 0.1)', borderRadius: '50%' }}>
            <Edit3 size={48} color="#9333ea" />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>InvoiceFlow Blog</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          We are preparing our first set of articles covering freelance tips, tax guides for India, and product updates. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default BlogPage;
