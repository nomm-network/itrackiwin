-- Add new enum value first (needs separate transaction)
ALTER TYPE public.experience_level ADD VALUE IF NOT EXISTS 'very_experienced';