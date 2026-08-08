import { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader, LogOut, AlertCircle, ExternalLink } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EmailCampaignsPage = () => {
  const queryClient = useQueryClient();

  // ─── Check Gmail connection status ───────────────────────────────────────────
  const { data: emailStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['emailStatus'],
    queryFn: () => api.get('/email/status').then((r) => r.data),
  });

  const isConnected = emailStatus?.gmailConnected;
  const connectedEmail = emailStatus?.gmailEmail;

  // ─── Handle Gmail OAuth callback (after Google redirects back) ───────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenData = params.get('tokenData');
    const gmailConnected = params.get('gmailConnected');
    const error = params.get('error');

    if (error) {
      toast.error('Gmail connection failed. Please try again.');
      window.history.replaceState({}, '', '/email');
      return;
    }

    if (gmailConnected && tokenData) {
      try {
        const decoded = JSON.parse(atob(tokenData));
        // Save tokens to backend
        api.post('/email/gmail/save-tokens', decoded).then(() => {
          toast.success(`Gmail connected! You can now send emails from ${decoded.gmailEmail}`);
          queryClient.invalidateQueries({ queryKey: ['emailStatus'] });
        }).catch(() => {
          toast.error('Failed to save Gmail tokens. Please try again.');
        });
        window.history.replaceState({}, '', '/email');
      } catch (_) {
        toast.error('Invalid token data. Please try reconnecting.');
        window.history.replaceState({}, '', '/email');
      }
    }
  }, []);

  // ─── Connect Gmail ────────────────────────────────────────────────────────────
  const handleConnectGmail = async () => {
    try {
      const res = await api.get('/email/gmail/connect');
      window.location.href = res.data.url;
    } catch {
      toast.error('Failed to initiate Gmail connection.');
    }
  };

  // ─── Disconnect Gmail ─────────────────────────────────────────────────────────
  const disconnectMutation = useMutation({
    mutationFn: () => api.delete('/email/gmail/disconnect'),
    onSuccess: () => {
      toast.success('Gmail disconnected.');
      queryClient.invalidateQueries({ queryKey: ['emailStatus'] });
    },
    onError: () => toast.error('Failed to disconnect Gmail.'),
  });

  return (
    <AppLayout title="Email Campaigns">
      <SEO title="Email Campaigns - Pro" />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Email Campaigns</h2>
          <p style={{ color: 'var(--text-muted)' }}>Connect your Gmail and send professional invoices directly to clients.</p>
        </div>

        {/* Gmail Connection Card */}
        <div className="card" style={{ marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isConnected ? '#10b981' : '#818CF8', flexShrink: 0
            }}>
              <Mail size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                Gmail Connection
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {isConnected
                  ? `Connected as ${connectedEmail}`
                  : 'Connect your Gmail to send invoices from your own email address.'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {statusLoading ? (
                <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: '#818CF8' }} />
              ) : isConnected ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 14, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Connected
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    style={{ color: '#f87171' }}
                  >
                    <LogOut size={14} /> Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleConnectGmail}>
                  Connect Gmail
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Steps / Instructions */}
          {!isConnected && (
            <div style={{ background: 'rgba(99,102,241,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>How it works:</p>
              <ol style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 2, paddingLeft: 18, margin: 0 }}>
                <li>Click <strong style={{ color: '#c4b5fd' }}>"Connect Gmail"</strong> and log in with your Google account</li>
                <li>Allow InvoiceFlow permission to <strong style={{ color: '#c4b5fd' }}>send emails on your behalf</strong></li>
                <li>You'll be redirected back here — done! 🎉</li>
                <li>Open any invoice and click <strong style={{ color: '#c4b5fd' }}>"Send via Email"</strong></li>
              </ol>
            </div>
          )}

          {isConnected && (
            <div style={{ background: 'rgba(16,185,129,0.07)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 12 }}>
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: '#34d399', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Gmail is connected!</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  You can now go to any invoice and click <strong style={{ color: '#fff' }}>"Send via Email"</strong>.
                  The invoice PDF will be automatically generated and sent from <strong style={{ color: '#fff' }}>{connectedEmail}</strong> to your client.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features Card */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>What you get with Gmail Integration</h3>
          <div className="form-row form-row-2" style={{ gap: 14 }}>
            {[
              { icon: '📧', title: 'Sent from your Gmail', desc: 'Client receives email from YOUR address, not a no-reply address.' },
              { icon: '📎', title: 'PDF Auto-attached', desc: 'Invoice PDF is automatically generated and attached to the email.' },
              { icon: '🎨', title: 'Branded Email', desc: 'Beautiful HTML email template with your business name and branding.' },
              { icon: '✅', title: 'Status Auto-update', desc: 'Invoice status changes from Draft → Sent automatically after sending.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                padding: '16px 18px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
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
