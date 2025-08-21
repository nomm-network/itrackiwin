import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkoutAnalysisRequest {
  userId: string;
  workoutHistory: any[];
  userGoals?: string[];
  preferences?: {
    difficulty?: string;
    duration?: number;
    equipment?: string[];
  };
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

    const { userId, workoutHistory, userGoals, preferences }: WorkoutAnalysisRequest = await req.json();

    // Analyze workout patterns and performance
    const workoutAnalysis = analyzeWorkoutPatterns(workoutHistory);
    
    const systemPrompt = `You are an expert fitness coach AI with deep knowledge of exercise science, progressive overload, and personalized training. 

Analyze the user's workout data and provide intelligent coaching recommendations:

USER CONTEXT:
- User ID: ${userId}
- Goals: ${userGoals?.join(', ') || 'General fitness'}
- Preferences: ${JSON.stringify(preferences || {})}

WORKOUT ANALYSIS:
- Total workouts: ${workoutHistory.length}
- Recent trends: ${workoutAnalysis.trends}
- Strengths: ${workoutAnalysis.strengths}
- Areas for improvement: ${workoutAnalysis.improvements}

Provide a comprehensive coaching analysis with:
1. Performance assessment (what's going well, what needs work)
2. Specific exercise recommendations
3. Progressive overload suggestions
4. Recovery and rest recommendations
5. Motivational insights and next steps

Be encouraging but honest about areas that need improvement. Use specific data points when possible.`;

    const userPrompt = `Please analyze my workout data and provide personalized coaching recommendations. Here's my recent workout history:

${workoutHistory.map((workout, i) => `
Workout ${i + 1} (${workout.started_at}):
- Duration: ${workout.duration || 'N/A'}
- Exercises: ${workout.exercises?.length || 0}
- Notes: ${workout.notes || 'None'}
`).join('\n')}

Focus on actionable insights I can use to improve my training.`;

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
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const coaching = data.choices[0].message.content;

    // Generate specific workout recommendations
    const workoutRecommendation = await generateWorkoutRecommendation(
      openAIApiKey, 
      workoutAnalysis, 
      preferences
    );

    return new Response(JSON.stringify({
      coaching,
      workoutRecommendation,
      analysis: workoutAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      coaching: "I'm having trouble analyzing your data right now. Please try again later.",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeWorkoutPatterns(workouts: any[]) {
  if (!workouts.length) {
    return {
      trends: "No workout data available",
      strengths: "Getting started is the first step!",
      improvements: "Consistency will be key to your success"
    };
  }

  const recentWorkouts = workouts.slice(-5);
  const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
  const avgExercisesPerWorkout = totalExercises / workouts.length;

  // Analyze workout frequency
  const workoutDates = workouts.map(w => new Date(w.started_at));
  const daysBetween = workoutDates.length > 1 ? 
    (workoutDates[0].getTime() - workoutDates[workoutDates.length - 1].getTime()) / (1000 * 60 * 60 * 24) / (workouts.length - 1) : 0;

  let trends = "";
  let strengths = "";
  let improvements = "";

  if (daysBetween > 0) {
    const frequency = Math.round(7 / daysBetween * 10) / 10;
    trends = `Working out ${frequency} times per week on average`;
    
    if (frequency >= 3) {
      strengths = "Excellent workout consistency";
    } else if (frequency >= 2) {
      strengths = "Good workout frequency";
      improvements = "Consider adding one more session per week";
    } else {
      improvements = "Aim for at least 2-3 workouts per week for better results";
    }
  }

  if (avgExercisesPerWorkout >= 5) {
    strengths += (strengths ? ", " : "") + "Good exercise variety per session";
  } else {
    improvements += (improvements ? ", " : "") + "Try adding 1-2 more exercises per workout";
  }

  return { trends, strengths, improvements };
}

async function generateWorkoutRecommendation(apiKey: string, analysis: any, preferences: any) {
  const prompt = `Based on this analysis: ${JSON.stringify(analysis)} and preferences: ${JSON.stringify(preferences)}, 
  create a specific workout recommendation with:
  1. 4-6 exercises with sets/reps
  2. Estimated duration
  3. Focus areas
  4. Progression tips
  
  Format as JSON with exercises array containing: name, sets, reps, notes`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a fitness expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating workout recommendation:', error);
    return {
      exercises: [
        { name: "Push-ups", sets: 3, reps: "8-12", notes: "Great for upper body strength" },
        { name: "Squats", sets: 3, reps: "12-15", notes: "Focus on proper form" },
        { name: "Plank", sets: 3, reps: "30-60 seconds", notes: "Core stability" }
      ],
      duration: "20-30 minutes",
      focus: "Full body strength",
      progression: "Increase reps by 1-2 each week"
    };
  }
}