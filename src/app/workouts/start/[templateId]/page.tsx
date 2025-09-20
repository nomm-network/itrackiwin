// workout-flow-v1.0.0 (SOT) – DO NOT DUPLICATE
'use client';

import { useParams, useNavigate } from 'react-router-dom';
import ReadinessPage from '@/features/readiness/ReadinessPage';
import { startFromTemplate } from '@/features/training/hooks/useLaunchers';
import { toast } from '@/hooks/use-toast';

export default function StartWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const handleAfterReadiness = async () => {
    try {
      if (!templateId) throw new Error('Template ID missing');
      const workoutId = await startFromTemplate(templateId);
      navigate(`/app/workouts/${workoutId}`);
    } catch (e: any) {
      toast({
        title: 'Could not start workout',
        description: e.message ?? 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return <ReadinessPage onAfterSubmit={handleAfterReadiness} />;
}