import { CategoryConfig, SubcategoryConfig, Category } from '@/app/dashboard/types';

export interface SubcategoryWithOrder extends SubcategoryConfig {
  display_order?: number;
  isPlaceholder?: boolean;
}

/**
 * Ensures each category shows exactly N subcategories by:
 * 1. Sorting existing subcategories by display_order (if available)
 * 2. Padding with placeholder items if fewer than N exist
 * 3. Truncating if more than N exist
 */
export function getTopNSubitems(
  categoryId: string, 
  subcategories: SubcategoryConfig[], 
  n: number = 5
): SubcategoryWithOrder[] {
  // Convert to extended format and sort by display_order, then by original position
  const extendedSubcategories: SubcategoryWithOrder[] = subcategories.map((sub, index) => ({
    ...sub,
    icon: sub.icon || '📋', // Provide default icon if missing
    display_order: index // Use array index as fallback order
  }));

  const sortedSubcategories = extendedSubcategories.sort((a, b) => {
    return (a.display_order || 0) - (b.display_order || 0);
  });

  const result: SubcategoryWithOrder[] = [];

  // Add existing subcategories (up to N)
  for (let i = 0; i < Math.min(n, sortedSubcategories.length); i++) {
    result.push(sortedSubcategories[i]);
  }

  // Pad with placeholders if needed
  const placeholdersNeeded = n - result.length;
  for (let i = 0; i < placeholdersNeeded; i++) {
    result.push({
      id: `${categoryId}-placeholder-${i + 1}`,
      name: 'Coming Soon',
      icon: '⭐',
      isPlaceholder: true,
      display_order: 1000 + i // High number to sort last
    });
  }

  return result;
}

/**
 * Normalizes all categories to show exactly N subcategories each
 */
export function normalizeCategoriesSubcategories(
  categories: CategoryConfig[], 
  n: number = 5
): CategoryConfig[] {
  return categories.map(category => ({
    ...category,
    subcategories: getTopNSubitems(
      category.id,
      category.subcategories || [],
      n
    )
  }));
}

/**
 * Unit test helpers - these can be used for testing the utility
 */
export const testHelpers = {
  createMockSubcategory: (
    id: string, 
    name: string, 
    icon: string = '🔹', 
    display_order?: number
  ): SubcategoryWithOrder => ({
    id,
    name,
    icon,
    display_order
  }),

  createMockCategory: (
    id: string, 
    name: string, 
    subcategories: SubcategoryConfig[] = []
  ): CategoryConfig => ({
    id: id as Category,
    name,
    icon: '📊',
    color: 'hsl(200 100% 50%)',
    subcategories
  })
};