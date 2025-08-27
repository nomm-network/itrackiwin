-- Seed handle translations
INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'straight-bar'),
  'en',
  'Straight Bar',
  'Straight cable bar';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'straight-bar'),
  'ro',
  'Bară dreaptă',
  'Bară dreaptă pentru cablu';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'ez-curl-bar'),
  'en',
  'EZ Curl Bar',
  'Angled bar (curl)';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'ez-curl-bar'),
  'ro',
  'Bară EZ',
  'Bară EZ';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'lat-bar-wide'),
  'en',
  'Wide Lat Bar',
  'Wide pulldown bar';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'lat-bar-wide'),
  'ro',
  'Bară lat tras',
  'Bară lat (prindere largă)';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'lat-bar-standard'),
  'en',
  'Standard Lat Bar',
  'Standard pulldown bar';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'lat-bar-standard'),
  'ro',
  'Bară tras standard',
  'Bară standard';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'row-v-bar'),
  'en',
  'V Bar (Row)',
  'V-bar row attachment';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'row-v-bar'),
  'ro',
  'Bară V (Ramat)',
  'Prindere V pentru ramat';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'row-triangle'),
  'en',
  'Triangle Row Handle',
  'Neutral triangle';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'row-triangle'),
  'ro',
  'Triunghi ramat',
  'Triunghi neutru';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'rope'),
  'en',
  'Triceps Rope',
  'Rope attachment';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'rope'),
  'ro',
  'Coardă triceps',
  'Atașament coardă';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'single-d-handle'),
  'en',
  'Single D Handle',
  'Single grip';

INSERT INTO public.handle_translations (handle_id, language_code, name, description)
SELECT 
  (SELECT id FROM public.handles WHERE slug = 'single-d-handle'),
  'ro',
  'Mâner D simplu',
  'Mâner simplu';

-- Add update trigger for handle_translations
CREATE TRIGGER update_handle_translations_updated_at
BEFORE UPDATE ON public.handle_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();