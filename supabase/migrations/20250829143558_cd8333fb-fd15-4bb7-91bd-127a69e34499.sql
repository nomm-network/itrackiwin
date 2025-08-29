-- Add upper-body equipment grip defaults

-- Dumbbell defaults (neutral grip, no handle needed)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='dumbbell'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- EZ Curl Bar (angled bar, neutral grip)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='ez-curl-bar'),
   (SELECT id FROM handles WHERE slug='straight-bar'),
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Lat Pulldown Machine with lat-bar (wide overhand)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='lat-pulldown-machine'),
   (SELECT id FROM handles WHERE slug='lat-bar'),
   (SELECT id FROM grips WHERE slug='overhand'),
   true);

-- Lat Pulldown Machine with single handle (neutral)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='lat-pulldown-machine'),
   (SELECT id FROM handles WHERE slug='single-handle'),
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Chest Press Machine (neutral grip on handles)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='chest-press-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Pec Deck Machine (neutral grip on handles)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='pec-deck-machine'),
   NULL,
   (SELECT id FROM grips WHERE slug='neutral'),
   true);

-- Cable Machine with lat-bar (overhand)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles WHERE slug='lat-bar'),
   (SELECT id FROM grips WHERE slug='overhand'),
   true);

-- Cable Machine with straight-bar (overhand and underhand)
INSERT INTO equipment_grip_defaults (equipment_id, handle_id, grip_id, is_default) VALUES
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles WHERE slug='straight-bar'),
   (SELECT id FROM grips WHERE slug='overhand'),
   true),
  ((SELECT id FROM equipment WHERE slug='cable-machine'),
   (SELECT id FROM handles WHERE slug='straight-bar'),
   (SELECT id FROM grips WHERE slug='underhand'),
   false);

ON CONFLICT (equipment_id, handle_id, grip_id) DO NOTHING;