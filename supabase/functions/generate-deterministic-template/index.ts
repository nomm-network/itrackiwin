import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

interface GenerateTemplateRequest {
  userId: string;
  templateName: string;
  targetMuscleGroups?: string[];
  availableEquipmentIds?: string[];
  experienceLevel?: 'new' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  workoutType?: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  exerciseCount?: number;
}

interface ExerciseCandidate {
  id: string;
  slug: string;
  equipment_id: string;
  primary_muscle_id?: string;
  exercise_skill_level: string;
  is_bar_loaded: boolean;
  complexity_score?: number;
  tags?: string[];
  movement_pattern_id?: string;
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: GenerateTemplateRequest = await req.json();
    const {
      userId,
      templateName,
      targetMuscleGroups = [],
      availableEquipmentIds = [],
      experienceLevel = 'beginner',
      workoutType = 'strength',
      exerciseCount = 6
    } = request;

    console.log(`Generating deterministic template for user ${userId}: ${templateName}`);

    // Step 1: Create the workout template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        user_id: userId,
        name: templateName,
        description: `Generated ${workoutType} template for ${experienceLevel} level`,
        difficulty_level: mapExperienceTodifficulty(experienceLevel),
      })
      .select()
      .single();

    if (templateError || !template) {
      console.error('Template creation error:', templateError);
      return new Response(
        JSON.stringify({ error: 'Failed to create template' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created template ${template.id}`);

    // Step 2: Filter and select exercises
    const selectedExercises = await selectExercises(
      supabase,
      availableEquipmentIds,
      experienceLevel,
      targetMuscleGroups,
      workoutType,
      exerciseCount
    );

    console.log(`Selected ${selectedExercises.length} exercises`);

    // Step 3: Insert template exercises
    const templateExercises = [];
    for (let i = 0; i < selectedExercises.length; i++) {
      const exercise = selectedExercises[i];
      const exerciseConfig = getExerciseConfiguration(exercise, workoutType, i + 1);
      
      templateExercises.push({
        template_id: template.id,
        exercise_id: exercise.id,
        candidate_id: null,
        order_index: i + 1,
        default_sets: exerciseConfig.sets,
        target_reps: exerciseConfig.reps,
        rest_seconds: exerciseConfig.restSeconds,
        weight_unit: 'kg',
        attribute_values_json: {},
      });
    }

    // Step 4: Handle missing exercises with candidates
    const missingExerciseSlots = exerciseCount - selectedExercises.length;
    if (missingExerciseSlots > 0) {
      console.log(`Creating ${missingExerciseSlots} exercise candidates for missing slots`);
      
      for (let i = 0; i < missingExerciseSlots; i++) {
        const candidateName = generateCandidateName(targetMuscleGroups, workoutType, i);
        
        // Insert exercise candidate
        const { data: candidate, error: candidateError } = await supabase
          .from('exercise_candidates')
          .insert({
            proposed_name: candidateName,
            equipment_id: availableEquipmentIds[0] || null,
            primary_muscle: targetMuscleGroups[0] || null,
            created_by: userId,
            status: 'pending'
          })
          .select()
          .single();

        if (!candidateError && candidate) {
          templateExercises.push({
            template_id: template.id,
            exercise_id: null,
            candidate_id: candidate.id,
            order_index: selectedExercises.length + i + 1,
            default_sets: 3,
            target_reps: 10,
            rest_seconds: 120,
            weight_unit: 'kg',
            attribute_values_json: {},
          });
        }
      }
    }

    // Step 5: Insert all template exercises
    const { error: exercisesError } = await supabase
      .from('template_exercises')
      .insert(templateExercises);

    if (exercisesError) {
      console.error('Template exercises error:', exercisesError);
      // Clean up template
      await supabase.from('workout_templates').delete().eq('id', template.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to add exercises to template' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inserted ${templateExercises.length} template exercises`);

    // Step 6: Run validation queries
    await runValidationQueries(supabase, template.id);

    const response = {
      templateId: template.id,
      templateName: template.name,
      exerciseCount: templateExercises.length,
      selectedExercises: selectedExercises.length,
      candidatesCreated: missingExerciseSlots > 0 ? missingExerciseSlots : 0,
      message: 'Deterministic template generated successfully'
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function selectExercises(
  supabase: any,
  availableEquipmentIds: string[],
  experienceLevel: string,
  targetMuscleGroups: string[],
  workoutType: string,
  exerciseCount: number
): Promise<ExerciseCandidate[]> {
  
  // Build equipment filter
  let equipmentFilter = 'equipment_id.in.(' + availableEquipmentIds.join(',') + ')';
  if (availableEquipmentIds.length === 0) {
    // If no equipment specified, allow bodyweight exercises
    equipmentFilter = 'equipment_id.is.null';
  }

  // Map experience level to skill level
  const skillLevels = getSkillLevelsForExperience(experienceLevel);
  
  let query = supabase
    .from('exercises')
    .select(`
      id, slug, equipment_id, primary_muscle_id, exercise_skill_level,
      is_bar_loaded, complexity_score, tags, movement_pattern_id
    `)
    .or(equipmentFilter + ',equipment_id.is.null') // Include bodyweight options
    .in('exercise_skill_level', skillLevels)
    .eq('is_public', true);

  // Filter by target muscle groups if specified
  if (targetMuscleGroups.length > 0) {
    query = query.in('primary_muscle_id', targetMuscleGroups);
  }

  // Order by preference: compounds first (bar_loaded), then by complexity
  query = query.order('is_bar_loaded', { ascending: false })
                .order('complexity_score', { ascending: true, nullsFirst: false });

  const { data: exercises, error } = await query.limit(exerciseCount * 2); // Get more than needed for variety

  if (error) {
    console.error('Exercise selection error:', error);
    return [];
  }

  if (!exercises || exercises.length === 0) {
    console.log('No exercises found matching criteria');
    return [];
  }

  // Apply selection logic for variety and quality
  const selected = selectBestExercises(exercises, workoutType, exerciseCount);
  
  console.log(`Filtered ${exercises.length} exercises down to ${selected.length}`);
  return selected;
}

function selectBestExercises(
  exercises: ExerciseCandidate[],
  workoutType: string,
  targetCount: number
): ExerciseCandidate[] {
  
  // Prioritize compound movements for strength training
  const compounds = exercises.filter(ex => ex.is_bar_loaded === true);
  const isolations = exercises.filter(ex => ex.is_bar_loaded === false);
  
  const selected: ExerciseCandidate[] = [];
  
  if (workoutType === 'strength') {
    // For strength: prioritize compounds (60-70%)
    const compoundCount = Math.ceil(targetCount * 0.65);
    selected.push(...compounds.slice(0, compoundCount));
    selected.push(...isolations.slice(0, targetCount - selected.length));
  } else {
    // For hypertrophy/mixed: more balanced
    const compoundCount = Math.ceil(targetCount * 0.4);
    selected.push(...compounds.slice(0, compoundCount));
    selected.push(...isolations.slice(0, targetCount - selected.length));
  }

  return selected.slice(0, targetCount);
}

function getSkillLevelsForExperience(experienceLevel: string): string[] {
  switch (experienceLevel) {
    case 'new':
    case 'beginner':
      return ['low'];
    case 'intermediate':
      return ['low', 'medium'];
    case 'advanced':
    case 'expert':
      return ['low', 'medium', 'high'];
    default:
      return ['low', 'medium'];
  }
}

function getExerciseConfiguration(exercise: ExerciseCandidate, workoutType: string, orderIndex: number) {
  const isCompound = exercise.is_bar_loaded === true;
  
  if (workoutType === 'strength') {
    return {
      sets: isCompound ? 5 : 3,
      reps: isCompound ? 5 : 8,
      restSeconds: isCompound ? 180 : 120
    };
  } else if (workoutType === 'hypertrophy') {
    return {
      sets: 3,
      reps: isCompound ? 8 : 12,
      restSeconds: isCompound ? 120 : 90
    };
  } else { // endurance or mixed
    return {
      sets: 3,
      reps: 12,
      restSeconds: 90
    };
  }
}

function mapExperienceTodifficulty(experienceLevel: string): string {
  switch (experienceLevel) {
    case 'new':
    case 'beginner':
      return 'beginner';
    case 'intermediate':
      return 'intermediate';
    case 'advanced':
    case 'expert':
      return 'advanced';
    default:
      return 'beginner';
  }
}

function generateCandidateName(targetMuscleGroups: string[], workoutType: string, index: number): string {
  const muscleNames = targetMuscleGroups.length > 0 ? targetMuscleGroups.join('/') : 'Mixed';
  return `${workoutType} exercise for ${muscleNames} #${index + 1}`;
}

async function runValidationQueries(supabase: any, templateId: string) {
  console.log('Running validation queries...');
  
  // 8.a: Check for missing exercise_id and candidate_id
  const { data: missingIds } = await supabase
    .from('template_exercises')
    .select('id, template_id')
    .eq('template_id', templateId)
    .is('exercise_id', null)
    .is('candidate_id', null);
  
  if (missingIds && missingIds.length > 0) {
    console.error('8.a FAILED: Found template_exercises with neither exercise_id nor candidate_id:', missingIds);
  } else {
    console.log('8.a PASSED: All template_exercises have either exercise_id or candidate_id');
  }
  
  // 8.b: Check for null required fields
  const { data: nullFields } = await supabase
    .from('template_exercises')
    .select('id, template_id')
    .eq('template_id', templateId)
    .or('weight_unit.is.null,attribute_values_json.is.null,default_sets.is.null');
    
  if (nullFields && nullFields.length > 0) {
    console.error('8.b FAILED: Found template_exercises with null required fields:', nullFields);
  } else {
    console.log('8.b PASSED: All template_exercises have required fields');
  }
  
  // 8.c: Count exercises in template
  const { data: exerciseCount } = await supabase
    .from('template_exercises')
    .select('id', { count: 'exact' })
    .eq('template_id', templateId);
    
  console.log(`8.c Template ${templateId} has ${exerciseCount?.length || 0} exercises`);
}