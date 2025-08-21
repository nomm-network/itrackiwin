-- Fix RLS issues on remaining tables that need RLS enabled
ALTER TABLE public.bar_types ENABLE ROW LEVEL SECURITY;