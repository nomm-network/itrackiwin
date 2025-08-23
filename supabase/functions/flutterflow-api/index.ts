import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/flutterflow-api', '');
    const method = req.method;

    console.log(`FlutterFlow API: ${method} ${path}`);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Route handlers
    switch (path) {
      // User Profile & Onboarding
      case '/profile':
        return await handleProfile(supabase, method, req, userId);
      
      case '/onboarding/fitness-profile':
        return await handleFitnessProfile(supabase, method, req, userId);
      
      case '/onboarding/experience-levels':
        return await handleExperienceLevels(supabase);
      
      case '/onboarding/muscle-priorities':
        return await handleMusclePriorities(supabase, method, req, userId);

      // Workout Templates & Plans
      case '/templates':
        return await handleTemplates(supabase, method, req, userId, page, limit, offset);
      
      case '/templates/generate':
        return await handleGenerateTemplate(supabase, method, req, userId);

      // Active Workout Session
      case '/session/start':
        return await handleStartSession(supabase, method, req, userId);
      
      case '/session/current':
        return await handleCurrentSession(supabase, userId);
      
      case '/session/log-set':
        return await handleLogSet(supabase, method, req, userId);
      
      case '/session/end':
        return await handleEndSession(supabase, method, req, userId);

      // Exercise Management
      case '/exercises':
        return await handleExercises(supabase, method, req, userId, page, limit, offset);
      
      case '/exercises/alternatives':
        return await handleExerciseAlternatives(supabase, method, req, userId);
      
      case '/exercises/search':
        return await handleExerciseSearch(supabase, url.searchParams, page, limit, offset);

      // Gym & Equipment
      case '/gyms/detect':
        return await handleGymDetection(supabase, method, req, userId);
      
      case '/gyms/search':
        return await handleGymSearch(supabase, url.searchParams, page, limit, offset);

      // Progress & Analytics
      case '/progress/summary':
        return await handleProgressSummary(supabase, userId);
      
      case '/progress/exercise-history':
        return await handleExerciseHistory(supabase, userId, url.searchParams, page, limit, offset);

      default:
        return createResponse({ success: false, error: 'Endpoint not found' }, 404);
    }

  } catch (error) {
    console.error('FlutterFlow API Error:', error);
    return createResponse({ 
      success: false, 
      error: 'Internal server error' 
    }, 500);
  }
});

// Response helper
function createResponse<T>(data: ApiResponse<T>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Profile Management
async function handleProfile(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  if (method === 'GET') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, bio, is_public')
      .eq('user_id', userId)
      .single();

    return createResponse({
      success: true,
      data: {
        id: profile?.user_id,
        displayName: profile?.display_name || '',
        avatarUrl: profile?.avatar_url || '',
        bio: profile?.bio || '',
        isPublic: profile?.is_public || false
      }
    });
  }

  if (method === 'PUT') {
    const body = await req.json();
    const { data } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        display_name: body.displayName,
        avatar_url: body.avatarUrl,
        bio: body.bio,
        is_public: body.isPublic
      })
      .select('user_id, display_name, avatar_url, bio, is_public')
      .single();

    return createResponse({
      success: true,
      data: {
        id: data.user_id,
        displayName: data.display_name || '',
        avatarUrl: data.avatar_url || '',
        bio: data.bio || '',
        isPublic: data.is_public
      }
    });
  }

  return createResponse({ success: false, error: 'Method not allowed' }, 405);
}

