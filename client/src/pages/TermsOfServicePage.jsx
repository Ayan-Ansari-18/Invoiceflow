import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/ui/SEO';

const TermsOfServicePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Terms of Service" description="Terms of Service for InvoiceFlow" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 48, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, letterSpacing: '-1px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using InvoiceFlow, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>2. Description of Service</h2>
            <p>
              InvoiceFlow provides an online platform for freelancers to generate, manage, and track invoices. We reserve the right to modify or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>3. User Accounts</h2>
            <p>
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>4. Content Ownership</h2>
            <p>
              You retain all rights to any data, information, or material that you submit to the service in the course of using it. However, you grant us the right to host and backup this content to provide the service to you.
            </p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>5. Limitation of Liability</h2>
            <p>
              In no event shall InvoiceFlow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
