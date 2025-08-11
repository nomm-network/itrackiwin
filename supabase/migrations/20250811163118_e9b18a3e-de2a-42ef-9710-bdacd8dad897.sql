-- Seed default life_subcategories from existing orbit definitions, idempotently
DO $$
BEGIN
  -- Health
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Fitness & exercise'),
      (2,'Nutrition & hydration'),
      (3,'Sleep quality'),
      (4,'Medical check-ups & prevention'),
      (5,'Energy levels')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'health'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );

  -- Mind & Emotions
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Stress management'),
      (2,'Mindfulness & meditation'),
      (3,'Self-awareness'),
      (4,'Emotional regulation'),
      (5,'Therapy & mental health practices')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'mind'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );

  -- Relationships
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Family relationships'),
      (2,'Romantic life'),
      (3,'Friendships'),
      (4,'Community & social skills'),
      (5,'Networking & collaboration')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'relationships'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );

  -- Wealth
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Income & career growth'),
      (2,'Saving & investing'),
      (3,'Budgeting & debt management'),
      (4,'Financial education'),
      (5,'Long-term wealth building')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'wealth'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );

  -- Purpose & Growth
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Career purpose or calling'),
      (2,'Skill development'),
      (3,'Hobbies & creativity'),
      (4,'Continuous learning'),
      (5,'Setting & achieving goals')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'purpose'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );

  -- Lifestyle & Contribution
  INSERT INTO public.life_subcategories (category_id, name, display_order)
  SELECT c.id, v.name, v.ord
  FROM public.life_categories c
  JOIN (
    VALUES
      (1,'Fun, travel & leisure'),
      (2,'Environment & home organization'),
      (3,'Minimalism & sustainability'),
      (4,'Volunteering & giving back'),
      (5,'Legacy projects')
  ) AS v(ord, name) ON TRUE
  WHERE c.slug = 'lifestyle'
    AND NOT EXISTS (
      SELECT 1 FROM public.life_subcategories s
      WHERE s.category_id = c.id AND s.name = v.name
    );
END $$;