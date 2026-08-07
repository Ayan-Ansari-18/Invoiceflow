import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/ui/SEO';

const PrivacyPolicyPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <SEO title="Privacy Policy" description="Privacy Policy for InvoiceFlow" />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', marginBottom: 48, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 48, letterSpacing: '-1px' }}>Privacy Policy</h1>
        
        <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, create invoices, or communicate with us. This includes your name, email address, billing information, and client data you input into the system.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>3. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All passwords and sensitive data are encrypted.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>4. Third-Party Services</h2>
            <p>
              We may use third-party service providers (such as payment processors or email delivery services) that require access to your data. These services are bound by strict confidentiality agreements.
            </p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@invoiceflow.online.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
