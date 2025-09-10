-- Update Mind category subcategories with better icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'stress-management' THEN '😌'
  WHEN 'mindfulness-meditation' THEN '🧘'
  WHEN 'self-awareness' THEN '🪞'
  WHEN 'emotional-regulation' THEN '💭'
  WHEN 'therapy-mental-health' THEN '🧠'
  ELSE icon
END
WHERE category_id = '22a22f7c-8f58-4441-973b-0eccc0385142';

-- Update Purpose category subcategories with better icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'career-purpose-or-calling' THEN '🎯'
  WHEN 'skill-development' THEN '🚀'
  WHEN 'education-learning' THEN '📚'
  WHEN 'creativity-personal-expression' THEN '🎨'
  WHEN 'spiritual-growth' THEN '✨'
  ELSE icon
END
WHERE category_id = '636de2a6-fa52-4f06-9073-9c977a74b908';

-- Update Lifestyle category subcategories with better icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'time-productivity' THEN '🎉'
  WHEN 'environment-organization' THEN '🏠'
  WHEN 'minimalism-sustainability' THEN '🌱'
  WHEN 'volunteering-giving-back' THEN '🤝'
  WHEN 'legacy-projects' THEN '📜'
  ELSE icon
END
WHERE category_id = '6662cc6c-9fa1-49f4-b8a2-da673f12c4a0';

-- Update Relationships category subcategories with better icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'family-relationships' THEN '👨‍👩‍👧‍👦'
  WHEN 'friendships' THEN '👥'
  WHEN 'romantic-relationships' THEN '💕'
  WHEN 'social-life-networking' THEN '🎭'
  WHEN 'community-involvement' THEN '🌍'
  ELSE icon
END
WHERE category_id = '13774202-2b88-478d-ad07-7e149333882f';

-- Update Wealth category subcategories with better icons
UPDATE public.life_subcategories 
SET icon = CASE slug
  WHEN 'money-management' THEN '💰'
  WHEN 'investment-growth' THEN '📈'
  WHEN 'debt-reduction' THEN '🎯'
  WHEN 'career-development' THEN '💼'
  WHEN 'passive-income' THEN '💸'
  ELSE icon
END
WHERE category_id IN (
  SELECT id FROM public.life_categories WHERE slug = 'wealth'
);