import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProgressAnalysisRequest {
  userId: string;
  exerciseData: {
    exerciseId: string;
    exerciseName: string;
    recentSets: Array<{
      weight: number;
      reps: number;
      date: string;
      rpe?: number;
    }>;
    personalRecords: Array<{
      kind: string;
      value: number;
      achievedAt: string;
    }>;
  };
  timeframe: '1week' | '1month' | '3months' | '6months';
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

    const { userId, exerciseData, timeframe }: ProgressAnalysisRequest = await req.json();

    // Analyze progress patterns
    const progressAnalysis = analyzeProgressData(exerciseData, timeframe);

    const systemPrompt = `You are an expert strength and conditioning coach specializing in progress analysis and periodization.

Analyze the user's exercise progress data and provide:
1. Progress trend assessment (improving, plateauing, declining)
2. Specific insights about strength gains
3. Recommendations for breaking plateaus
4. Periodization suggestions
5. Motivation and encouragement based on actual progress

Use exercise science principles and be specific about numbers when relevant.
Be encouraging but realistic about progress expectations.`;

    const userPrompt = `Analyze my progress for ${exerciseData.exerciseName} over the last ${timeframe}:

RECENT PERFORMANCE:
${exerciseData.recentSets.map((set, i) => 
  `${set.date}: ${set.weight}kg x ${set.reps} reps${set.rpe ? ` (RPE: ${set.rpe})` : ''}`
).join('\n')}

PERSONAL RECORDS:
${exerciseData.personalRecords.map(pr => 
  `${pr.kind}: ${pr.value}${pr.kind === 'reps' ? ' reps' : 'kg'} (${pr.achievedAt})`
).join('\n')}

ANALYSIS SUMMARY:
- Trend: ${progressAnalysis.trend}
- Volume change: ${progressAnalysis.volumeChange}%
- Strength change: ${progressAnalysis.strengthChange}%
- Consistency: ${progressAnalysis.consistency}

Please provide detailed insights and actionable recommendations.`;

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
        max_tokens: 1000,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    // Generate specific recommendations
    const recommendations = await generateProgressRecommendations(
      openAIApiKey, 
      progressAnalysis, 
      exerciseData.exerciseName
    );

    return new Response(JSON.stringify({
      exerciseName: exerciseData.exerciseName,
      timeframe,
      analysis: progressAnalysis,
      insights,
      recommendations,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in progress-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      insights: "I'm having trouble analyzing your progress right now. Keep tracking your workouts - consistency is key!",
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeProgressData(exerciseData: any, timeframe: string) {
  const { recentSets } = exerciseData;
  
  if (recentSets.length < 2) {
    return {
      trend: "insufficient_data",
      volumeChange: 0,
      strengthChange: 0,
      consistency: "needs_more_data"
    };
  }

  // Sort by date
  const sortedSets = recentSets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate volume (weight × reps)
  const volumes = sortedSets.map(set => set.weight * set.reps);
  const firstHalf = volumes.slice(0, Math.floor(volumes.length / 2));
  const secondHalf = volumes.slice(Math.floor(volumes.length / 2));
  
  const avgVolumeFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const avgVolumeSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
  const volumeChange = ((avgVolumeSecond - avgVolumeFirst) / avgVolumeFirst) * 100;

  // Calculate strength change (max weight)
  const weights = sortedSets.map(set => set.weight);
  const maxWeightFirst = Math.max(...weights.slice(0, Math.floor(weights.length / 2)));
  const maxWeightSecond = Math.max(...weights.slice(Math.floor(weights.length / 2)));
  const strengthChange = ((maxWeightSecond - maxWeightFirst) / maxWeightFirst) * 100;

  // Determine trend
  let trend = "stable";
  if (volumeChange > 5 && strengthChange > 0) {
    trend = "improving";
  } else if (volumeChange < -5 || strengthChange < -5) {
    trend = "declining";
  } else if (Math.abs(volumeChange) < 2 && Math.abs(strengthChange) < 2) {
    trend = "plateauing";
  }

  // Assess consistency
  const daysBetweenWorkouts = [];
  for (let i = 1; i < sortedSets.length; i++) {
    const diff = (new Date(sortedSets[i].date).getTime() - new Date(sortedSets[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
    daysBetweenWorkouts.push(diff);
  }
  const avgDaysBetween = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
  
  let consistency = "good";
  if (avgDaysBetween > 10) {
    consistency = "inconsistent";
  } else if (avgDaysBetween < 3) {
    consistency = "frequent";
  }

  return {
    trend,
    volumeChange: Math.round(volumeChange * 10) / 10,
    strengthChange: Math.round(strengthChange * 10) / 10,
    consistency
  };
}

async function generateProgressRecommendations(apiKey: string, analysis: any, exerciseName: string) {
  const prompt = `Based on this progress analysis for ${exerciseName}: 
  Trend: ${analysis.trend}
  Volume change: ${analysis.volumeChange}%
  Strength change: ${analysis.strengthChange}%
  Consistency: ${analysis.consistency}
  
  Provide 3-5 specific, actionable recommendations. Return as JSON array of objects with 'action' and 'reason' fields.`;

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
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      { action: "Focus on progressive overload", reason: "Gradually increase weight or reps each session" },
      { action: "Track your rest periods", reason: "Consistent rest ensures optimal performance" },
      { action: "Monitor your form", reason: "Quality reps are more important than quantity" }
    ];
  }
}