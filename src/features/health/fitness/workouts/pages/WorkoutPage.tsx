import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import WarmupBlock from "../components/WarmupBlock";
import SetCard from "../components/SetCard";

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();

  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) return;

    const fetchWorkout = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          id,
          started_at,
          ended_at,
          workout_templates(name),
          workout_exercises(
            id,
            exercises(display_name),
            target_weight_kg,
            target_reps,
            target_sets,
            warmup_plan,
            workout_sets(
              id,
              weight_kg,
              reps,
              set_index,
              set_kind,
              is_completed,
              created_at
            )
          )
        `
        )
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Failed to fetch workout:", error);
      } else {
        setWorkout(data);
      }
      setLoading(false);
    };

    fetchWorkout();
  }, [workoutId]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!workout) {
    return <div className="p-4">Workout not found</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        {workout.workout_templates?.name || "Workout Session"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Started {new Date(workout.started_at).toLocaleString()}
      </p>

      {workout.workout_exercises?.map((we: any) => (
        <div
          key={we.id}
          className="border border-border rounded-lg p-4 space-y-4"
        >
          <h2 className="text-xl font-semibold">{we.exercises?.display_name}</h2>

          {/* Warmup Section */}
          {we.warmup_plan && (
            <WarmupBlock
              topWeight={we.target_weight_kg || 60}
              warmupSteps={[
                { weight: (we.target_weight_kg || 60) * 0.4, reps: 10, rest_seconds: 60 },
                { weight: (we.target_weight_kg || 60) * 0.6, reps: 8, rest_seconds: 90 },
                { weight: (we.target_weight_kg || 60) * 0.8, reps: 5, rest_seconds: 120 }
              ]}
            />
          )}

          {/* Sets Section */}
          <div className="space-y-2">
            {we.workout_sets?.map((set: any) => (
              <SetCard 
                key={set.id} 
                set={{
                  ...set,
                  target_weight_kg: we.target_weight_kg,
                  target_reps: we.target_reps,
                  prev_weight_kg: set.weight_kg,
                  prev_reps: set.reps
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}