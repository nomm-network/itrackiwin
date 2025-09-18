// supabase/functions/bro-ai-coach/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceRoleKey) {
      console.error('Missing env vars', { hasUrl: !!url, hasKey: !!serviceRoleKey })
      return json({ error: 'Server not configured (env missing).' }, 500)
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      return json({ error: 'Authorization required' }, 401)
    }

    // Create supabase client with service role key but preserve auth context
    const supabase = createClient(url, serviceRoleKey)

    // Detailed logging for debugging
    console.log('=== BRO AI COACH DEBUG START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    let payload: any
    
    try {
      payload = await req.json()
      console.log('Successfully parsed JSON payload:', payload)
      
      if (!payload || Object.keys(payload).length === 0) {
        console.log('Empty request body detected')
        return json({ error: 'Request body is required with program parameters' }, 400)
      }
    } catch (e) {
      console.error('JSON parsing failed:', e)
      return json({ 
        error: 'Invalid JSON body. Could not parse request data.', 
        details: e.message
      }, 400)
    }

    // Validate required fields and their types
    const required = ['goal', 'experience_level', 'training_days_per_week', 'location_type']
    for (const field of required) {
      if (!(field in payload) || payload[field] === null || payload[field] === undefined) {
        console.error(`Missing required field: ${field}`)
        return json({ error: `Missing required field: ${field}` }, 400)
      }
    }
    
    // Validate field types
    if (typeof payload.goal !== 'string') {
      console.error(`Invalid goal type: ${typeof payload.goal}. Must be string`)
      return json({ error: `Invalid goal type. Must be string` }, 400)
    }
    
    if (typeof payload.experience_level !== 'string') {
      console.error(`Invalid experience_level type: ${typeof payload.experience_level}. Must be string`)
      return json({ error: `Invalid experience_level type. Must be string` }, 400)
    }
    
    if (typeof payload.location_type !== 'string') {
      console.error(`Invalid location_type type: ${typeof payload.location_type}. Must be string`)
      return json({ error: `Invalid location_type type. Must be string` }, 400)
    }
    
    if (!Array.isArray(payload.available_equipment)) {
      console.error(`Invalid available_equipment type: ${typeof payload.available_equipment}. Must be array`)
      return json({ error: `Invalid available_equipment type. Must be array` }, 400)
    }
    
    if (!Array.isArray(payload.priority_muscle_groups)) {
      console.error(`Invalid priority_muscle_groups type: ${typeof payload.priority_muscle_groups}. Must be array`)
      return json({ error: `Invalid priority_muscle_groups type. Must be array` }, 400)
    }

    // Ensure arrays are properly set and validate types
    payload.available_equipment = payload.available_equipment || []
    payload.priority_muscle_groups = payload.priority_muscle_groups || []
    
    // Validate training_days_per_week is a number
    if (typeof payload.training_days_per_week !== 'number' || payload.training_days_per_week < 1 || payload.training_days_per_week > 7) {
      console.error(`Invalid training_days_per_week: ${payload.training_days_per_week}. Must be number 1-7`)
      return json({ error: `Invalid training_days_per_week: ${payload.training_days_per_week}. Must be number 1-7` }, 400)
    }
    
    // Validate time_per_session_min if provided
    if (payload.time_per_session_min !== undefined && (typeof payload.time_per_session_min !== 'number' || payload.time_per_session_min < 15 || payload.time_per_session_min > 300)) {
      console.error(`Invalid time_per_session_min: ${payload.time_per_session_min}. Must be number 15-300`)
      return json({ error: `Invalid time_per_session_min: ${payload.time_per_session_min}. Must be number 15-300` }, 400)
    }

    console.log('Validated payload:', payload)

    // Map equipment UUIDs to slugs - CRITICAL VALIDATION
    let equipmentSlugs = []
    if (payload.available_equipment && payload.available_equipment.length > 0) {
      console.log('Looking up equipment for UUIDs:', payload.available_equipment)
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('slug')
        .in('id', payload.available_equipment)
      
      if (equipmentError) {
        console.error('Equipment lookup error:', equipmentError)
        return json({ error: 'Failed to resolve equipment', details: equipmentError }, 500)
      }
      
      equipmentSlugs = equipmentData?.map(e => e.slug) || []
      console.log('Mapped equipment UUIDs to slugs:', equipmentSlugs)
      
      // Validate we got slugs for all UUIDs
      if (equipmentSlugs.length !== payload.available_equipment.length) {
        console.error(`Equipment mapping failed. Expected ${payload.available_equipment.length} slugs, got ${equipmentSlugs.length}`)
        return json({ error: `Some equipment IDs not found in database. Expected ${payload.available_equipment.length}, found ${equipmentSlugs.length}` }, 400)
      }
    }

    // Map goal values to match DB enum exactly
    const goalMapping = {
      'muscle_gain': 'muscle_gain',
      'fat_loss': 'fat_loss', 
      'strength': 'strength',
      'recomp': 'recomp',
      'endurance': 'general_fitness', // Map endurance to general_fitness
      'general_fitness': 'general_fitness'
    }

    const mappedGoal = goalMapping[payload.goal]
    if (!mappedGoal) {
      console.error(`Invalid goal: ${payload.goal}. Valid values: muscle_gain, fat_loss, strength, recomp, general_fitness`)
      return json({ error: `Invalid goal: ${payload.goal}. Valid values: muscle_gain, fat_loss, strength, recomp, general_fitness` }, 400)
    }

    // Validate experience_level
    const validExperienceLevels = ['new', 'returning', 'intermediate', 'advanced', 'very_experienced']
    if (!validExperienceLevels.includes(payload.experience_level)) {
      console.error(`Invalid experience_level: ${payload.experience_level}. Valid values: ${validExperienceLevels.join(', ')}`)
      return json({ error: `Invalid experience_level: ${payload.experience_level}. Valid values: ${validExperienceLevels.join(', ')}` }, 400)
    }

    // Validate location_type
    const validLocationTypes = ['home', 'gym']
    if (!validLocationTypes.includes(payload.location_type)) {
      console.error(`Invalid location_type: ${payload.location_type}. Valid values: ${validLocationTypes.join(', ')}`)
      return json({ error: `Invalid location_type: ${payload.location_type}. Valid values: ${validLocationTypes.join(', ')}` }, 400)
    }

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '')
    
    // Create a user-context client for RPC calls that need auth
    const userClient = createClient(url, serviceRoleKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    })

    // Call the Postgres function via RPC with user context
    console.log('=== FINAL RPC CALL PARAMETERS ===')
    console.log('Original goal:', payload.goal)
    console.log('Mapped goal:', mappedGoal)
    console.log('Experience level:', payload.experience_level)
    console.log('Location type:', payload.location_type)
    console.log('Equipment slugs:', equipmentSlugs)
    console.log('Priority muscle groups:', payload.priority_muscle_groups)
    console.log('Time per session:', payload.time_per_session_min)
    console.log('Training days per week:', payload.training_days_per_week)
    
    const rpcParams = {
      p_goal: mappedGoal,
      p_experience_level: payload.experience_level,
      p_training_days_per_week: payload.training_days_per_week,
      p_location_type: payload.location_type,
      p_available_equipment: equipmentSlugs,
      p_priority_muscle_groups: payload.priority_muscle_groups,
      p_time_per_session_min: payload.time_per_session_min,
    }
    
    console.log('=== ACTUAL RPC PARAMETERS ===')
    console.log(JSON.stringify(rpcParams, null, 2))
    
    const { data, error } = await userClient.rpc('generate_ai_program', rpcParams)

    if (error) {
      console.error('RPC error', error)
      return json({ error: 'Program generation failed at DB layer.', details: error }, 500)
    }

    console.log('RPC success', data)
    return json({ ok: true, data }, 200)
  } catch (e) {
    // Catch absolutely everything and make sure a status code is returned
    console.error('Fatal exception', e)
    return json(
      {
        error: 'Edge Function crashed.',
        // Avoid leaking stack in production if you prefer:
        details: String(e?.message ?? e),
      },
      500
    )
  }
})