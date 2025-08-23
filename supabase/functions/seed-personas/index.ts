import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action } = await req.json()

    if (action === 'seed') {
      // Create demo users and their complete profiles
      const personas = await createPersonas(supabaseClient)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          personas,
          message: 'Demo personas created successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'cleanup') {
      await cleanupPersonas(supabaseClient)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Demo personas cleaned up successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function createPersonas(supabase: any) {
  const personas = []

  // Get some exercises for templates
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, slug')
    .eq('is_public', true)
    .limit(20)

  const exerciseMap = new Map()
  exercises?.forEach((ex: any) => {
    exerciseMap.set(ex.slug, ex.id)
  })

  // 1. Newbie Maria
  const maria = await createPersona(supabase, {
    email: 'maria.demo@example.com',
    password: 'DemoPass123!',
    profile: {
      display_name: 'Newbie Maria',
      bio: 'Just starting my fitness journey! Focusing on glute development with minimal equipment at home.',
    },
    fitnessProfile: {
      experience_level: 'new',
      sex: 'female',
      goal: 'muscle_gain',
      training_goal: 'aesthetic_focus',
      days_per_week: 3,
      preferred_session_minutes: 45,
      height_cm: 165,
      bodyweight: 58
    },
    templates: [
      {
        name: 'Lower Body Focus',
        exercises: [
          { slug: 'squat', sets: 3, reps: 12 },
          { slug: 'glute-bridge', sets: 3, reps: 15 },
          { slug: 'lunge', sets: 3, reps: 10 },
          { slug: 'calf-raise', sets: 3, reps: 20 }
        ]
      },
      {
        name: 'Upper Body Basics',
        exercises: [
          { slug: 'push-up', sets: 3, reps: 8 },
          { slug: 'triceps-dip', sets: 3, reps: 10 },
          { slug: 'plank', sets: 3, reps: 30 }
        ]
      }
    ]
  }, exerciseMap)
  personas.push(maria)

  // 2. Returning Alex
  const alex = await createPersona(supabase, {
    email: 'alex.demo@example.com',
    password: 'DemoPass123!',
    profile: {
      display_name: 'Returning Alex',
      bio: 'Getting back into lifting after a break. Love chest and shoulder workouts with full gym access.',
    },
    fitnessProfile: {
      experience_level: 'returning',
      sex: 'male',
      goal: 'strength',
      training_goal: 'strength_focus',
      days_per_week: 4,
      preferred_session_minutes: 60,
      height_cm: 178,
      bodyweight: 75
    },
    templates: [
      {
        name: 'Push Day Power',
        exercises: [
          { slug: 'barbell-bench-press', sets: 4, reps: 6 },
          { slug: 'overhead-press', sets: 4, reps: 8 },
          { slug: 'incline-dumbbell-press', sets: 3, reps: 10 },
          { slug: 'lateral-raise', sets: 3, reps: 12 },
          { slug: 'triceps-pushdown', sets: 3, reps: 12 }
        ]
      },
      {
        name: 'Pull Day',
        exercises: [
          { slug: 'pull-up', sets: 4, reps: 8 },
          { slug: 'barbell-row', sets: 4, reps: 8 },
          { slug: 'lat-pulldown', sets: 3, reps: 10 },
          { slug: 'barbell-curl', sets: 3, reps: 12 }
        ]
      }
    ]
  }, exerciseMap)
  personas.push(alex)

  // 3. Advanced Lee
  const lee = await createPersona(supabase, {
    email: 'lee.demo@example.com',
    password: 'DemoPass123!',
    profile: {
      display_name: 'Advanced Lee',
      bio: 'Experienced lifter with a balanced approach. Training 5x/week in my garage gym setup.',
    },
    fitnessProfile: {
      experience_level: 'advanced',
      sex: 'other',
      goal: 'strength',
      training_goal: 'balanced_development',
      days_per_week: 5,
      preferred_session_minutes: 75,
      height_cm: 172,
      bodyweight: 68
    },
    templates: [
      {
        name: 'Heavy Squat Day',
        exercises: [
          { slug: 'squat', sets: 5, reps: 3 },
          { slug: 'romanian-deadlift', sets: 4, reps: 6 },
          { slug: 'bulgarian-split-squat', sets: 3, reps: 8 },
          { slug: 'leg-curl', sets: 3, reps: 12 }
        ]
      },
      {
        name: 'Heavy Bench Day',
        exercises: [
          { slug: 'barbell-bench-press', sets: 5, reps: 3 },
          { slug: 'incline-dumbbell-press', sets: 4, reps: 6 },
          { slug: 'barbell-row', sets: 4, reps: 6 },
          { slug: 'overhead-press', sets: 3, reps: 8 }
        ]
      },
      {
        name: 'Deadlift & Accessories',
        exercises: [
          { slug: 'deadlift', sets: 5, reps: 3 },
          { slug: 'pull-up', sets: 4, reps: 8 },
          { slug: 'barbell-row', sets: 3, reps: 10 },
          { slug: 'farmer-walk', sets: 3, reps: 30 }
        ]
      }
    ]
  }, exerciseMap)
  personas.push(lee)

  // Create some workout logs for each persona
  for (const persona of personas) {
    await createWorkoutLogs(supabase, persona)
  }

  return personas
}

async function createPersona(supabase: any, config: any, exerciseMap: Map<string, string>) {
  // Create user
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: config.email,
    password: config.password,
    email_confirm: true
  })

  if (userError) throw userError

  const userId = user.user.id

  // Create profile
  await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      display_name: config.profile.display_name,
      bio: config.profile.bio,
      is_public: true
    })

  // Create fitness profile
  await supabase
    .from('user_profile_fitness')
    .insert({
      user_id: userId,
      ...config.fitnessProfile
    })

  // Create workout templates
  const templates = []
  for (const templateConfig of config.templates) {
    const { data: template } = await supabase
      .from('workout_templates')
      .insert({
        user_id: userId,
        name: templateConfig.name,
        notes: `Demo template for ${config.profile.display_name}`
      })
      .select()
      .single()

    // Add exercises to template
    let orderIndex = 1
    for (const exerciseConfig of templateConfig.exercises) {
      const exerciseId = exerciseMap.get(exerciseConfig.slug)
      if (exerciseId) {
        await supabase
          .from('template_exercises')
          .insert({
            template_id: template.id,
            exercise_id: exerciseId,
            order_index: orderIndex++,
            default_sets: exerciseConfig.sets,
            target_reps: exerciseConfig.reps,
            weight_unit: 'kg'
          })
      }
    }

    templates.push(template)
  }

  return {
    user_id: userId,
    email: config.email,
    profile: config.profile,
    fitness_profile: config.fitnessProfile,
    templates
  }
}

