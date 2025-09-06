import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EffectiveMuscles } from "./EffectiveMuscles";

interface ExerciseGripEffectsProps {
  exerciseId: string;
  selectedGripIds: string[];
  onGripChange: (gripIds: string[]) => void;
  showMuscleEffects?: boolean;
  equipmentId?: string;
}

interface Grip {
  id: string;
  slug: string;
  category: string;
  grips_translations: {
    name: string;
    description: string | null;
  }[];
}

export const ExerciseGripEffects = ({ 
  exerciseId, 
  selectedGripIds, 
  onGripChange, 
  showMuscleEffects = true,
  equipmentId 
}: ExerciseGripEffectsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableGrips, setAvailableGrips] = useState<Grip[]>([]);

  const { data: grips, isLoading } = useQuery({
    queryKey: ['exercise-grips', exerciseId],
    queryFn: async () => {
      // First, get the default grips for this exercise
      const { data: defaultGrips, error: defaultError } = await supabase
        .from('exercise_default_grips')
        .select('grip_id')
        .eq('exercise_id', exerciseId);

      if (defaultError) throw defaultError;

      if (!defaultGrips || defaultGrips.length === 0) {
        return [];
      }

      // Then get the grip details with translations
      const { data: gripsData, error: gripsError } = await supabase
        .from('grips')
        .select(`
          id,
          slug,
          category
        `)
        .in('id', defaultGrips.map(g => g.grip_id));

      if (gripsError) throw gripsError;

      // Get translations separately
      const { data: translations, error: translationError } = await supabase
        .from('grips_translations')
        .select('grip_id, name, description')
        .eq('language_code', 'en')
        .in('grip_id', defaultGrips.map(g => g.grip_id));

      if (translationError) throw translationError;

      // Combine grips with translations
      return gripsData?.map(grip => ({
        ...grip,
        grips_translations: translations?.filter(t => t.grip_id === grip.id).map(t => ({
          name: t.name,
          description: t.description
        })) || []
      })) || [];
    },
    enabled: !!exerciseId
  });

  useEffect(() => {
    if (grips) {
      setAvailableGrips(grips);
      
      // Auto-select the first grip if none selected and we have grips
      if (selectedGripIds.length === 0 && grips.length > 0) {
        onGripChange([grips[0].id]);
      }
    }
  }, [grips, selectedGripIds.length, onGripChange]);

  if (isLoading) return <div>Loading grips...</div>;
  if (!availableGrips.length) return null;

  const toggleGrip = (gripId: string) => {
    const newGripIds = selectedGripIds.includes(gripId)
      ? selectedGripIds.filter(id => id !== gripId)
      : [...selectedGripIds, gripId];
    onGripChange(newGripIds);
  };

  const visibleGrips = isExpanded ? availableGrips : availableGrips.slice(0, 3);
  const hasMoreGrips = availableGrips.length > 3;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Grips:</span>
          {hasMoreGrips && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 p-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {visibleGrips.map((grip) => (
            <Badge
              key={grip.id}
              variant={selectedGripIds.includes(grip.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleGrip(grip.id)}
            >
              {grip.grips_translations[0]?.name || grip.slug}
            </Badge>
          ))}
        </div>
      </div>

      {/* Show dynamic muscle emphasis when grips are selected */}
      {showMuscleEffects && selectedGripIds.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Muscle Emphasis:</span>
          <EffectiveMuscles
            exerciseId={exerciseId}
            gripIds={selectedGripIds}
            equipmentId={equipmentId}
          />
        </div>
      )}
    </div>
  );
};