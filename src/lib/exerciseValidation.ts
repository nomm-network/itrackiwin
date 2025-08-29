import { supabase } from '@/integrations/supabase/client';

/**
 * Validates and sanitizes exercise data based on user Pro status
 * Removes angle attributes for non-Pro users
 */
export const validateExerciseForUser = async (exerciseData: any, userId?: string) => {
  if (!userId) return exerciseData;

  // Check if user is Pro or Admin
  const { data: user } = await supabase
    .from('users')
    .select('is_pro')
    .eq('id', userId)
    .single();

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'superadmin')
    .maybeSingle();

  const isPro = user?.is_pro || false;
  const isAdmin = !!userRole;

  // Admin and Pro users can use all features
  if (isAdmin || isPro) {
    return exerciseData;
  }

  // For free users, remove angle-related attributes
  const sanitizedData = { ...exerciseData };
  
  if (sanitizedData.attribute_values_json) {
    const attributes = { ...sanitizedData.attribute_values_json };
    
    // Remove angle and angle-related attributes
    delete attributes.angle;
    delete attributes.angle_degrees;
    delete attributes.incline_angle;
    delete attributes.decline_angle;
    
    sanitizedData.attribute_values_json = attributes;
  }

  return sanitizedData;
};

/**
 * Checks if current user can use angle features
 */
export const canUseAngleFeatures = async (userId?: string): Promise<boolean> => {
  if (!userId) return false;

  const { data: user } = await supabase
    .from('users')
    .select('is_pro')
    .eq('id', userId)
    .single();

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'superadmin')
    .maybeSingle();

  return user?.is_pro || !!userRole;
};