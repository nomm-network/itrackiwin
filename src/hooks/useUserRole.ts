import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        console.log('🔍 [useUserRole] Starting role check...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('🔍 [useUserRole] Auth error:', userError);
          setIsSuperAdmin(false);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log('🔍 [useUserRole] No user found');
          setIsSuperAdmin(false);
          setIsLoading(false);
          return;
        }

        console.log('🔍 [useUserRole] User found:', user.id);

        // Check if user has superadmin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'superadmin')
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

        if (error) {
          console.error('🔍 [useUserRole] Database error:', error);
          setIsSuperAdmin(false);
        } else {
          const hasRole = !!data;
          console.log('🔍 [useUserRole] Superadmin role check result:', hasRole);
          setIsSuperAdmin(hasRole);
        }
      } catch (error) {
        console.error('🔍 [useUserRole] Unexpected error:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return { isSuperAdmin, isLoading };
};