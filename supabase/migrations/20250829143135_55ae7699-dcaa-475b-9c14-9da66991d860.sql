-- Lower-body equipment grip defaults using correct equipment slugs

-- Olympic Barbell Back Squat / Front Squat baseline
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='olympic-barbell'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Smith Squat
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='smith-machine'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Trap-Bar Deadlift (neutral handles)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='trap-bar'),
   (SELECT id FROM handles  WHERE slug='trap-bar'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Olympic Barbell Hip Thrust
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='olympic-barbell'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Smith Hip Thrust
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='smith-machine'),
   (SELECT id FROM handles  WHERE slug='straight-bar'),
   (SELECT id FROM grips    WHERE slug='overhand'),
   true);

-- Cable Hip Thrust / Pull-Through (rope, neutral)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles  WHERE slug='tricep-rope'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Leg Press Machine (NULL handle, neutral grip)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='leg-press-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Hack Squat Machine (NULL handle, neutral grip)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='hack-squat-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Cable Reverse Lunge / Cable Split Squat (single handle)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles  WHERE slug='single-handle'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true);

-- Cable Pull-Through (rope) - Additional entry for hamstring isolation
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles  WHERE slug='tricep-rope'),
   (SELECT id FROM grips    WHERE slug='neutral'),
   true)

ON CONFLICT (equipment_id, handle_id, grip_id) DO NOTHING;