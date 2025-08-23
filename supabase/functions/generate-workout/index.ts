import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

interface GenerateWorkoutRequest {
  userId?: string;
  templateId?: string;
  now?: string;
}

interface GymInventory {
  gymId: string;
  dumbbells: Array<{ weight: number; unit: string; quantity: number }>;
  plates: Array<{ weight: number; unit: string; quantity: number }>;
  bars: Array<{ weight: number; unit: string; name: string }>;
  machines: Array<{ id: string; label: string; stackValues: number[]; auxValues: number[]; unit: string }>;
  miniweights: Array<{ weight: number; unit: string; quantity: number }>;
}

interface ExerciseHistory {
  weight?: number;
  reps?: number;
  rpe?: number;
  completed_at: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const requestBody = await req.json();
    const { userId, templateId, now, idempotencyKey }: GenerateWorkoutRequest & { idempotencyKey?: string } = requestBody;
    
    if (!userId) {
      throw new Error('userId is required');
    }

    // Check rate limit
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_operation_type: 'generate_workout',
      p_max_requests: 10, // Max 10 workouts per hour
      p_window_minutes: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before generating another workout.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle idempotency
    if (idempotencyKey) {
      const requestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(requestBody)));
      const hashArray = Array.from(new Uint8Array(requestHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: idempotencyCheck } = await supabase.rpc('check_idempotency', {
        p_key: idempotencyKey,
        p_user_id: userId,
        p_operation_type: 'generate_workout',
        p_request_hash: hashHex
      });

      if (idempotencyCheck?.cached) {
        console.log(`Returning cached response for idempotency key: ${idempotencyKey}`);
        return new Response(JSON.stringify(idempotencyCheck.response), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Idempotency-Cached': 'true'
          },
        });
      }

      if (idempotencyCheck?.error) {
        return new Response(
          JSON.stringify({ error: idempotencyCheck.message }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log(`Generating workout for user ${userId}, template ${templateId}`);

    // 1. Resolve template ID (use provided or get next in rotation)
    let resolvedTemplateId = templateId;
    if (!resolvedTemplateId) {
      const { data: nextTemplate } = await supabase.rpc('next_template_id', { _user_id: userId });
      resolvedTemplateId = nextTemplate;
    }

    if (!resolvedTemplateId) {
      throw new Error('No active templates found in rotation');
    }

    // 2. Get default gym and load inventory
    const { data: gymId } = await supabase.rpc('get_default_gym', { _user_id: userId });
    if (!gymId) {
      throw new Error('No default gym configured');
    }

    const gymInventory = await loadGymInventory(supabase, gymId);
    
    // 3. Get template exercises with details
    const { data: templateExercises, error: exerciseError } = await supabase
      .from('template_exercises')
      .select(`
        *,
        exercises (
          id, name, capability_schema, equipment_id
        )
      `)
      .eq('template_id', resolvedTemplateId)
      .order('order_index');

    if (exerciseError || !templateExercises) {
      throw new Error(`Failed to load template exercises: ${exerciseError?.message}`);
    }

    // 4. Create new workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (workoutError || !workout) {
      throw new Error(`Failed to create workout: ${workoutError?.message}`);
    }

    // 5. Process each exercise and create sets
    const workoutData = [];
    
    for (const [index, templateExercise] of templateExercises.entries()) {
      const exercise = templateExercise.exercises;
      
      // Create workout exercise
      const { data: workoutExercise, error: weError } = await supabase
        .from('workout_exercises')
        .insert([{
          workout_id: workout.id,
          exercise_id: exercise.id,
          order_index: index + 1,
          notes: templateExercise.notes
        }])
        .select()
        .single();

      if (weError || !workoutExercise) {
        console.error(`Failed to create workout exercise: ${weError?.message}`);
        continue;
      }

      // Get exercise history for progression
      const history = await getExerciseHistory(supabase, userId, exercise.id);
      
      // Generate sets based on capability schema and gym inventory
      const sets = await generateSetsForExercise(
        templateExercise,
        exercise,
        history,
        gymInventory
      );

      // Insert sets
      const setInserts = sets.map((set, setIndex) => ({
        workout_exercise_id: workoutExercise.id,
        set_index: setIndex + 1,
        set_kind: set.kind,
        weight: set.weight,
        reps: set.targetReps,
        weight_unit: set.unit || 'kg',
        notes: set.notes,
        is_completed: false
      }));

      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(setInserts);

      if (setsError) {
        console.error(`Failed to create sets: ${setsError.message}`);
      }

      workoutData.push({
        exercise: exercise.name,
        sets: sets.length,
        targetWeight: sets.find(s => s.kind === 'normal')?.weight,
        notes: sets.map(s => s.notes).filter(Boolean).join('; ')
      });
    }

    // 6. Update template rotation (mark as used)
    await supabase
      .from('user_active_templates')
      .update({ last_done_at: now || new Date().toISOString() })
      .eq('user_id', userId)
      .eq('template_id', resolvedTemplateId);

    const response = {
      workoutId: workout.id,
      templateId: resolvedTemplateId,
      exercises: workoutData,
      gymId,
      createdAt: workout.created_at
    };

    // Store idempotency result if key provided
    if (idempotencyKey) {
      const requestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(requestBody)));
      const hashArray = Array.from(new Uint8Array(requestHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await supabase.rpc('store_idempotency_result', {
        p_key: idempotencyKey,
        p_user_id: userId,
        p_operation_type: 'generate_workout',
        p_request_hash: hashHex,
        p_response_data: response
      });
    }

    console.log(`Generated workout ${workout.id} with ${workoutData.length} exercises`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating workout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function loadGymInventory(supabase: any, gymId: string): Promise<GymInventory> {
  const [dumbbells, plates, bars, machines, miniweights] = await Promise.all([
    supabase.from('user_gym_dumbbells').select('weight, unit, quantity').eq('user_gym_id', gymId),
    supabase.from('user_gym_plates').select('weight, unit, quantity').eq('user_gym_id', gymId),
    supabase.from('user_gym_bars').select('bar_types(name, default_weight, unit), quantity').eq('user_gym_id', gymId),
    supabase.from('user_gym_machines').select('id, label, stack_values, aux_values, unit').eq('user_gym_id', gymId),
    supabase.from('user_gym_miniweights').select('weight, unit, quantity').eq('user_gym_id', gymId)
  ]);

  return {
    gymId,
    dumbbells: dumbbells.data || [],
    plates: plates.data || [],
    bars: bars.data?.map((b: any) => ({
      weight: b.bar_types.default_weight,
      unit: b.bar_types.unit,
      name: b.bar_types.name
    })) || [],
    machines: machines.data || [],
    miniweights: miniweights.data || []
  };
}

async function getExerciseHistory(supabase: any, userId: string, exerciseId: string): Promise<ExerciseHistory[]> {
  const { data } = await supabase
    .from('workout_sets')
    .select(`
      weight, reps, rpe, completed_at,
      workout_exercises!inner (
        exercise_id,
        workouts!inner (user_id)
      )
    `)
    .eq('workout_exercises.exercise_id', exerciseId)
    .eq('workout_exercises.workouts.user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(6);

  return data || [];
}

async function generateSetsForExercise(
  templateExercise: any,
  exercise: any,
  history: ExerciseHistory[],
  inventory: GymInventory
) {
  const schema = exercise.capability_schema || {};
  const equipmentMode = schema.equipment_mode || 'barbell';
  const repRange = schema.progression?.rep_range || [8, 12];
  const topSetPercent = schema.progression?.top_set_percent_1rm || 0.78;
  const backoffPercent = schema.progression?.backoff?.percent || 0.90;
  const backoffSets = schema.progression?.backoff?.sets || 2;
  
  // Calculate target weight from history or defaults
  let targetWeight = 60; // default kg
  let unit = 'kg';
  
  if (history.length > 0) {
    // Use recent performance to estimate
    const recentSets = history.slice(0, 3);
    const avgWeight = recentSets.reduce((sum, set) => sum + (set.weight || 0), 0) / recentSets.length;
    
    // Simple progression: add 2.5kg if last session was good
    const lastRpe = recentSets[0]?.rpe || 7;
    const increment = lastRpe <= 7 ? 2.5 : 0;
    targetWeight = Math.max(avgWeight + increment, avgWeight);
  }

  // Round weight based on equipment and inventory
  targetWeight = roundWeightForEquipment(targetWeight, equipmentMode, inventory);

  const sets = [];
  
  // Generate warmup sets
  const warmupStages = schema.warmup?.stages || [0.4, 0.6, 0.75];
  for (const [index, percent] of warmupStages.entries()) {
    const warmupWeight = roundWeightForEquipment(targetWeight * percent, equipmentMode, inventory);
    sets.push({
      kind: 'warmup',
      weight: warmupWeight,
      targetReps: Math.max(12 - index * 2, 5),
      unit,
      notes: `Warmup ${index + 1}`
    });
  }

  // Top set
  sets.push({
    kind: 'normal',
    weight: targetWeight,
    targetReps: repRange[0],
    unit,
    notes: 'Top set'
  });

  // Backoff sets
  const backoffWeight = roundWeightForEquipment(targetWeight * backoffPercent, equipmentMode, inventory);
  for (let i = 0; i < backoffSets; i++) {
    sets.push({
      kind: 'normal',
      weight: backoffWeight,
      targetReps: repRange[1],
      unit,
      notes: `Backoff ${i + 1}`
    });
  }

  return sets;
}

function roundWeightForEquipment(weight: number, equipmentMode: string, inventory: GymInventory): number {
  switch (equipmentMode) {
    case 'dumbbell':
      return roundToDumbbells(weight, inventory.dumbbells);
    case 'machine':
      // For now, round to nearest 2.5kg - could be smarter with machine-specific logic
      return Math.round(weight / 2.5) * 2.5;
    case 'barbell':
    default:
      return roundToBarbell(weight, inventory.plates, inventory.bars, inventory.miniweights);
  }
}

function roundToDumbbells(targetWeight: number, dumbbells: any[]): number {
  if (dumbbells.length === 0) return Math.round(targetWeight / 2.5) * 2.5;
  
  // Find closest available dumbbell weight
  let closest = dumbbells[0].weight;
  let minDiff = Math.abs(targetWeight - closest);
  
  for (const db of dumbbells) {
    const diff = Math.abs(targetWeight - db.weight);
    if (diff < minDiff) {
      closest = db.weight;
      minDiff = diff;
    }
  }
  
  return closest;
}

function roundToBarbell(targetWeight: number, plates: any[], bars: any[], miniweights: any[]): number {
  const barWeight = bars.length > 0 ? bars[0].weight : 20; // Default Olympic bar
  const targetPlateWeight = targetWeight - barWeight;
  
  if (targetPlateWeight <= 0) return barWeight;
  
  // Simple plate loading: use largest plates first
  const allWeights = [...plates, ...miniweights]
    .sort((a, b) => b.weight - a.weight);
  
  let remainingWeight = targetPlateWeight / 2; // Per side
  let totalPlateWeight = 0;
  
  for (const plate of allWeights) {
    const plateWeight = plate.weight;
    const canUse = Math.floor(Math.min(remainingWeight / plateWeight, plate.quantity / 2));
    
    if (canUse > 0) {
      totalPlateWeight += canUse * plateWeight;
      remainingWeight -= canUse * plateWeight;
    }
  }
  
  return barWeight + (totalPlateWeight * 2);
}