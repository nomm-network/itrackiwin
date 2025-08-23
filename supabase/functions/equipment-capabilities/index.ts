import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { 
  EquipmentCapabilitySchema,
  PaginatedResponseSchema,
  ApiResponseSchema,
  type EquipmentCapability,
  type ApiResponse,
  type PaginatedResponse
} from "../_shared/schemas.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`${req.method} /equipment-capabilities`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    const response: ApiResponse = {
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(response), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const equipmentId = url.searchParams.get('equipment_id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    if (equipmentId) {
      // Get capabilities for specific equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          id,
          slug,
          equipment_translations!inner(name, description)
        `)
        .eq('id', equipmentId)
        .single();

      if (equipmentError || !equipment) {
        console.error('Equipment fetch error:', equipmentError);
        const response: ApiResponse = {
          success: false,
          error: 'Equipment not found',
          timestamp: new Date().toISOString()
        };
        return new Response(JSON.stringify(response), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get exercises that use this equipment
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, primary_muscle_id')
        .eq('equipment_id', equipmentId)
        .eq('is_public', true);

      if (exercisesError) {
        console.error('Exercises fetch error:', exercisesError);
        const response: ApiResponse = {
          success: false,
          error: 'Failed to fetch equipment capabilities',
          timestamp: new Date().toISOString()
        };
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get muscle groups
      const muscleGroupIds = [...new Set(exercises.map(ex => ex.primary_muscle_id).filter(Boolean))];
      const { data: muscleGroups } = await supabase
        .from('muscles')
        .select('id, muscle_group_id')
        .in('id', muscleGroupIds);

      const uniqueMuscleGroupIds = [...new Set(muscleGroups?.map(mg => mg.muscle_group_id).filter(Boolean) || [])];

      // Determine difficulty level based on equipment complexity
      const difficultyMapping: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
        'bodyweight': 'beginner',
        'dumbbell': 'beginner',
        'barbell': 'intermediate',
        'machine': 'beginner',
        'cable': 'intermediate',
        'kettlebell': 'intermediate',
        'resistance-band': 'beginner',
      };

      const difficulty = difficultyMapping[equipment.slug] || 'intermediate';

      // Determine space requirement
      const spaceMapping: Record<string, 'minimal' | 'moderate' | 'large'> = {
        'bodyweight': 'minimal',
        'dumbbell': 'minimal',
        'resistance-band': 'minimal',
        'kettlebell': 'moderate',
        'barbell': 'large',
        'machine': 'large',
        'cable': 'large',
      };

      const spaceRequirement = spaceMapping[equipment.slug] || 'moderate';

      // Determine setup time
      const setupTimeMapping: Record<string, number> = {
        'bodyweight': 0,
        'dumbbell': 1,
        'resistance-band': 2,
        'kettlebell': 1,
        'barbell': 5,
        'machine': 2,
        'cable': 3,
      };

      const setupTime = setupTimeMapping[equipment.slug] || 2;

      const capability = EquipmentCapabilitySchema.parse({
        equipment_id: equipment.id,
        name: equipment.equipment_translations[0]?.name || equipment.slug,
        supported_exercises: exercises.map(ex => ex.id),
        muscle_groups: uniqueMuscleGroupIds,
        difficulty_level: difficulty,
        space_requirement: spaceRequirement,
        setup_time_minutes: setupTime,
      });

      const response: ApiResponse<EquipmentCapability> = {
        success: true,
        data: capability,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // List all equipment capabilities with pagination
      const { data: equipment, error: equipmentError, count } = await supabase
        .from('equipment')
        .select(`
          id,
          slug,
          equipment_translations!inner(name, description)
        `, { count: 'exact' })
        .order('slug')
        .range(offset, offset + limit - 1);

      if (equipmentError) {
        console.error('Equipment list error:', equipmentError);
        const response: ApiResponse = {
          success: false,
          error: 'Failed to fetch equipment list',
          timestamp: new Date().toISOString()
        };
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get capabilities for each equipment
      const capabilities: EquipmentCapability[] = [];

      for (const eq of equipment) {
        // Get exercises for this equipment
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id, primary_muscle_id')
          .eq('equipment_id', eq.id)
          .eq('is_public', true);

        // Get muscle groups
        const muscleGroupIds = [...new Set(exercises?.map(ex => ex.primary_muscle_id).filter(Boolean) || [])];
        const { data: muscleGroups } = await supabase
          .from('muscles')
          .select('muscle_group_id')
          .in('id', muscleGroupIds);

        const uniqueMuscleGroupIds = [...new Set(muscleGroups?.map(mg => mg.muscle_group_id).filter(Boolean) || [])];

        const difficultyMapping: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
          'bodyweight': 'beginner',
          'dumbbell': 'beginner',
          'barbell': 'intermediate',
          'machine': 'beginner',
          'cable': 'intermediate',
          'kettlebell': 'intermediate',
          'resistance-band': 'beginner',
        };

        const spaceMapping: Record<string, 'minimal' | 'moderate' | 'large'> = {
          'bodyweight': 'minimal',
          'dumbbell': 'minimal',
          'resistance-band': 'minimal',
          'kettlebell': 'moderate',
          'barbell': 'large',
          'machine': 'large',
          'cable': 'large',
        };

        const setupTimeMapping: Record<string, number> = {
          'bodyweight': 0,
          'dumbbell': 1,
          'resistance-band': 2,
          'kettlebell': 1,
          'barbell': 5,
          'machine': 2,
          'cable': 3,
        };

        capabilities.push(EquipmentCapabilitySchema.parse({
          equipment_id: eq.id,
          name: eq.equipment_translations[0]?.name || eq.slug,
          supported_exercises: exercises?.map(ex => ex.id) || [],
          muscle_groups: uniqueMuscleGroupIds,
          difficulty_level: difficultyMapping[eq.slug] || 'intermediate',
          space_requirement: spaceMapping[eq.slug] || 'moderate',
          setup_time_minutes: setupTimeMapping[eq.slug] || 2,
        }));
      }

      const response: PaginatedResponse<EquipmentCapability> = {
        data: capabilities,
        pagination: {
          page,
          limit,
          total: count || 0,
          has_more: (count || 0) > offset + limit
        }
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Equipment capabilities API error:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});