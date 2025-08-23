import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LifeCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
  display_order: number;
  translations: Record<string, { name: string; description: string }>;
  subcategories?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export interface LifeSubcategory {
  id: string;
  category_id: string;
  slug: string | null;
  name: string;
  description: string;
  display_order: number;
  translations: Record<string, { name: string; description: string }>;
}

export function useLifeCategories(language: string = 'en') {
  return useQuery({
    queryKey: ['life-categories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_categories_with_translations')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      return data.map((category: any) => ({
        id: category.id,
        slug: category.slug || category.id,
        name: category.translations?.[language]?.name || category.translations?.en?.name || 'Unnamed Category',
        description: category.translations?.[language]?.description || category.translations?.en?.description || '',
        icon: category.icon || getDefaultCategoryIcon(category.slug),
        color: category.color || 'hsl(200 100% 50%)',
        display_order: category.display_order,
        translations: category.translations
      })) as LifeCategory[];
    }
  });
}

export function useLifeSubcategories(language: string = 'en') {
  return useQuery({
    queryKey: ['life-subcategories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_subcategories_with_translations')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      return data.map((subcategory: any) => ({
        id: subcategory.id,
        category_id: subcategory.category_id,
        slug: subcategory.slug || subcategory.id,
        name: subcategory.translations?.[language]?.name || subcategory.translations?.en?.name || 'Unnamed Subcategory',
        description: subcategory.translations?.[language]?.description || subcategory.translations?.en?.description || '',
        display_order: subcategory.display_order,
        translations: subcategory.translations
      })) as LifeSubcategory[];
    }
  });
}

export function useLifeCategoriesWithSubcategories(language: string = 'en') {
  const { data: categories, isLoading: categoriesLoading } = useLifeCategories(language);
  const { data: subcategories, isLoading: subcategoriesLoading } = useLifeSubcategories(language);

  const data = React.useMemo(() => {
    if (!categories || !subcategories) return [];

    return categories.map(category => {
      const categorySubcategories = subcategories
        .filter(sub => sub.category_id === category.id)
        .sort((a, b) => a.display_order - b.display_order);

      return {
        ...category,
        subcategories: categorySubcategories.map(sub => ({
          id: sub.slug || sub.id,
          name: sub.name,
          icon: getDefaultSubcategoryIcon(sub.name, category.slug)
        }))
      };
    });
  }, [categories, subcategories]);

  return {
    data,
    isLoading: categoriesLoading || subcategoriesLoading
  };
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
const getDefaultSubcategoryIcon = (name: string, categorySlug: string | null) => {
  if (categorySlug === 'health') {
    if (name.toLowerCase().includes('fitness')) return '💪';
    if (name.toLowerCase().includes('nutrition')) return '🥗';
    if (name.toLowerCase().includes('sleep')) return '😴';
    if (name.toLowerCase().includes('mental')) return '🧘';
  }
  return '📋';
};

// Helper functions for compatibility with existing code
export const getCategoryBySlug = (categories: LifeCategory[], slug: string) => 
  categories?.find(cat => cat.slug === slug || cat.id === slug);

export const getSubcategoryBySlug = (subcategories: LifeSubcategory[], categoryId: string, subcategorySlug: string) =>
  subcategories?.find(sub => sub.category_id === categoryId && (sub.slug === subcategorySlug || sub.id === subcategorySlug));