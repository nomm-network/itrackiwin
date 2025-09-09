-- Update exercises with proper muscle groups, body parts, movements, and grips

-- Update Barbell Back Squat
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'quads'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'glutes'),
        (SELECT id FROM muscle_groups WHERE slug = 'hamstrings'),
        (SELECT id FROM muscle_groups WHERE slug = 'calves')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'legs'),
    movement_id = (SELECT id FROM movements WHERE slug = 'back_squat'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'squat'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'barbell-back-squat';

-- Update Barbell Bench Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'chest'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'chest'),
    movement_id = (SELECT id FROM movements WHERE slug = 'horizontal_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'barbell-bench-press';

-- Update Bulgarian Split Squat
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'quads'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'glutes'),
        (SELECT id FROM muscle_groups WHERE slug = 'hamstrings')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'legs'),
    movement_id = (SELECT id FROM movements WHERE slug = 'bulgarian_split_squat'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'lunge'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'bulgarian-split-squat';

-- Update Close Grip Bench Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'chest'),
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'horizontal_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'close-grip-bench-press';

-- Update Dips
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'chest'),
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'dip'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'dips';

-- Update Dumbbell Bench Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'chest'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'chest'),
    movement_id = (SELECT id FROM movements WHERE slug = 'horizontal_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'dumbbell-bench-press';

-- Update Dumbbell Shoulder Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
        (SELECT id FROM muscle_groups WHERE slug = 'traps')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'vertical_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'dumbbell-shoulder-press';

-- Update Face Pulls
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'traps'),
        (SELECT id FROM muscle_groups WHERE slug = 'back')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'back'),
    movement_id = (SELECT id FROM movements WHERE slug = 'face_pull'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'pull'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'face-pulls';

-- Update Front Squat
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'quads'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'glutes'),
        (SELECT id FROM muscle_groups WHERE slug = 'abs'),
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'legs'),
    movement_id = (SELECT id FROM movements WHERE slug = 'front_squat'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'squat'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'front-squat';

-- Update Incline Barbell Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'chest'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
        (SELECT id FROM muscle_groups WHERE slug = 'triceps')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'chest'),
    movement_id = (SELECT id FROM movements WHERE slug = 'horizontal_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'incline-barbell-press';

-- Update Lateral Raises
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'traps')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'lateral_raise'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'isolation'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'lateral-raises';

-- Update Leg Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'quads'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'glutes'),
        (SELECT id FROM muscle_groups WHERE slug = 'hamstrings')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'legs'),
    movement_id = (SELECT id FROM movements WHERE slug = 'leg_press'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'squat'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'leg-press';

-- Update Machine Leg Curl (already has some data, just fill missing)
UPDATE exercises SET
    movement_id = (SELECT id FROM movements WHERE slug = 'curl')
WHERE slug = 'machine-leg-curl';

-- Update Overhead Press
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'shoulders'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
        (SELECT id FROM muscle_groups WHERE slug = 'traps'),
        (SELECT id FROM muscle_groups WHERE slug = 'abs')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'vertical_push'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'push'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'overhead-press';

-- Update Overhead Tricep Extension
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'shoulders')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'extension'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'isolation'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'neutral')]
WHERE slug = 'overhead-tricep-extension';

-- Update Skull Crushers
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'forearms')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'extension'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'isolation'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'skull-crushers';

-- Update Triceps Pushdown
UPDATE exercises SET
    primary_muscle_id = (SELECT id FROM muscle_groups WHERE slug = 'triceps'),
    secondary_muscle_group_ids = ARRAY[
        (SELECT id FROM muscle_groups WHERE slug = 'forearms')
    ],
    body_part_id = (SELECT id FROM body_parts WHERE slug = 'arms'),
    movement_id = (SELECT id FROM movements WHERE slug = 'extension'),
    movement_pattern_id = (SELECT id FROM movement_patterns WHERE slug = 'isolation'),
    default_grip_ids = ARRAY[(SELECT id FROM grips WHERE slug = 'overhand')]
WHERE slug = 'triceps-pushdown';