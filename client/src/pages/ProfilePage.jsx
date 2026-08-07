import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, User, Building, Palette, Shield } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import SEO from '../components/ui/SEO';
import { getErrorMessage, getInitials } from '../utils/helpers';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const schema = z.object({
  name: z.string().min(2),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  GSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').or(z.literal('')).optional(),
  brandColor: z.string().optional(),
  invoicePrefix: z.string().max(10).optional(),
});

const BRAND_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState(user?.brandColor || '#6366f1');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      businessName: user?.businessName || '',
      businessAddress: user?.businessAddress || '',
      businessPhone: user?.businessPhone || '',
      GSTIN: user?.GSTIN || '',
      brandColor: user?.brandColor || '#6366f1',
      invoicePrefix: user?.invoicePrefix || 'INV',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data).then((r) => r.data.user),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Sync with localStorage for instantaneous preview updates across the app
      const userId = updatedUser._id || updatedUser.id || 'default';
      localStorage.setItem(`invoiceFlow_brandColor_${userId}`, selectedColor);
      window.dispatchEvent(new Event('brandingChange'));
      
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data) => mutation.mutate({ ...data, brandColor: selectedColor });

  const FormSection = ({ icon: Icon, title, children }) => (
    <div className="form-section">
      <div className="form-section-header">
        <div className="form-section-icon"><Icon size={16} /></div>
        <h3 className="form-section-title">{title}</h3>
      </div>
      <div className="form-section-body">{children}</div>
    </div>
  );

  return (
    <AppLayout title="Profile & Settings">
      <SEO title="Profile & Settings" />
      <div style={{ maxWidth: 720 }}>
        {/* Avatar Header */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${selectedColor}, #4f46e5)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{user?.businessName || user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
            <span className={`badge badge-${user?.plan}`} style={{ marginTop: 6 }}>
              {user?.plan === 'free' ? 'Free Plan' : 'Pro Plan'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal Info */}
          <FormSection icon={User} title="Personal Information">
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input {...register('name')} className={`form-input ${errors.name ? 'error' : ''}`} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input {...register('businessPhone')} className="form-input" placeholder="+91 98765 43210" />
              </div>
            </div>
          </FormSection>

          {/* Business Info */}
          <FormSection icon={Building} title="Business Information">
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input {...register('businessName')} className="form-input" placeholder="Sharma Tech Solutions" />
              </div>
              <div className="form-group">
                <label className="form-label">Invoice Prefix</label>
                <input {...register('invoicePrefix')} className="form-input" placeholder="INV" maxLength={10} />
                <p className="form-error" style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                  Invoices will be numbered like {(user?.invoicePrefix || 'INV')}-001
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Business Address</label>
              <textarea {...register('businessAddress')} className="form-textarea" rows={3}
                placeholder="123 MG Road, Bangalore, Karnataka 560001" />
            </div>
          </FormSection>

          {/* Tax Info */}
          <FormSection icon={Shield} title="GST & Tax Information">
            <div className="form-group" style={{ maxWidth: 320 }}>
              <label className="form-label">Your GSTIN</label>
              <input
                {...register('GSTIN')}
                className={`form-input ${errors.GSTIN ? 'error' : ''}`}
                placeholder="29ABCDE1234F1Z5"
                style={{ textTransform: 'uppercase' }}
                maxLength={15}
              />
              {errors.GSTIN && <p className="form-error">{errors.GSTIN.message}</p>}
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                This will appear on all your invoices for GST compliance.
              </p>
            </div>
          </FormSection>

          {/* Brand Color */}
          <FormSection icon={Palette} title="Invoice Brand Color">
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              This color is used on your invoice header and accents.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setSelectedColor(color); setValue('brandColor', color); }}
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: color,
                    border: selectedColor === color ? `3px solid #fff` : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : 'none',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  title={color}
                />
              ))}
              {/* Custom color */}
              <div style={{ position: 'relative', width: 36, height: 36 }}>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => { setSelectedColor(e.target.value); setValue('brandColor', e.target.value); }}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}
                  title="Custom color"
                />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                Selected: <code style={{ color: selectedColor, fontWeight: 700 }}>{selectedColor}</code>
              </span>
            </div>
          </FormSection>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`btn btn-primary ${mutation.isPending || isSubmitting ? 'btn-loading' : ''}`}
              disabled={mutation.isPending || isSubmitting}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
