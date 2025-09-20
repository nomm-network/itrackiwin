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
        .eq('is_enabled', true)
        .order('display_order')
        .limit(2);

      if (error) throw error;
      
      // Build nav items: Atlas, Social, top 2 categories, Planets
      const navItems: NavItem[] = [
        {
          slot: 1,
          item_type: 'fixed',
          label: 'Atlas',
          slug: 'atlas',
          icon: '🌍'
        },
        {
          slot: 2,
          item_type: 'fixed',
          label: 'Social',
          slug: 'social',
          icon: '🤳'
        }
      ];

      // Add top 2 categories starting from slot 3 (linking to category dashboards)
      (data || []).forEach((item: any, index) => {
        const firstName = item.life_categories.name.split(' ')[0]; // Extract first word only
        navItems.push({
          slot: 3 + index,
          item_type: 'category',
          label: firstName,
          slug: item.life_categories.slug, // Just the slug, getRouteForSlug will handle the /area/ prefix
          icon: item.life_categories.icon
        });
      });
      
      // Add Planets as the 5th item
      navItems.push({
        slot: 5,
        item_type: 'fixed',
        label: 'Planets',
        slug: 'planets', // This will route to /planets via getRouteForSlug but we need it to be the Life Map
        icon: '🪐'
      });
      
      return navItems;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}