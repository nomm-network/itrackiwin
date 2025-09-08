-- Update life_subcategories with proper slugs based on their English names
UPDATE life_subcategories 
SET slug = CASE 
  WHEN id = '063d5273-e50e-4ea3-b972-da3564d899f8' THEN 'family-relationships'
  WHEN id = '0750b46e-245a-476a-85e6-6897c2e7faa3' THEN 'emotional-regulation'
  WHEN id = '0d764a67-9023-4b05-a09e-93685083b084' THEN 'therapy-mental-health'
  WHEN id = '115ae586-0422-4276-9472-dffa117fdfa3' THEN 'energy-levels'
  WHEN id = '1875a6f7-6c4c-4640-84a1-7a2068a34505' THEN 'medical-checkups'
  WHEN id = '19c88b1d-285a-430f-baa6-23e668820193' THEN 'continuous-learning'
  WHEN id = '1a6050a8-6e34-4183-8949-38d623d79d6b' THEN 'minimalism-sustainability'
  WHEN id = '1c14e4d4-4808-44cf-90b6-9fd4e9f39185' THEN 'mindfulness-meditation'
  WHEN id = '1dc15b2a-77de-4016-907c-1f4033996161' THEN 'financial-education'
  WHEN id = '22a1e53f-b0a1-4840-bd43-66832c907656' THEN 'hobbies-creativity'
  WHEN id = '34ce4ef3-9a68-49e9-8915-f3a9d05e5df2' THEN 'goal-setting'
  WHEN id = '37083856-9fe3-4cd9-9cfe-d1714e5c455a' THEN 'environment-organization'
  WHEN id = '3b427cc0-9f74-43a5-8b59-ce4c6e821cbc' THEN 'romantic-life'
  WHEN id = '461e724b-5504-4172-96c6-bc2ec3ffa8ca' THEN 'wealth-building'
  WHEN id = '6539552e-abb2-474d-9dd6-0e91ee47fe39' THEN 'legacy-projects'
  WHEN id = '8a054133-9562-460b-94e5-8dd62b619674' THEN 'nutrition-hydration'
  WHEN id = 'a687a182-65ec-442f-87e5-0088b2ee425f' THEN 'budgeting-debt'
  WHEN id = 'a75b1791-a573-4d91-91aa-33744eea1e3c' THEN 'time-productivity'
  WHEN id = 'abc39ac4-9088-4b46-8a4f-c30b14ba9b5d' THEN 'fitness-exercise'
  WHEN id = 'be8f6c5e-7e6b-4f5e-b3f6-8b6b6b6b6b6b' THEN 'sleep-recovery'
  WHEN id = 'c8a99f82-1234-5678-9abc-def012345678' THEN 'social-connections'
  WHEN id = 'd9b88e73-2345-6789-bcde-f01234567890' THEN 'work-life-balance'
  ELSE public.slugify((
    SELECT t.name 
    FROM life_subcategory_translations t 
    WHERE t.subcategory_id = life_subcategories.id 
    AND t.language_code = 'en' 
    LIMIT 1
  ))
END
WHERE slug IS NULL;