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

    // Create supabase client with user's auth token for RPC calls
    const supabase = createClient(url, serviceRoleKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

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

    // Validate required fields
    const required = ['goal', 'experience_level', 'training_days_per_week', 'location_type']
    for (const field of required) {
      if (!(field in payload)) {
        console.error(`Missing required field: ${field}`)
        return json({ error: `Missing required field: ${field}` }, 400)
      }
    }

    // Ensure arrays are properly set
    payload.available_equipment = payload.available_equipment || []
    payload.priority_muscle_groups = payload.priority_muscle_groups || []

    console.log('Validated payload:', payload)

    // Map equipment UUIDs to slugs
    let equipmentSlugs = []
    if (payload.available_equipment && payload.available_equipment.length > 0) {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('slug')
        .in('id', payload.available_equipment)
      
      if (equipmentError) {
        console.error('Equipment lookup error:', equipmentError)
        return json({ error: 'Failed to resolve equipment', details: equipmentError }, 500)
      }
      
      equipmentSlugs = equipmentData?.map(e => e.slug) || []
    }

    // Map goal values to expected format
    const goalMapping = {
      'muscle_gain': 'muscle_gain',
      'fat_loss': 'fat_loss', 
      'strength': 'strength',
      'recomp': 'muscle_gain', // Map recomp to muscle_gain for now
      'endurance': 'endurance',
      'general_fitness': 'general_fitness'
    }

    const mappedGoal = goalMapping[payload.goal] || 'muscle_gain'

    // Call the Postgres function via RPC
    console.log('Calling generate_ai_program RPC with mapped data:', {
      goal: mappedGoal,
      experience_level: payload.experience_level,
      training_days_per_week: payload.training_days_per_week,
      location_type: payload.location_type,
      available_equipment: equipmentSlugs,
      priority_muscle_groups: payload.priority_muscle_groups,
      time_per_session_min: payload.time_per_session_min,
    })
    
    const { data, error } = await supabase.rpc('generate_ai_program', {
      goal: mappedGoal,
      experience_level: payload.experience_level,
      training_days_per_week: payload.training_days_per_week,
      location_type: payload.location_type,
      available_equipment: equipmentSlugs,
      priority_muscle_groups: payload.priority_muscle_groups,
      time_per_session_min: payload.time_per_session_min,
    })

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