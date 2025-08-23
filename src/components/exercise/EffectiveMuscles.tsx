import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useEffectiveMuscles } from "@/hooks/useEffectiveMuscles";
import { cn } from "@/lib/utils";

interface EffectiveMusclesProps {
  exerciseId: string;
  gripIds?: string[];
  equipmentId?: string;
  className?: string;
}

export const EffectiveMuscles = ({ 
  exerciseId, 
  gripIds, 
  equipmentId,
  className 
}: EffectiveMusclesProps) => {
  const { data: effectiveMuscles = [], isLoading } = useEffectiveMuscles(
    exerciseId, 
    gripIds, 
    equipmentId
  );

  // Get muscle translations
  const { data: muscleNames = {} } = useQuery({
    queryKey: ['muscle-translations', effectiveMuscles.map(m => m.muscle_id)],
    queryFn: async () => {
      if (effectiveMuscles.length === 0) return {};
      
      const { data, error } = await supabase
        .from('muscles_translations')
        .select('muscle_id, name')
        .eq('language_code', 'en')
        .in('muscle_id', effectiveMuscles.map(m => m.muscle_id));

      if (error) throw error;
      
      return data.reduce((acc, mt) => {
        acc[mt.muscle_id] = mt.name;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: effectiveMuscles.length > 0
  });

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 w-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (effectiveMuscles.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {effectiveMuscles.map((muscle) => {
        const intensity = Math.round(muscle.effective_score * 100);
        const name = muscleNames[muscle.muscle_id] || 'Unknown';
        
        return (
          <Badge
            key={muscle.muscle_id}
            variant={muscle.primary_muscle ? "default" : "secondary"}
            className={cn(
              "text-xs px-2 py-0.5",
              muscle.primary_muscle 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground",
              // Add intensity indicator with opacity
              muscle.effective_score !== (muscle.primary_muscle ? 1.0 : 0.5) && "opacity-80"
            )}
            title={`${name} - ${intensity}% activation`}
          >
            {name}
            {muscle.effective_score !== (muscle.primary_muscle ? 1.0 : 0.5) && (
              <span className="ml-1 text-xs opacity-75">
                {intensity > 100 ? '+' : ''}{intensity - (muscle.primary_muscle ? 100 : 50)}%
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
};