import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Hub {
  slug: string;
  label: string;
  icon?: string | null;
  subs: { slug: string; label: string; icon?: string }[];
}

/**
 * Hook to fetch life categories and subcategories from database
 * Returns them grouped as "hubs" with their subcategories
 */
export function useHubCategories(language: string = 'en') {
  return useQuery({
    queryKey: ['hub-categories', language],
    queryFn: async () => {
      // Fetch categories and subcategories
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase
          .from('v_categories_with_translations')
          .select('*')
          .order('display_order'),
        supabase
          .from('v_subcategories_with_translations')
          .select('*')
          .order('display_order')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;

      const categories = categoriesResult.data || [];
      const subcategories = subcategoriesResult.data || [];

      // Group subcategories by category
      const subcategoriesByCategory = new Map<string, typeof subcategories>();
      for (const sub of subcategories) {
        const categoryId = sub.category_id;
        if (!subcategoriesByCategory.has(categoryId)) {
          subcategoriesByCategory.set(categoryId, []);
        }
        subcategoriesByCategory.get(categoryId)!.push(sub);
      }

      // Transform to Hub format
      const hubs: Hub[] = categories.map((category: any) => {
        const categorySubs = subcategoriesByCategory.get(category.id) || [];
        
        return {
          slug: category.slug || category.id,
          label: category.translations?.[language]?.name || 
                 category.translations?.en?.name || 
                 'Unnamed Category',
          icon: category.icon || getDefaultCategoryIcon(category.slug),
          subs: categorySubs.map((sub: any) => ({
            slug: sub.slug || sub.id,
            label: sub.translations?.[language]?.name || 
                   sub.translations?.en?.name || 
                   'Unnamed Subcategory',
            icon: getDefaultSubcategoryIcon(sub.slug, category.slug)
          }))
        };
      });

      return hubs;
    }
  });
}

/**
 * Find a hub by slug, with fallback to first hub
 */
export function findHub(hubs: Hub[] | null, hubSlug?: string): Hub | null {
  if (!hubs || !hubs.length) return null;
  if (!hubSlug) return hubs[0];
  return hubs.find(h => h.slug === hubSlug) ?? hubs[0];
}

/**
 * Get default subcategory for a hub (first sub or empty string)
 */
export function getDefaultSubcategory(hub: Hub | null): string {
  if (!hub || !hub.subs?.length) return "";
  return hub.subs[0].slug;
}

// Helper function to get default category icons
const getDefaultCategoryIcon = (slug: string | null) => {
  switch (slug) {
    case 'health': return '🏥';
    case 'wealth': return '💰';
    case 'relationships': return '❤️';
    case 'mind': return '🧠';
    case 'purpose': return '🎯';
    case 'lifestyle': return '🌟';
    default: return '📊';
  }
};

// Helper function to get default subcategory icons
const getDefaultSubcategoryIcon = (slug: string | null, categorySlug: string | null) => {
  if (categorySlug === 'health') {
    switch (slug) {
      case 'fitness': return '💪';
      case 'nutrition': return '🥗';
      case 'sleep': return '😴';
      case 'medical': return '📋';
      case 'energy': return '⚡';
      case 'configure': return '⚙️';
      default: return '🏥';
    }
  }
  
  if (categorySlug === 'relationships') {
    switch (slug) {
      case 'friends': return '👥';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'love': return '💝';
      default: return '❤️';
    }
  }

  if (categorySlug === 'wealth') {
    switch (slug) {
      case 'finance': return '💳';
      case 'career': return '💼';
      case 'investments': return '📈';
      default: return '💰';
    }
  }

  if (categorySlug === 'mind') {
    switch (slug) {
      case 'skills': return '🎯';
      case 'knowledge': return '📚';
      case 'goals': return '🏆';
      default: return '🧠';
    }
  }

  if (categorySlug === 'lifestyle') {
    switch (slug) {
      case 'habits': return '📝';
      case 'productivity': return '⚡';
      case 'mindfulness': return '🧘';
      default: return '🌟';
    }
  }

  return '📋';
};