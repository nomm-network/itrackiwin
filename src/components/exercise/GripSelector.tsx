import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Grip {
  id: string;
  slug: string;
  category: string;
}

interface GripTranslation {
  name: string;
  description?: string;
}

interface GripSelectorProps {
  exerciseId: string;
  selectedGripIds: string[];
  onGripChange: (gripIds: string[]) => void;
  className?: string;
}

export const GripSelector = ({ 
  exerciseId, 
  selectedGripIds, 
  onGripChange,
  className 
}: GripSelectorProps) => {
  const { data: grips = [] } = useQuery({
    queryKey: ['exercise-grips', exerciseId],
    queryFn: async () => {
      // Get default grips for this exercise
      const { data: exerciseGrips, error } = await supabase
        .from('exercise_default_grips')
        .select(`
          grip_id,
          grips!inner (
            id,
            slug,
            category,
            grips_translations!inner (
              name,
              description
            )
          )
        `)
        .eq('exercise_id', exerciseId)
        .eq('grips.grips_translations.language_code', 'en')
        .order('order_index');

      if (error) throw error;
      
      return exerciseGrips?.map(eg => {
        const grip = eg.grips as any; // Type assertion for nested query
        return {
          id: grip.id,
          slug: grip.slug,
          category: grip.category,
          name: grip.grips_translations?.[0]?.name || grip.slug
        };
      }) || [];
    },
    enabled: !!exerciseId
  });

  const toggleGrip = (gripId: string) => {
    const newGripIds = selectedGripIds.includes(gripId)
      ? selectedGripIds.filter(id => id !== gripId)
      : [...selectedGripIds, gripId];
    onGripChange(newGripIds);
  };

  if (grips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {grips.map((grip) => (
        <Badge
          key={grip.id}
          variant={selectedGripIds.includes(grip.id) ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-colors",
            selectedGripIds.includes(grip.id) 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
          onClick={() => toggleGrip(grip.id)}
        >
          {grip.name}
        </Badge>
      ))}
    </div>
  );
};