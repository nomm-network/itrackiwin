import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProgramGenerationRequest {
  goal: 'recomp' | 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness';
  experience_level: 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced';
  training_days_per_week: number;
  location_type: 'home' | 'gym';
  available_equipment: string[];
  priority_muscle_groups: string[];
  time_per_session_min?: number;
}

export interface AIProgram {
  id: string;
  title: string;
  goal: string;
  weeks: number;
  status: string;
  created_at: string;
  ai_program_weeks: Array<{
    week_number: number;
    ai_program_workouts: Array<{
      day_of_week: number;
      title: string;
      focus_tags: string[];
    }>;
  }>;
}

export const useGenerateProgram = () => {
  return useMutation({
    mutationFn: async (params?: Partial<ProgramGenerationRequest>) => {
      try {
        // Add comprehensive debug logging for request
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'info',
            message: 'Starting AI Program Generation',
            details: {
              fullRequest: params,
              goal: params.goal,
              experienceLevel: params.experience_level,
              trainingDays: params.training_days_per_week,
              locationType: params.location_type,
              equipment: params.available_equipment,
              priorityMuscles: params.priority_muscle_groups,
              sessionDuration: params.time_per_session_min,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              url: window.location.href
            },
            source: 'BroAICoach Request'
          });
        }

        // Ensure we have required parameters or get from fitness profile
        if (!params || Object.keys(params).length === 0) {
          throw new Error('Program generation parameters are required');
        }

        // Prepare the request payload with all required fields
        const payload = {
          goal: params.goal,
          experience_level: params.experience_level,
          training_days_per_week: params.training_days_per_week,
          location_type: params.location_type,
          available_equipment: params.available_equipment || [],
          priority_muscle_groups: params.priority_muscle_groups || [],
          time_per_session_min: params.time_per_session_min || 60,
        };

        // Validate required fields
        const required = ['goal', 'experience_level', 'training_days_per_week', 'location_type'];
        for (const field of required) {
          if (!payload[field as keyof typeof payload]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        console.log('📤 Sending payload to edge function:', payload);

        const { data, error } = await supabase.functions.invoke('bro-ai-coach', {
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Log the comprehensive response for debugging
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'info',
            message: 'Edge Function Complete Response',
            details: {
              rawData: data,
              rawError: error,
              hasData: !!data,
              hasError: !!error,
              dataType: typeof data,
              errorType: typeof error,
              dataKeys: data ? Object.keys(data) : null,
              errorKeys: error ? Object.keys(error) : null,
              originalRequest: params,
              responseTime: new Date().toISOString()
            },
            source: 'BroAICoach Full Response'
          });
        }

        if (error) {
          // Log ultra-detailed error for debugging
          if ((window as any).debugLog) {
            (window as any).debugLog({
              level: 'error',
              message: 'Supabase Edge Function Critical Error',
              details: {
                error: error,
                errorMessage: error.message || 'No message provided',
                errorCode: error.code || 'No code provided',
                errorDetails: error.details || 'No details provided',
                errorHint: error.hint || 'No hint provided',
                errorStatus: error.status || 'No status provided',
                originalRequest: params,
                requestSerialized: JSON.stringify(params),
                timestamp: new Date().toISOString(),
                stackTrace: error.stack || 'No stack trace',
                fullErrorObject: JSON.stringify(error, null, 2)
              },
              source: 'Supabase Edge Function Error'
            });
          }
          throw new Error(`Edge Function Error: ${error.message || error.code || 'Unknown error'}`);
        }

        // Check if response contains error in data
        if (data?.error) {
          if ((window as any).debugLog) {
            (window as any).debugLog({
              level: 'error',
              message: 'Program Generation API Error',
              details: {
                apiError: data.error,
                apiDetails: data.details || 'No API details provided',
                fullApiResponse: data,
                request: params,
                timestamp: new Date().toISOString()
              },
              source: 'BroAICoach API Error'
            });
          }
          throw new Error(`API Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        }

        // Log successful response with all details
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'info',
            message: 'Program Generated Successfully',
            details: {
              programId: data?.program_id,
              programData: data?.program,
              hasProgram: !!data?.program,
              programTitle: data?.program?.title,
              programWeeks: data?.program?.weeks,
              programStatus: data?.program?.status,
              fullResponse: data,
              originalRequest: params,
              successTimestamp: new Date().toISOString()
            },
            source: 'BroAICoach Success'
          });
        }

        return data;
      } catch (error: any) {
        // Final comprehensive error logging
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'error',
            message: 'Program Generation Fatal Exception',
            details: {
              errorMessage: error.message || 'No error message',
              errorName: error.name || 'No error name',
              errorStack: error.stack || 'No stack trace',
              errorCause: error.cause || 'No cause',
              originalRequest: params,
              requestJSON: JSON.stringify(params, null, 2),
              browserInfo: navigator.userAgent,
              timestamp: new Date().toISOString(),
              currentUrl: window.location.href,
              fullErrorObject: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
            },
            source: 'BroAICoach Fatal Exception'
          });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'info',
          message: 'Program Generation Success Callback',
          details: {
            successData: data,
            programCreated: !!data?.program,
            timestamp: new Date().toISOString()
          },
          source: 'BroAICoach Success Callback'
        });
      }
      
      toast({
        title: "Program Generated! 💪",
        description: `Bro AI has created your custom ${data.program?.weeks}-week program.`,
      });
    },
    onError: (error: any) => {
      console.error('Error generating program:', error);
      
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'error',
          message: 'Program Generation Error Callback',
          details: {
            errorInCallback: error,
            errorMessage: error.message,
            errorStack: error.stack,
            timestamp: new Date().toISOString()
          },
          source: 'BroAICoach Error Callback'
        });
      }
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate your program. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useAIPrograms = () => {
  return useQuery({
    queryKey: ['ai-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_programs')
        .select(`
          *,
          ai_program_weeks(
            week_number,
            ai_program_workouts(
              day_of_week,
              title,
              focus_tags
            )
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data as AIProgram[];
    },
  });
};

export const useFitnessProfile = () => {
  return useQuery({
    queryKey: ['fitness-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profile_fitness')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useUpsertFitnessProfile = () => {
  return useMutation({
    mutationFn: async (profile: ProgramGenerationRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profile_fitness')
        .upsert({
          user_id: user.id,
          goal: 'muscle_gain', // Default goal
          training_goal: 'general_fitness', // Default training goal  
          experience_level: profile.experience_level,
          days_per_week: profile.training_days_per_week,
          location_type: profile.location_type,
          available_equipment: profile.available_equipment || [],
          priority_muscle_groups: profile.priority_muscle_groups || [],
          preferred_session_minutes: profile.time_per_session_min || 60
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your fitness profile has been saved.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });
};