// Fitness Profile Setup
async function handleFitnessProfile(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  if (method === 'GET') {
    const { data } = await supabase
      .from('user_profile_fitness')
      .select(`
        sex, age, height_cm, weight_kg, activity_level,
        experience_levels(slug, name),
        primary_goal, available_days_per_week,
        session_duration_minutes, injuries
      `)
      .eq('user_id', userId)
      .single();

    return createResponse({
      success: true,
      data: data ? {
        sex: data.sex,
        age: data.age,
        heightCm: data.height_cm,
        weightKg: data.weight_kg,
        activityLevel: data.activity_level,
        experienceLevel: data.experience_levels?.slug || '',
        experienceLevelName: data.experience_levels?.name || '',
        primaryGoal: data.primary_goal,
        availableDaysPerWeek: data.available_days_per_week,
        sessionDurationMinutes: data.session_duration_minutes,
        injuries: data.injuries || []
      } : null
    });
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await req.json();
    
    // Get experience level ID
    const { data: experienceLevel } = await supabase
      .from('experience_levels')
      .select('id')
      .eq('slug', body.experienceLevel)
      .single();

    const { data } = await supabase
      .from('user_profile_fitness')
      .upsert({
        user_id: userId,
        sex: body.sex,
        age: body.age,
        height_cm: body.heightCm,
        weight_kg: body.weightKg,
        activity_level: body.activityLevel,
        experience_level_id: experienceLevel?.id,
        primary_goal: body.primaryGoal,
        available_days_per_week: body.availableDaysPerWeek,
        session_duration_minutes: body.sessionDurationMinutes,
        injuries: body.injuries || []
      })
      .select()
      .single();

    return createResponse({
      success: true,
      data: { id: data.user_id, message: 'Fitness profile saved' }
    });
  }

  return createResponse({ success: false, error: 'Method not allowed' }, 405);
}

// Experience Levels
async function handleExperienceLevels(supabase: any) {
  const { data } = await supabase
    .from('experience_levels')
    .select('slug, name, description, min_training_months')
    .order('min_training_months');

  return createResponse({
    success: true,
    data: data.map((level: any) => ({
      id: level.slug,
      name: level.name,
      description: level.description,
      minTrainingMonths: level.min_training_months
    }))
  });
}

// Muscle Priorities
async function handleMusclePriorities(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  if (method === 'GET') {
    const { data } = await supabase
      .from('user_muscle_priorities')
      .select(`
        muscle_groups(slug, name),
        priority_level
      `)
      .eq('user_id', userId);

    return createResponse({
      success: true,
      data: data.map((item: any) => ({
        muscleGroupId: item.muscle_groups.slug,
        muscleGroupName: item.muscle_groups.name,
        priorityLevel: item.priority_level
      }))
    });
  }

  if (method === 'POST') {
    const body = await req.json();
    const priorities = body.priorities || [];

    // Delete existing priorities
    await supabase
      .from('user_muscle_priorities')
      .delete()
      .eq('user_id', userId);

    // Insert new priorities
    for (const priority of priorities) {
      const { data: muscleGroup } = await supabase
        .from('muscle_groups')
        .select('id')
        .eq('slug', priority.muscleGroupId)
        .single();

      if (muscleGroup) {
        await supabase
          .from('user_muscle_priorities')
          .insert({
            user_id: userId,
            muscle_group_id: muscleGroup.id,
            priority_level: priority.priorityLevel
          });
      }
    }

    return createResponse({
      success: true,
      data: { message: 'Muscle priorities saved' }
    });
  }

  return createResponse({ success: false, error: 'Method not allowed' }, 405);
}

