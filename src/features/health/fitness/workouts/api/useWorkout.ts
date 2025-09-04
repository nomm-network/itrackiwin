import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

// --- Types the UI relies on ---
export type WorkoutDTO = {
  id: string
  name: string | null
  started_at: string | null
  ended_at: string | null
  exercises: WorkoutExerciseDTO[]
}

export type WorkoutExerciseDTO = {
  id: string
  order_index: number
  target_reps: number | null
  target_weight_kg: number | null
  weight_unit: 'kg' | 'lb' | null
  attribute_values_json: {
    warmup?: { kg: number; reps: number; rest_s: number }[]
    [k: string]: any
  } | null
  exercise: {
    id: string
    display_name: string | null
    slug: string
    equipment_id: string | null
    load_type: string | null
    tags: string[] | null
  }
  sets: WorkoutSetDTO[]
}

export type WorkoutSetDTO = {
  id: string
  set_index: number
  set_kind: 'warmup' | 'normal' | 'top_set' | 'backoff'
  reps: number | null
  weight_kg: number | null
  is_completed: boolean
  rest_seconds: number | null
}

// --- Hook ---
export function useWorkout(workoutId?: string) {
  return useQuery({
    queryKey: ['workout', workoutId],
    enabled: !!workoutId,
    queryFn: async (): Promise<WorkoutDTO> => {
      if (!workoutId) throw new Error('No workoutId')

      // 1) Workout core (title comes from template if null)
      const { data: w, error: wErr } = await supabase
        .from('workouts')
        .select('id, title, started_at, ended_at, template_id')
        .eq('id', workoutId)
        .single()
      if (wErr) throw wErr

      // optional: fallback to template name
      let title = w?.title ?? null
      if (!title && w?.template_id) {
        const { data: t } = await supabase
          .from('workout_templates')
          .select('name')
          .eq('id', w.template_id)
          .single()
        title = t?.name ?? null
      }

      // 2) Exercises + sets (ordered)
      const { data: wes, error: weErr } = await supabase
        .from('workout_exercises')
        .select(`
          id, workout_id, exercise_id, order_index,
          target_reps, target_weight_kg, weight_unit,
          attribute_values_json, readiness_adjusted_from,
          exercise:exercises!inner(id, display_name, slug, equipment_id, load_type, tags),
          workout_sets(
            id, workout_exercise_id, set_index, set_kind,
            reps, weight_kg, is_completed, rest_seconds
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true })
      if (weErr) throw weErr

      const exercises: WorkoutExerciseDTO[] =
        (wes ?? []).map((row: any) => ({
          id: row.id,
          order_index: row.order_index,
          target_reps: row.target_reps,
          target_weight_kg: row.target_weight_kg,
          weight_unit: row.weight_unit ?? 'kg',
          attribute_values_json: row.attribute_values_json ?? {},
          exercise: row.exercise,
          sets: (row.workout_sets ?? []).sort(
            (a: any, b: any) => (a.set_index ?? 0) - (b.set_index ?? 0)
          ),
        }))

      return {
        id: w.id,
        name: title,
        started_at: w.started_at,
        ended_at: w.ended_at,
        exercises,
      }
    },
  })
}