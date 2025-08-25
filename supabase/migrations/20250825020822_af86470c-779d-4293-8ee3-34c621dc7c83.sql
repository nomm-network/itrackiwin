-- Clear existing grips translations
TRUNCATE TABLE public.grips_translations;

-- Add English translations for all grips
INSERT INTO public.grips_translations (grip_id, language_code, name, description)
SELECT 
  g.id,
  'en',
  CASE g.slug
    WHEN 'overhand' THEN 'Overhand'
    WHEN 'underhand' THEN 'Underhand'
    WHEN 'neutral' THEN 'Neutral'
    WHEN 'mixed' THEN 'Mixed'
    WHEN 'wide' THEN 'Wide'
    WHEN 'close' THEN 'Close'
    WHEN 'standard' THEN 'Standard'
    WHEN 'hook' THEN 'Hook'
    WHEN 'false' THEN 'False'
  END,
  CASE g.slug
    WHEN 'overhand' THEN 'Palms facing down (pronated grip)'
    WHEN 'underhand' THEN 'Palms facing up (supinated grip)'
    WHEN 'neutral' THEN 'Palms facing each other'
    WHEN 'mixed' THEN 'One palm up, one palm down'
    WHEN 'wide' THEN 'Hands placed wider than shoulders'
    WHEN 'close' THEN 'Hands placed close together'
    WHEN 'standard' THEN 'Shoulder-width grip'
    WHEN 'hook' THEN 'Hook grip with thumb under fingers'
    WHEN 'false' THEN 'False grip for muscle-ups'
  END
FROM public.grips g;

-- Add Romanian translations for all grips
INSERT INTO public.grips_translations (grip_id, language_code, name, description)
SELECT 
  g.id,
  'ro',
  CASE g.slug
    WHEN 'overhand' THEN 'Suprapronare'
    WHEN 'underhand' THEN 'Subpronare'
    WHEN 'neutral' THEN 'Neutru'
    WHEN 'mixed' THEN 'Mixt'
    WHEN 'wide' THEN 'Larg'
    WHEN 'close' THEN 'Strâns'
    WHEN 'standard' THEN 'Standard'
    WHEN 'hook' THEN 'Cârlig'
    WHEN 'false' THEN 'Fals'
  END,
  CASE g.slug
    WHEN 'overhand' THEN 'Palmele îndreptate în jos (pronare)'
    WHEN 'underhand' THEN 'Palmele îndreptate în sus (supinare)'
    WHEN 'neutral' THEN 'Palmele îndreptate una spre alta'
    WHEN 'mixed' THEN 'O palmă în sus, una în jos'
    WHEN 'wide' THEN 'Mâinile plasate mai larg decât umerii'
    WHEN 'close' THEN 'Mâinile plasate aproape'
    WHEN 'standard' THEN 'Lățimea umerilor'
    WHEN 'hook' THEN 'Prinderea cu cârlig, degetul mare sub celelalte'
    WHEN 'false' THEN 'Prinderea falsă pentru muscle-up-uri'
  END
FROM public.grips g;