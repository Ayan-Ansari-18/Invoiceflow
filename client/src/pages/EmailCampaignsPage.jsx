import { Mail, Zap, Globe, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';

const EmailCampaignsPage = () => {
  return (
    <AppLayout title="Email Settings">
      <SEO title="Email Settings - Pro" />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Email Delivery System</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your account is automatically configured with our professional enterprise email server.</p>
        </div>

        {/* Configuration Status Card */}
        <div className="card" style={{ marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981', flexShrink: 0
            }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                System Active & Ready
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No complex setup required. You can send invoices instantly!
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(99,102,241,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>How it works:</p>
            <ol style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 2, paddingLeft: 18, margin: 0 }}>
              <li>Open any invoice and click <strong style={{ color: '#c4b5fd' }}>"Send via Email"</strong>.</li>
              <li>The invoice PDF is automatically generated and attached.</li>
              <li>The email is delivered instantly to your client using our secure delivery network.</li>
              <li>When the client clicks <strong>"Reply"</strong>, the email routes directly to your personal login email inbox.</li>
            </ol>
          </div>
        </div>

        {/* Features Card */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Enterprise Email Features</h3>
          <div className="form-row form-row-2" style={{ gap: 14 }}>
            {[
              { icon: <Zap size={22} color="#f59e0b" />, title: 'Zero Setup Required', desc: 'No need to connect personal accounts or deal with OAuth.' },
              { icon: <Mail size={22} color="#10b981" />, title: 'Smart Reply Routing', desc: 'Client replies go straight to your personal inbox automatically.' },
              { icon: <Globe size={22} color="#3b82f6" />, title: 'High Deliverability', desc: 'Powered by Resend for 99.9% inbox delivery rates.' },
              { icon: <CheckCircle size={22} color="#8b5cf6" />, title: 'Status Auto-update', desc: 'Invoice status changes from Draft → Sent automatically.' },
            ].map(({ icon, title, desc }, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ marginBottom: 12 }}>{icon}</div>
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default EmailCampaignsPage;