// Workout Templates
async function handleTemplates(supabase: any, method: string, req: Request, userId: string | null, page: number, limit: number, offset: number) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  if (method === 'GET') {
    const { data, count } = await supabase
      .from('workout_templates')
      .select(`
        id, name, description, is_public, created_at,
        template_exercises(
          exercises(id, name, primary_muscle_id),
          default_sets, target_reps
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    return createResponse({
      success: true,
      data: data.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        exerciseCount: template.template_exercises?.length || 0,
        isPublic: template.is_public,
        createdAt: template.created_at,
        exercises: template.template_exercises?.map((te: any) => ({
          id: te.exercises.id,
          name: te.exercises.name,
          defaultSets: te.default_sets,
          targetReps: te.target_reps
        })) || []
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  }

  return createResponse({ success: false, error: 'Method not allowed' }, 405);
}

// Generate Template
async function handleGenerateTemplate(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId || method !== 'POST') {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const body = await req.json();
  
  // Call the workout template generation function
  const { data } = await supabase.functions.invoke('workout-templates', {
    body: {
      user_id: userId,
      target_sessions: body.targetSessions || 3,
      session_duration: body.sessionDuration || 60,
      equipment_available: body.equipmentAvailable || [],
      focus_areas: body.focusAreas || []
    }
  });

  return createResponse({
    success: true,
    data: {
      templateId: data?.template_id,
      name: data?.name || 'Generated Template',
      exerciseCount: data?.exercise_count || 0,
      estimatedDuration: data?.estimated_duration || 60
    }
  });
}

// Active Session Management
async function handleStartSession(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId || method !== 'POST') {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const body = await req.json();
  
  const { data } = await supabase.functions.invoke('fn_start_workout_advanced', {
    body: {
      template_id: body.templateId || null,
      readiness_data: body.readinessData || {}
    }
  });

  return createResponse({
    success: true,
    data: {
      workoutId: data?.workout_id,
      estimatedDuration: data?.estimated_duration_seconds,
      exerciseCount: data?.exercise_count,
      startedAt: data?.started_at
    }
  });
}

async function handleCurrentSession(supabase: any, userId: string | null) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const { data } = await supabase
    .from('workouts')
    .select(`
      id, title, started_at,
      workout_exercises(
        id, order_index,
        exercises(id, name),
        workout_sets(id, set_index, weight, reps, is_completed)
      )
    `)
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return createResponse({
      success: true,
      data: null
    });
  }

  return createResponse({
    success: true,
    data: {
      id: data.id,
      title: data.title,
      startedAt: data.started_at,
      exercises: data.workout_exercises?.map((we: any) => ({
        id: we.id,
        exerciseId: we.exercises.id,
        exerciseName: we.exercises.name,
        orderIndex: we.order_index,
        completedSets: we.workout_sets?.filter((s: any) => s.is_completed).length || 0,
        totalSets: we.workout_sets?.length || 0,
        lastSet: we.workout_sets?.filter((s: any) => s.is_completed).pop() || null
      })) || []
    }
  });
}

async function handleLogSet(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId || method !== 'POST') {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const body = await req.json();
  
  const { data } = await supabase.functions.invoke('set_log', {
    body: {
      workout_exercise_id: body.workoutExerciseId,
      weight: body.weight,
      reps: body.reps,
      rpe: body.rpe,
      notes: body.notes,
      weight_unit: body.weightUnit || 'kg'
    }
  });

  return createResponse({
    success: true,
    data: {
      setId: data?.set_id,
      isNewPR: data?.pr_weight ? true : false,
      lastSet: data?.last_set
    }
  });
}

async function handleEndSession(supabase: any, method: string, req: Request, userId: string | null) {
  if (!userId || method !== 'POST') {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const body = await req.json();
  
  const { data } = await supabase.functions.invoke('end_workout', {
    body: { workout_id: body.workoutId }
  });

  return createResponse({
    success: true,
    data: {
      workoutId: data,
      endedAt: new Date().toISOString()
    }
  });
}

// Exercise Management
async function handleExercises(supabase: any, method: string, req: Request, userId: string | null, page: number, limit: number, offset: number) {
  const { data, count } = await supabase
    .from('exercises')
    .select(`
      id, name, description, image_url, body_part,
      muscle_groups(name),
      equipment(name)
    `, { count: 'exact' })
    .or(`is_public.eq.true,owner_user_id.eq.${userId}`)
    .range(offset, offset + limit - 1)
    .order('popularity_rank', { ascending: true, nullsLast: true });

  return createResponse({
    success: true,
    data: data.map((exercise: any) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description || '',
      imageUrl: exercise.image_url || '',
      bodyPart: exercise.body_part || '',
      muscleGroup: exercise.muscle_groups?.name || '',
      equipment: exercise.equipment?.name || ''
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  });
}

async function handleExerciseAlternatives(supabase: any, method: string, req: Request, userId: string | null) {
  if (method !== 'POST') {
    return createResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  const body = await req.json();
  
  const { data } = await supabase.functions.invoke('exercise-alternatives', {
    body: {
      exercise_id: body.exerciseId,
      reason: body.reason || 'substitute',
      available_equipment: body.availableEquipment || []
    }
  });

  return createResponse({
    success: true,
    data: data?.alternatives?.map((alt: any) => ({
      id: alt.id,
      name: alt.name,
      similarity: alt.similarity,
      reason: alt.reason
    })) || []
  });
}

async function handleExerciseSearch(supabase: any, searchParams: URLSearchParams, page: number, limit: number, offset: number) {
  const query = searchParams.get('q') || '';
  const muscleGroup = searchParams.get('muscle_group');
  const equipment = searchParams.get('equipment');

  let queryBuilder = supabase
    .from('exercises')
    .select(`
      id, name, description, image_url, body_part,
      muscle_groups(name),
      equipment(name)
    `, { count: 'exact' })
    .eq('is_public', true);

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`);
  }

  if (muscleGroup) {
    queryBuilder = queryBuilder.eq('muscle_groups.slug', muscleGroup);
  }

  if (equipment) {
    queryBuilder = queryBuilder.eq('equipment.slug', equipment);
  }

  const { data, count } = await queryBuilder
    .range(offset, offset + limit - 1)
    .order('popularity_rank', { ascending: true, nullsLast: true });

  return createResponse({
    success: true,
    data: data.map((exercise: any) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description || '',
      imageUrl: exercise.image_url || '',
      bodyPart: exercise.body_part || '',
      muscleGroup: exercise.muscle_groups?.name || '',
      equipment: exercise.equipment?.name || ''
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  });
}

