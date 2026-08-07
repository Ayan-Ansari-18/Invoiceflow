import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const useSubscription = () => {
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'pro' || user?.plan === 'business' || localStorage.getItem('invoiceFlow_isPro') === 'true';

  // We keep the localStorage check as a fallback during transitions, 
  // but rely primarily on the user.plan from the backend database.
  
  return { isPro: user?.plan === 'pro' || user?.plan === 'business' || localStorage.getItem('invoiceFlow_isPro') === 'true' };
};
