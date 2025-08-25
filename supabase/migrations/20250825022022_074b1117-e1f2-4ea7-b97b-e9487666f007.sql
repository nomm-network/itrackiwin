-- First let's see what muscle names we have available
SELECT DISTINCT mt.name 
FROM public.muscles_translations mt 
WHERE mt.language_code = 'en' 
ORDER BY mt.name;