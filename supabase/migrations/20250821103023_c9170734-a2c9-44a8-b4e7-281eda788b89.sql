-- Remove materialized views from API access by revoking public access
-- This addresses both "Security Definer View" and "Materialized View in API" warnings

REVOKE ALL ON public.mv_user_exercise_1rm FROM anon, authenticated;
REVOKE ALL ON public.mv_last_set_per_user_exercise FROM anon, authenticated;
REVOKE ALL ON public.mv_pr_weight_per_user_exercise FROM anon, authenticated;

-- Grant access only to the functions that need them (and they already filter by user)
GRANT SELECT ON public.mv_user_exercise_1rm TO postgres, service_role;
GRANT SELECT ON public.mv_last_set_per_user_exercise TO postgres, service_role;
GRANT SELECT ON public.mv_pr_weight_per_user_exercise TO postgres, service_role;

-- Also check if there are any functions that still need search_path fixes
-- Update any remaining functions that might not have search_path set