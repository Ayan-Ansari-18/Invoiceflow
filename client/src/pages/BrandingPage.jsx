import { Palette, UploadCloud, CheckCircle, Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

const BrandingPage = () => {
  const { user } = useAuthStore();
  const userId = user?._id || user?.id || 'default';
  const [brandColor, setBrandColor] = useState('#4F46E5');
  const [logoData, setLogoData] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.brandColor) setBrandColor(user.brandColor);
    if (user?.logo) setLogoData(user.logo);
    if (user?.signature) setSignatureData(user.signature);
  }, [user]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', { brandColor, logo: logoData, signature: signatureData });
      useAuthStore.getState().updateUser(res.data.user);
      
      toast.success('Custom branding saved! Your invoices will now reflect these changes.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save branding');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <AppLayout title="Custom Branding">
      <SEO title="Custom Branding - Pro" />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Custom Branding</h2>
            <p style={{ color: 'var(--text-muted)' }}>Personalize your invoices with your own logo and colors.</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : <><Save size={16} style={{ marginRight: 6 }} /> Save Changes</>}
          </button>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, padding: 24 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Company Logo</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                Upload your high-resolution logo. This will replace the default InvoiceFlow branding on all PDFs.
              </p>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden'
                }}
              >
                {logoData ? (
                  <img src={logoData} alt="Brand Logo" style={{ maxHeight: 60, objectFit: 'contain', zIndex: 1 }} />
                ) : (
                  <>
                    <UploadCloud size={24} color="#818CF8" />
                    <span style={{ fontSize: 14, color: '#a5b4fc' }}>Click to upload (Pro Feature Unlocked)</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Brand Colors</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                Select your primary brand color to match your company's aesthetic on all communications.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {COLORS.map((color) => (
                  <div 
                    key={color} 
                    onClick={() => setBrandColor(color)}
                    style={{ 
                      width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer', 
                      border: color === brandColor ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: color === brandColor ? `0 0 0 2px ${color}` : 'none'
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Authorized Signature</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Upload an image of your signature. It will appear at the bottom right of all your invoices.
            </p>
            <div 
              onClick={() => signatureInputRef.current?.click()}
              style={{ 
                border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden',
                maxWidth: 400
              }}
            >
              {signatureData ? (
                <img src={signatureData} alt="Signature" style={{ maxHeight: 80, objectFit: 'contain', zIndex: 1 }} />
              ) : (
                <>
                  <UploadCloud size={24} color="#818CF8" />
                  <span style={{ fontSize: 14, color: '#a5b4fc' }}>Click to upload Signature</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={signatureInputRef} 
                onChange={handleSignatureUpload} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BrandingPage;
