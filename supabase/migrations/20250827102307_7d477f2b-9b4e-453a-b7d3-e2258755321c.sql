-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Helpers --------------------------------------------------------------

-- A small, safe slugify helper (letters/digits/underscores only)
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    CASE
      WHEN txt IS NULL OR btrim(txt) = '' THEN NULL
      ELSE
        -- normalize: lower, remove accents, replace non-alnum with underscores, squeeze repeats, trim
        btrim(
          regexp_replace(
            regexp_replace(
              lower(unaccent(txt)),
              '[^a-z0-9]+', '_', 'g'
            ),
            '_{2,}', '_', 'g'
          ),
          '_'
        )
    END
$$;

-- short hash for tie-breaking duplicates
CREATE OR REPLACE FUNCTION public.short_hash_uuid(u uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT substr(encode(digest(u::text, 'sha256'), 'hex'), 1, 6)
$$;

-- 3) Enhanced Backfill -------------------------------------------------------------

-- Clear any existing simple slugs to rebuild with enhanced logic
UPDATE public.exercises SET slug = NULL;

-- Preferred source: English name from exercises_translations.
-- Fallback: any available translation if EN is missing.
WITH preferred AS (
  SELECT
    e.id AS exercise_id,
    -- pick EN if present, else any language (first by created_at)
    COALESCE(
      MAX(CASE WHEN t.language_code = 'en' THEN t.name END),
      (ARRAY_AGG(t.name ORDER BY t.created_at ASC))[1]
    ) AS src_name
  FROM public.exercises e
  LEFT JOIN public.exercises_translations t
    ON t.exercise_id = e.id
  GROUP BY e.id
),
proposed AS (
  SELECT
    p.exercise_id,
    -- fall back to 'exercise_<hash>' if we truly have no name
    COALESCE(slugify(p.src_name),
             'exercise_' || short_hash_uuid(p.exercise_id)) AS slug_base
  FROM preferred p
),
-- If multiple exercises slugify to the same slug_base,
-- append a short hash to make it unique.
ranked AS (
  SELECT
    pr.exercise_id,
    pr.slug_base,
    ROW_NUMBER() OVER (PARTITION BY pr.slug_base ORDER BY pr.exercise_id) AS rn
  FROM proposed pr
)
UPDATE public.exercises e
SET slug =
  CASE
    WHEN r.rn = 1 THEN r.slug_base
    ELSE r.slug_base || '_' || short_hash_uuid(e.id)
  END
FROM ranked r
WHERE e.id = r.exercise_id;

-- 4) Enforce NOT NULL after backfill succeeded
ALTER TABLE public.exercises
  ALTER COLUMN slug SET NOT NULL;