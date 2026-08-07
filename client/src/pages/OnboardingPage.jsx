import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Building, Shield, Phone, FileText, MapPin } from 'lucide-react';
import SEO from '../components/ui/SEO';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  businessName: z.string().min(2, 'Business Name is required'),
  businessPhone: z.string().min(5, 'Phone number is required'),
  businessAddress: z.string().min(5, 'Address is required'),
  invoicePrefix: z.string().min(1, 'Prefix is required').max(10, 'Max 10 characters'),
  GSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').or(z.literal('')).optional(),
});

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: user?.businessName || '',
      businessPhone: user?.businessPhone || '',
      businessAddress: user?.businessAddress || '',
      invoicePrefix: user?.invoicePrefix || 'INV',
      GSTIN: user?.GSTIN || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data).then((r) => r.data.user),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Setup complete! Welcome to InvoiceFlow.');
      navigate('/dashboard');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setIsLoading(false)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Submit name and brandColor from existing user data to avoid overriding with nulls
    mutation.mutate({ 
      ...data, 
      name: user?.name, 
      brandColor: user?.brandColor 
    });
  };

  return (
    <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SEO title="Complete Setup" />
      <motion.div 
        className="auth-card"
        style={{ maxWidth: 560, width: '100%', padding: '40px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', marginBottom: 16, boxShadow: '0 12px 32px rgba(99,102,241,0.3)' }}>
            <Building size={28} color="#fff" />
          </div>
          <h2 className="auth-title" style={{ fontSize: 24, marginBottom: 8 }}>Complete Your Profile</h2>
          <p className="auth-subtitle">Just a few details about your business before we start generating professional invoices.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building size={14}/> Business Name *</label>
            <input
              {...register('businessName')}
              className={`form-input ${errors.businessName ? 'error' : ''}`}
              placeholder="Sharma Tech Solutions"
            />
            {errors.businessName && <p className="form-error">{errors.businessName.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14}/> Phone Number *</label>
              <input
                {...register('businessPhone')}
                className={`form-input ${errors.businessPhone ? 'error' : ''}`}
                placeholder="+91 98765 43210"
              />
              {errors.businessPhone && <p className="form-error">{errors.businessPhone.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14}/> Invoice Prefix *</label>
              <input
                {...register('invoicePrefix')}
                className={`form-input ${errors.invoicePrefix ? 'error' : ''}`}
                placeholder="INV"
              />
              {errors.invoicePrefix && <p className="form-error">{errors.invoicePrefix.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14}/> Business Address *</label>
            <textarea
              {...register('businessAddress')}
              className={`form-textarea ${errors.businessAddress ? 'error' : ''}`}
              placeholder="123 MG Road, Bangalore, Karnataka 560001"
              rows={3}
            />
            {errors.businessAddress && <p className="form-error">{errors.businessAddress.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14}/> Your GSTIN (Optional)</label>
            <input
              {...register('GSTIN')}
              className={`form-input ${errors.GSTIN ? 'error' : ''}`}
              placeholder="29ABCDE1234F1Z5"
              style={{ textTransform: 'uppercase' }}
              maxLength={15}
            />
            {errors.GSTIN && <p className="form-error">{errors.GSTIN.message}</p>}
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Leave blank if you do not have a GSTIN.
            </p>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {!isLoading && 'Save & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
