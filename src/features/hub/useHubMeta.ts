import { useLifeCategoriesWithSubcategories } from '@/hooks/useLifeCategories';

export interface HubSubcategory {
  slug: string;
  label: string;
}

export interface HubMeta {
  slug: string;
  name: string;
  subs: HubSubcategory[];
}

export function useHubMeta(categorySlug: string): HubMeta | null {
  const { data: categories, isLoading } = useLifeCategoriesWithSubcategories('en');

  if (isLoading || !categories) {
    return null;
  }

  // Find the category by slug
  const category = categories.find(cat => 
    cat.slug === categorySlug || cat.id === categorySlug
  );

  if (!category) {
    return null;
  }

  // Map subcategories to hub format
  const subs: HubSubcategory[] = category.subcategories.map(sub => ({
    slug: sub.id, // Use ID as slug since slug property may not exist
    label: sub.name.split(' ')[0] // First word for display
  }));

  // Add Configure if not already present
  if (!subs.some(s => s.slug.toLowerCase() === 'configure')) {
    subs.push({
      slug: 'configure',
      label: 'Configure'
    });
  }

  return {
    slug: category.id, // Use ID as slug since slug property may not exist
    name: category.name,
    subs
  };
}