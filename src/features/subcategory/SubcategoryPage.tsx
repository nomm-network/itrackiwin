import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SubcategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Get subcategory details to find the parent category
  const { data: subcategory, isLoading, error } = useQuery({
    queryKey: ['subcategory_by_slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      console.log('🔍 SubcategoryPage: Querying for slug:', slug);
      
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

      console.log('🔍 SubcategoryPage: Query result:', { data, error });
      
      if (error) {
        console.error('🔍 SubcategoryPage: Query error:', error);
        throw error;
      }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <span>Loading subcategory: {slug}...</span>
          <div className="mt-4 text-xs text-muted-foreground">
            DEBUG: Looking up slug "{slug}" in database
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-500">Query Error</h2>
          <p className="text-muted-foreground mb-4">Failed to lookup subcategory: {slug}</p>
          <div className="text-xs bg-red-50 p-4 rounded border">
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Subcategory not found</h2>
          <p className="text-muted-foreground mb-4">No subcategory found with slug: "{slug}"</p>
          <div className="text-xs bg-gray-50 p-4 rounded border">
            <div>DEBUG INFO:</div>
            <div>Slug searched: {slug}</div>
            <div>Query enabled: {!!slug ? 'true' : 'false'}</div>
            <div>Loading: {isLoading ? 'true' : 'false'}</div>
            <div>Data returned: {subcategory ? 'yes' : 'no'}</div>
          </div>
        </div>
      </div>
    );
  }

  // This should not render as we redirect immediately, but show debug info if it does
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: SubcategoryPage</h1>
        <div className="bg-blue-50 p-4 rounded border mb-4">
          <h3 className="font-semibold mb-2">Redirect should have occurred</h3>
          <p>If you see this page, the redirect didn't work properly.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="text-sm space-y-1">
            <div><strong>URL Slug:</strong> {slug}</div>
            <div><strong>Subcategory Found:</strong> {subcategory ? 'Yes' : 'No'}</div>
            {subcategory && (
              <>
                <div><strong>Subcategory Slug:</strong> {subcategory.slug}</div>
                <div><strong>Category Slug:</strong> {subcategory.life_categories?.slug}</div>
                <div><strong>Should redirect to:</strong> /dashboard?cat={subcategory.life_categories?.slug}&sub={slug}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage;