import { Link } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';
import SEO from '../components/ui/SEO';

const DocumentationPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Documentation" description="InvoiceFlow Documentation and Guides" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 64, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ padding: 24, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Book size={48} color="#3b82f6" />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Documentation</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          Our comprehensive documentation is currently being written and will be published very soon. Check back later for in-depth guides on using InvoiceFlow.
        </p>
      </div>
    </div>
  );
};

export default DocumentationPage;
