import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SubcategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Get subcategory details to find the parent category
  const { data: subcategory, isLoading } = useQuery({
    queryKey: ['subcategory_by_slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('life_subcategories')
        .select(`
          id,
          slug,
          category_id,
          life_categories!inner(
            id,
            slug
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (subcategory) {
      // Redirect to dashboard with proper category and subcategory filters
      const categorySlug = subcategory.life_categories.slug;
      
      console.log('SubcategoryPage: Redirecting', { slug, categorySlug, subcategory });
      
      if (categorySlug === 'health' && slug === 'fitness-exercise') {
        // Special case: fitness-exercise redirects to main dashboard
        navigate('/dashboard');
      } else {
        // General case: redirect to dashboard with category and subcategory filters
        navigate(`/dashboard?cat=${categorySlug}&sub=${slug}`);
      }
    }
  }, [subcategory, slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Page not found</h2>
          <p className="text-muted-foreground">This area doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  // This should not render as we redirect immediately
  return null;
};

export default SubcategoryPage;