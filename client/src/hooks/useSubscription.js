import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const useSubscription = () => {
  const { user } = useAuthStore();
  
  // Temporarily override to true for all users to disable limits
  const isPro = true;

  return { isPro };
};
