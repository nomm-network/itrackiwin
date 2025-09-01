import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CreateWorkoutFromTemplateParams {
  templateId: string;
}

// REMOVED: Legacy useCreateWorkoutFromTemplate - use useStartWorkout from workouts.api.ts instead