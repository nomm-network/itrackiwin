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

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid auth header')
      return json({ error: 'Authentication required' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create supabase client with the user's token for user context
    const supabase = createClient(url, serviceRoleKey, {
      global: {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    })

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('Auth verification failed', userError)
      return json({ error: 'Invalid authentication token' }, 401)
    }

    console.log('Authenticated user:', user.id)

    let payload: any
    try {
      payload = await req.json()
    } catch (e) {
      console.error('Bad JSON', e)
      return json({ error: 'Invalid JSON body.' }, 400)
    }

    // Minimal schema guard + defaults
    const expected = [
      'goal',
      'experience_level',
      'training_days_per_week',
      'location_type',
      'available_equipment',
      'priority_muscle_groups',
      'time_per_session_min',
    ]
    for (const k of expected) {
      if (!(k in payload)) {
        return json({ error: `Missing field: ${k}` }, 400)
      }
    }

    // Ensure arrays are arrays
    payload.available_equipment ||= []
    payload.priority_muscle_groups ||= []

    console.log('Incoming payload', payload)

    // Call the Postgres function via RPC with user_id
    const { data, error } = await supabase.rpc('generate_ai_program', {
      goal: payload.goal,
      experience_level: payload.experience_level,
      training_days_per_week: payload.training_days_per_week,
      location_type: payload.location_type,
      available_equipment: payload.available_equipment,
      priority_muscle_groups: payload.priority_muscle_groups,
      time_per_session_min: payload.time_per_session_min,
      user_id: user.id,
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