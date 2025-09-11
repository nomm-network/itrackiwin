import { supabase } from '@/integrations/supabase/client';
import { kgToLb, lbToKg } from '@/lib/equipment/convert';

export type LoadingContext = {
  unit: "kg" | "lb";
  barProfileId: string | null;
  plateProfileId: string | null;
  dumbbellProfileId: string | null;
  stackProfileId: string | null;
  minIncKg: number;
  minIncLb: number;
  gymId?: string | null;
};

export async function resolveLoadingContext(userId?: string): Promise<LoadingContext> {
  if (!userId) {
    // Safe fallback for unauthenticated users
    return { 
      unit: "kg", 
      barProfileId: null, 
      plateProfileId: null, 
      dumbbellProfileId: null, 
      stackProfileId: null, 
      minIncKg: 1.25, 
      minIncLb: 2.5,
      gymId: null
    };
  }

  try {
    // For now, use global defaults since the full gym/user override system 
    // is still being built. This gives us the foundation.
    const { data: globalPlates } = await supabase
      .from('plate_profiles')
      .select('*')
      .eq('is_active', true)
      .single();

    const { data: globalDumbbells } = await supabase
      .from('dumbbell_sets')
      .select('*')
      .eq('is_active', true)
      .single();

    return {
      unit: "kg", // Default to kg for now
      barProfileId: null,
      plateProfileId: globalPlates?.id || null,
      dumbbellProfileId: globalDumbbells?.id || null,
      stackProfileId: null,
      minIncKg: 1.25,
      minIncLb: 2.5,
      gymId: null
    };
  } catch (error) {
    console.error('Error resolving loading context:', error);
    // Return safe fallback
    return { 
      unit: "kg", 
      barProfileId: null, 
      plateProfileId: null, 
      dumbbellProfileId: null, 
      stackProfileId: null, 
      minIncKg: 1.25, 
      minIncLb: 2.5,
      gymId: null
    };
  }
}

// Cache for loading context per user session
const loadingContextCache = new Map<string, { context: LoadingContext; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedLoadingContext(userId?: string): Promise<LoadingContext> {
  if (!userId) return resolveLoadingContext();

  const cached = loadingContextCache.get(userId);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.context;
  }

  const context = await resolveLoadingContext(userId);
  loadingContextCache.set(userId, { context, timestamp: now });
  
  return context;
}

export function invalidateLoadingContextCache(userId: string) {
  loadingContextCache.delete(userId);
}