async function createWorkoutLogs(supabase: any, persona: any) {
  // Create 3-5 completed workouts over the past 2 weeks
  const now = new Date()
  const workoutDates = [
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),  // 1 week ago
    new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),  // 4 days ago
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),  // yesterday
  ]

  for (let i = 0; i < Math.min(workoutDates.length, persona.templates.length); i++) {
    const template = persona.templates[i % persona.templates.length]
    const workoutDate = workoutDates[i]

    // Create workout
    const { data: workout } = await supabase
      .from('workouts')
      .insert({
        user_id: persona.user_id,
        title: template.name,
        started_at: workoutDate,
        ended_at: new Date(workoutDate.getTime() + 45 * 60 * 1000), // 45 min later
        notes: 'Demo workout session'
      })
      .select()
      .single()

    // Get template exercises
    const { data: templateExercises } = await supabase
      .from('template_exercises')
      .select('exercise_id, default_sets, target_reps, order_index')
      .eq('template_id', template.id)
      .order('order_index')

    // Add exercises to workout
    for (const templateEx of templateExercises || []) {
      const { data: workoutExercise } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workout.id,
          exercise_id: templateEx.exercise_id,
          order_index: templateEx.order_index
        })
        .select()
        .single()

      // Add sets with realistic progression
      const baseWeight = getBaseWeight(persona.fitness_profile.experience_level)
      for (let setIndex = 1; setIndex <= templateEx.default_sets; setIndex++) {
        const weight = baseWeight + (i * 2.5) // Progressive overload
        const reps = templateEx.target_reps + Math.floor(Math.random() * 3) - 1 // ±1 rep variation

        await supabase
          .from('workout_sets')
          .insert({
            workout_exercise_id: workoutExercise.id,
            set_index: setIndex,
            set_kind: 'normal',
            weight: weight,
            reps: Math.max(1, reps),
            weight_unit: 'kg',
            is_completed: true,
            completed_at: new Date(workoutDate.getTime() + setIndex * 3 * 60 * 1000) // 3 min between sets
          })
      }
    }
  }
}

function getBaseWeight(experienceLevel: string): number {
  switch (experienceLevel) {
    case 'new': return 15
    case 'returning': return 40
    case 'advanced': return 80
    default: return 30
  }
}

async function cleanupPersonas(supabase: any) {
  const demoEmails = [
    'maria.demo@example.com',
    'alex.demo@example.com', 
    'lee.demo@example.com'
  ]

  for (const email of demoEmails) {
    try {
      // Get user by email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users?.find((u: any) => u.email === email)
      
      if (user) {
        // Delete user (cascading deletes will handle related data)
        await supabase.auth.admin.deleteUser(user.id)
      }
    } catch (error) {
      console.error(`Error cleaning up user ${email}:`, error)
    }
  }
}