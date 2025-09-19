import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CATEGORY_KEYWORDS: Record<string, RegExp[]> = {
  health: [/workout|gym|protein|sleep|steps|calories|diet|fitness|exercise|muscle|weight|nutrition/i],
  wealth: [/money|budget|savings|invest|finance|income|debt|financial|portfolio|stocks|crypto/i],
  productivity: [/focus|time|task|plan|todo|pomodoro|deep work|organize|efficiency|goals/i],
  spirituality: [/meditat|gratitude|mindfulness|prayer|spirit|zen|chakra|enlighten|peace/i],
  purpose: [/purpose|meaning|mission|values|career direction|life goal|passion|calling/i],
  relationships: [/partner|dating|relationship|friends|family|communication|love|social|connect/i],
};

function detectIntent(msg: string): string | "general" {
  for (const [slug, patterns] of Object.entries(CATEGORY_KEYWORDS)) {
    if (patterns.some((re) => re.test(msg))) return slug;
  }
  return "general";
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, message } = await req.json();

    if (!user_id || !message) {
      return new Response(JSON.stringify({ error: "Missing user_id or message" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const intent = detectIntent(message);

    if (intent === "general") {
      // Atlas speaks
      return new Response(JSON.stringify({
        role: "atlas",
        text: "I've got you. Do you want help with Health, Wealth, or Productivity right now?",
        handoff: null
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // handoff: router tells client to navigate to category coach tab
    return new Response(JSON.stringify({
      role: "router",
      text: `This sounds like ${intent}. I'll hand you to the ${intent} coach.`,
      handoff: { category_slug: intent }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in router-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});