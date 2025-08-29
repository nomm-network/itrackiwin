import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  search?: string;
  bodyPartId?: string;
  equipmentId?: string;
  tags?: string[];
  movementPattern?: string;
  skillLevel?: string;
  variant?: string;
}

export function useExerciseSearch(filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['exercise-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('v_exercises_with_translations')
        .select(`
          *,
          aliases:exercise_aliases(alias),
          equipment:equipment!inner(slug, translations:equipment_translations(name, language_code)),
          body_part:body_parts!inner(slug, translations:body_parts_translations(name, language_code))
        `);

      // Search in name, description, and aliases
      if (filters.search) {
        query = query.or(`
          translations->>en->>name.ilike.%${filters.search}%,
          translations->>ro->>name.ilike.%${filters.search}%,
          aliases.alias.ilike.%${filters.search}%
        `);
      }

      // Filter by body part
      if (filters.bodyPartId) {
        query = query.eq('body_part_id', filters.bodyPartId);
      }

      // Filter by equipment
      if (filters.equipmentId) {
        query = query.eq('equipment_id', filters.equipmentId);
      }

      // Filter by movement pattern
      if (filters.movementPattern) {
        query = query.eq('movement_pattern', filters.movementPattern as any);
      }

      // Filter by skill level
      if (filters.skillLevel) {
        query = query.eq('exercise_skill_level', filters.skillLevel as any);
      }

      // Filter by tags (if tags array is provided)
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query
        .order('popularity_rank', { ascending: false, nullsFirst: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper hook for search suggestions based on aliases
export function useSearchSuggestions(searchTerm: string) {
  return useQuery({
    queryKey: ['search-suggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('exercise_aliases')
        .select('alias, exercise:exercises!inner(id, slug, display_name)')
        .ilike('alias', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for getting popular tags for autocomplete
export function usePopularTags() {
  return useQuery({
    queryKey: ['popular-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      // Flatten all tags and count frequency
      const tagCounts: Record<string, number> = {};
      data.forEach(exercise => {
        if (exercise.tags) {
          exercise.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Sort by frequency and return top 20
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag]) => tag);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}