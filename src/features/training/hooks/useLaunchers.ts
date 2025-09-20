// step-1 launcher (v0.7.3-min)
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useReadinessStore } from "@/stores/readinessStore";

export function useWorkoutLaunchers() {
  const navigate = useNavigate();

  const startFromTemplate = async (templateId: string) => {
    if (!templateId) throw new Error("Template id missing");

    // 1) create workout on the DB from template
    const { data: workoutId, error } = await supabase.rpc("start_workout", {
      p_template_id: templateId,
    });
    if (error) throw error;
    if (!workoutId) throw new Error("start_workout returned null");

    // 2) store readiness snapshot if present (non-blocking)
    const score = useReadinessStore.getState().score;
    if (score != null) {
      await supabase.from("workouts").update({ readiness_score: score }).eq("id", workoutId);
    }

    // 3) hard navigate to the workout page
    navigate(`/workouts/${workoutId}`);
    return workoutId;
  };

  return { startFromTemplate };
}