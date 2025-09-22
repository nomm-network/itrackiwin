-- Optional but helpful for quality
-- Translations and RLS policies information

-- Translations: table that holds exercise name translations
-- (A small sample is enough to understand the structure)
-- Adjust table name based on your actual translations table
select 
  id,
  exercise_id,
  language_code,
  name,
  description
from public.exercise_translations
order by exercise_id, language_code
limit 50;

-- OR if you have a different translation structure, adjust accordingly

-- RLS Policies check
-- List any RLS policies that might block inserts
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where schemaname = 'public' 
  and tablename in ('exercises', 'equipment', 'movements', 'movement_patterns', 'body_parts', 'muscles', 'muscle_groups', 'grips', 'bar_types')
order by tablename, policyname;

-- Expected output: 
-- 1. Sample translations CSV to understand structure for EN labeling
-- 2. List of RLS policies that might affect bulk inserts
-- This helps CG prepare INSERTs that won't be blocked by security policies