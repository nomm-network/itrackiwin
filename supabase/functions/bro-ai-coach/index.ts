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

    // Create supabase client with service role key
    const supabase = createClient(url, serviceRoleKey)

    // Detailed logging for debugging
    console.log('=== BRO AI COACH DEBUG START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    let payload: any
    let rawBody: string = ''
    
    try {
      // Get raw text first for debugging
      rawBody = await req.text()
      console.log('Raw request body:', rawBody)
      console.log('Raw body length:', rawBody.length)
      
      if (!rawBody || rawBody.length === 0) {
        console.log('Empty request body detected')
        return json({ error: 'Request body is required with program parameters' }, 400)
      } else {
        // Try to parse JSON
        payload = JSON.parse(rawBody)
        console.log('Successfully parsed JSON payload:', payload)
      }
    } catch (e) {
      console.error('JSON parsing failed:', e)
      console.error('Raw body that failed to parse:', rawBody)
      return json({ 
        error: 'Invalid JSON body. Could not parse request data.', 
        details: e.message,
        receivedBody: rawBody 
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

    // Call the Postgres function via RPC
    console.log('Calling generate_ai_program RPC with data:', payload)
    const { data, error } = await supabase.rpc('generate_ai_program', {
      goal: payload.goal,
      experience_level: payload.experience_level,
      training_days_per_week: payload.training_days_per_week,
      location_type: payload.location_type,
      available_equipment: payload.available_equipment,
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