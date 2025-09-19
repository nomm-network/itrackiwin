import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NavItem {
  slot: number;
  item_type: 'fixed' | 'category';
  label: string;
  slug: string;
  icon: string;
}

export function useBottomNav() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bottom-nav', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
        .select(`
          life_categories!inner(
            slug,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('nav_pinned', true)
        .eq('is_enabled', true)
        .order('display_order')
        .limit(3);

      if (error) throw error;
      
      // Build nav items with fixed slots for Dashboard and Atlas, plus pinned categories
      const navItems: NavItem[] = [
        {
          slot: 1,
          item_type: 'fixed',
          label: 'Dashboard',
          slug: '',
          icon: '🏠'
        },
        {
          slot: 2,
          item_type: 'fixed', 
          label: 'Atlas',
          slug: 'atlas',
          icon: '🗺️'
        }
      ];

      // Add pinned categories starting from slot 3
      (data || []).forEach((item: any, index) => {
        navItems.push({
          slot: 3 + index,
          item_type: 'category',
          label: item.life_categories.name,
          slug: `area/${item.life_categories.slug}`,
          icon: item.life_categories.icon
        });
      });
      
      return navItems;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}