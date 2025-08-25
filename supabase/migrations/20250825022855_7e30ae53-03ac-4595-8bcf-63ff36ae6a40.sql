-- First, let's check what views exist and what they select
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE viewname LIKE '%exercise%' 
AND schemaname = 'public';