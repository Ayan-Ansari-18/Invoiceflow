import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/ui/SEO';

const RefundPolicyPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Refund Policy" description="Refund Policy for InvoiceFlow" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 48, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, letterSpacing: '-1px' }}>Refund Policy</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>1. Subscription Cancellations</h2>
            <p>
              You can cancel your InvoiceFlow Pro subscription at any time. When you cancel, you will continue to have access to the Pro features until the end of your current billing cycle.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>2. Refund Eligibility</h2>
            <p>
              We offer a 7-day money-back guarantee for all new subscriptions. If you are not satisfied with InvoiceFlow Pro within the first 7 days of your initial purchase, you may request a full refund.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>3. How to Request a Refund</h2>
            <p>
              To request a refund within the eligible period, please contact our support team at support@invoiceflow.online with your account details and the reason for the request. Refunds are typically processed within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>4. Exceptional Circumstances</h2>
            <p>
              After the 7-day period, refunds are only granted under exceptional circumstances, such as extended service outages or billing errors, at the sole discretion of the InvoiceFlow management team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
