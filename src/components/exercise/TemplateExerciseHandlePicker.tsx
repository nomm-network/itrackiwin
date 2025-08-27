import { useExerciseHandles, pickHandleName } from '@/hooks/useExerciseHandles';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TemplateExerciseHandlePickerProps {
  templateExerciseId: string;
  exerciseId: string;
  selectedHandleId?: string;
  onHandleChange?: (handleId: string | null) => void;
  lang?: 'en' | 'ro';
}

export function TemplateExerciseHandlePicker({
  templateExerciseId,
  exerciseId,
  selectedHandleId,
  onHandleChange,
  lang = 'en',
}: TemplateExerciseHandlePickerProps) {
  const { data: options, isLoading } = useExerciseHandles(exerciseId, lang);

  const setHandle = async (handleId: string | null) => {
    if (!handleId) {
      await supabase.from('template_exercise_handles')
        .delete().eq('template_exercise_id', templateExerciseId);
    } else {
      // upsert one per template_exercise
      await supabase.from('template_exercise_handles').upsert({
        template_exercise_id: templateExerciseId,
        handle_id: handleId,
      }, { onConflict: 'template_exercise_id' });
    }
    
    onHandleChange?.(handleId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading handles...
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No handles available for this exercise.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Choose Handle/Attachment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {options?.map(opt => (
          <Button
            key={opt.handle_id}
            variant={selectedHandleId === opt.handle_id ? "default" : "outline"}
            onClick={() => setHandle(opt.handle_id)}
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">
                {pickHandleName(opt, lang)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({opt.handle?.category})
                {opt.is_default && ' • default'}
              </span>
            </div>
          </Button>
        ))}
        <Button 
          variant="ghost" 
          onClick={() => setHandle(null)} 
          className="w-full text-xs text-muted-foreground hover:text-destructive"
        >
          Clear handle
        </Button>
      </CardContent>
    </Card>
  );
}