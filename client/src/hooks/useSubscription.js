import { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const { user, updateUser } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const isPro = user?.plan === 'pro';

  const upgradeToPro = async (onSuccess) => {
    try {
      setIsUpgrading(true);
      
      // 1. Create Order on Backend
      const { data: orderData } = await api.post('/subscription/create-order');
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'InvoiceFlow Pro',
        description: 'Upgrade to Pro Plan',
        image: '/company-logo.png', // Or any logo URL
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...', { id: 'verify-payment' });
            
            // 3. Verify Payment on Backend
            const { data: verifyData } = await api.post('/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyData.success) {
              toast.success('Welcome to Pro! 🎉', { id: 'verify-payment' });
              // Update local user state
              updateUser(verifyData.user);
              if (onSuccess) onSuccess();
            } else {
              toast.error('Verification failed', { id: 'verify-payment' });
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error(error?.response?.data?.message || 'Payment verification failed', { id: 'verify-payment' });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.businessPhone || ''
        },
        theme: {
          color: '#6366f1' // Indigo-500
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();

    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to initiate upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  return { isPro, upgradeToPro, isUpgrading };
};
