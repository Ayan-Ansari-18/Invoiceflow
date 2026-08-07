import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/ui/SEO';

const ChangelogPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Changelog" description="InvoiceFlow Updates and Changelog" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 48, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 48, letterSpacing: '-1px' }}>Changelog</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: 100, fontSize: 14, fontWeight: 600 }}>v1.0.0</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>August 2026</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Initial Release</h2>
            <ul style={{ color: '#e2e8f0', lineHeight: 1.8, margin: 0, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Launched InvoiceFlow with core invoice generation features.</li>
              <li>Added client management and dynamic groups.</li>
              <li>Introduced beautiful dark mode UI and PDF exports.</li>
              <li>Integrated Google Auth and secure password login.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;
