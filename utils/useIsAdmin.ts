
import { useAuth } from '@/contexts/AuthContext';

/**
 * @deprecated Use useAuth() from @/contexts/AuthContext instead
 * This hook is kept for backward compatibility
 */
export function useIsAdmin() {
  const { isAdmin, loading } = useAuth();

  return { 
    isAdmin, 
    loading, 
    refresh: async () => {
      console.log('useIsAdmin.refresh() is deprecated. Use refreshAdminStatus() from useAuth() instead.');
    }
  };
}