// Gym Detection & Search
async function handleGymDetection(supabase: any, method: string, req: Request, userId: string | null) {
  if (method !== 'POST') {
    return createResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  const body = await req.json();
  
  const { data } = await supabase.functions.invoke('detect-gym', {
    body: {
      latitude: body.latitude,
      longitude: body.longitude,
      radius: body.radius || 1000
    }
  });

  return createResponse({
    success: true,
    data: data?.gyms?.map((gym: any) => ({
      id: gym.id,
      name: gym.name,
      address: gym.address,
      distance: gym.distance,
      verified: gym.verified
    })) || []
  });
}

async function handleGymSearch(supabase: any, searchParams: URLSearchParams, page: number, limit: number, offset: number) {
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city');

  let queryBuilder = supabase
    .from('gyms')
    .select('id, name, address, city, verified', { count: 'exact' });

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`);
  }

  if (city) {
    queryBuilder = queryBuilder.ilike('city', `%${city}%`);
  }

  const { data, count } = await queryBuilder
    .range(offset, offset + limit - 1)
    .order('verified', { ascending: false });

  return createResponse({
    success: true,
    data: data.map((gym: any) => ({
      id: gym.id,
      name: gym.name,
      address: gym.address || '',
      city: gym.city || '',
      verified: gym.verified
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  });
}

// Progress & Analytics
async function handleProgressSummary(supabase: any, userId: string | null) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const { data: workoutStats } = await supabase
    .from('workouts')
    .select('id, started_at, ended_at')
    .eq('user_id', userId)
    .not('ended_at', 'is', null);

  const { data: prs } = await supabase
    .from('personal_records')
    .select('kind, value, achieved_at, exercises(name)')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })
    .limit(5);

  return createResponse({
    success: true,
    data: {
      totalWorkouts: workoutStats?.length || 0,
      thisWeekWorkouts: workoutStats?.filter((w: any) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(w.started_at) > weekAgo;
      }).length || 0,
      recentPRs: prs?.map((pr: any) => ({
        exerciseName: pr.exercises.name,
        type: pr.kind,
        value: pr.value,
        achievedAt: pr.achieved_at
      })) || []
    }
  });
}

async function handleExerciseHistory(supabase: any, userId: string | null, searchParams: URLSearchParams, page: number, limit: number, offset: number) {
  if (!userId) {
    return createResponse({ success: false, error: 'Authentication required' }, 401);
  }

  const exerciseId = searchParams.get('exercise_id');
  
  if (!exerciseId) {
    return createResponse({ success: false, error: 'exercise_id required' }, 400);
  }

  const { data, count } = await supabase
    .from('workout_sets')
    .select(`
      weight, reps, rpe, completed_at,
      workout_exercises!inner(
        workouts!inner(user_id, started_at)
      )
    `, { count: 'exact' })
    .eq('workout_exercises.workouts.user_id', userId)
    .eq('workout_exercises.exercise_id', exerciseId)
    .eq('is_completed', true)
    .range(offset, offset + limit - 1)
    .order('completed_at', { ascending: false });

  return createResponse({
    success: true,
    data: data.map((set: any) => ({
      weight: set.weight,
      reps: set.reps,
      rpe: set.rpe,
      completedAt: set.completed_at,
      workoutDate: set.workout_exercises.workouts.started_at
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  });
}