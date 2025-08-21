import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExerciseFormRequest {
  exerciseName: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  commonMistakes?: string[];
  specificConcerns?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { exerciseName, userLevel, commonMistakes, specificConcerns }: ExerciseFormRequest = await req.json();

    const systemPrompt = `You are a certified personal trainer and movement specialist with expertise in exercise biomechanics and injury prevention.

Provide comprehensive form coaching for exercises, including:
1. Proper setup and starting position
2. Step-by-step movement execution
3. Common mistakes to avoid
4. Safety tips and modifications
5. Breathing patterns
6. Progression/regression options

Tailor your advice to the user's experience level: ${userLevel}
Be clear, specific, and safety-focused.`;

    const userPrompt = `Please provide detailed form coaching for: ${exerciseName}

User level: ${userLevel}
${commonMistakes ? `Common mistakes they make: ${commonMistakes.join(', ')}` : ''}
${specificConcerns ? `Specific concerns: ${specificConcerns}` : ''}

I want to learn proper form to maximize effectiveness and prevent injury.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const formCoaching = data.choices[0].message.content;

    // Generate quick tips for mobile display
    const quickTipsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Extract 3-4 key form tips from the coaching advice. Return as JSON array of strings.' 
          },
          { 
            role: 'user', 
            content: `Extract key tips from this coaching: ${formCoaching}` 
          }
        ],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });

    let quickTips = [];
    try {
      const quickTipsData = await quickTipsResponse.json();
      quickTips = JSON.parse(quickTipsData.choices[0].message.content);
    } catch (error) {
      console.error('Error generating quick tips:', error);
      quickTips = [
        "Focus on proper form over heavy weight",
        "Control the movement throughout the full range",
        "Maintain proper breathing pattern",
        "Start with bodyweight or light resistance"
      ];
    }

    return new Response(JSON.stringify({
      exerciseName,
      userLevel,
      formCoaching,
      quickTips,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in form-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      formCoaching: "I'm having trouble providing form guidance right now. Please consult with a qualified trainer or check reputable fitness resources.",
      quickTips: [
        "Always prioritize proper form over heavy weight",
        "Start slowly and focus on the movement pattern",
        "Stop if you feel pain (not to be confused with muscle fatigue)",
        "Consider working with a qualified trainer"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});