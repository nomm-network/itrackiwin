import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PinnedSubcategory {
  id: string;
  subcategory_id: string;
  subcategory: {
    id: string;
    slug: string;
    translations: Array<{
      language_code: string;
      name: string;
    }>;
  };
}

export function usePinnedSubcategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_pinned_subcategories", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_pinned_subcategories")
        .select(`
          id,
          subcategory_id,
          subcategory:life_subcategories(
            id,
            slug,
            translations:life_subcategory_translations(
              language_code,
              name
            )
          )
        `)
        .eq("user_id", user!.id);

      if (error) throw error;
      return (data || []) as PinnedSubcategory[];
    },
  });
}