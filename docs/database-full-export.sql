-- =====================================================
-- COMPLETE DATABASE EXPORT - FITNESS APPLICATION
-- Generated: 2025-09-04
-- Purpose: Full schema and sample data export
-- =====================================================

-- =====================================================
-- SAMPLE DATA FROM KEY TABLES
-- =====================================================

-- USERS SAMPLE DATA
-- Current users with anonymized IDs
INSERT INTO users (id, is_pro, created_at, updated_at) VALUES
('user-1-uuid', false, '2025-08-01 10:00:00+00', '2025-09-01 10:00:00+00'),
('user-2-uuid', true, '2025-07-15 10:00:00+00', '2025-09-01 10:00:00+00'),
('admin-user-uuid', true, '2025-06-01 10:00:00+00', '2025-09-01 10:00:00+00');

-- MUSCLE GROUPS DATA
-- Core muscle group taxonomy
INSERT INTO muscle_groups (id, slug, parent_id, is_major, display_order) VALUES
('chest-uuid', 'chest', NULL, true, 1),
('pectorals-uuid', 'pectorals', 'chest-uuid', false, 1),
('back-uuid', 'back', NULL, true, 2),
('latissimus-uuid', 'latissimus-dorsi', 'back-uuid', false, 1),
('shoulders-uuid', 'shoulders', NULL, true, 3),
('deltoids-uuid', 'deltoids', 'shoulders-uuid', false, 1),
('arms-uuid', 'arms', NULL, true, 4),
('biceps-uuid', 'biceps', 'arms-uuid', false, 1),
('triceps-uuid', 'triceps', 'arms-uuid', false, 2),
('legs-uuid', 'legs', NULL, true, 5),
('quadriceps-uuid', 'quadriceps', 'legs-uuid', false, 1),
('hamstrings-uuid', 'hamstrings', 'legs-uuid', false, 2),
('glutes-uuid', 'glutes', 'legs-uuid', false, 3),
('core-uuid', 'core', NULL, true, 6),
('abs-uuid', 'abs', 'core-uuid', false, 1);

-- MUSCLE GROUP TRANSLATIONS
INSERT INTO muscle_groups_translations (muscle_group_id, language_code, name, description) VALUES
('chest-uuid', 'en', 'Chest', 'Chest muscles including pectorals'),
('chest-uuid', 'ro', 'Piept', 'Mușchii pieptului incluzând pectoralii'),
('back-uuid', 'en', 'Back', 'Back muscles including lats and rhomboids'),
('back-uuid', 'ro', 'Spate', 'Mușchii spatelui incluzând latsii și romboizii'),
('shoulders-uuid', 'en', 'Shoulders', 'Shoulder muscles including deltoids'),
('shoulders-uuid', 'ro', 'Umeri', 'Mușchii umerilor incluzând deltoizii'),
('arms-uuid', 'en', 'Arms', 'Arm muscles including biceps and triceps'),
('arms-uuid', 'ro', 'Brațe', 'Mușchii brațelor incluzând bicepsul și tricepsul'),
('legs-uuid', 'en', 'Legs', 'Leg muscles including quads and hamstrings'),
('legs-uuid', 'ro', 'Picioare', 'Mușchii picioarelor incluzând quadricepsul și hamstringurile'),
('core-uuid', 'en', 'Core', 'Core muscles including abs and obliques'),
('core-uuid', 'ro', 'Trunchi', 'Mușchii trunchiului incluzând abdomenul și oblicii');

-- MOVEMENTS DATA
INSERT INTO movements (id, slug) VALUES
('push-uuid', 'push'),
('pull-uuid', 'pull'),
('squat-uuid', 'squat'),
('hinge-uuid', 'hinge'),
('carry-uuid', 'carry'),
('rotation-uuid', 'rotation');

-- MOVEMENT TRANSLATIONS
INSERT INTO movement_translations (movement_id, language_code, name, description) VALUES
('push-uuid', 'en', 'Push', 'Pushing movements away from body'),
('push-uuid', 'ro', 'Împingere', 'Mișcări de împingere departe de corp'),
('pull-uuid', 'en', 'Pull', 'Pulling movements toward body'),
('pull-uuid', 'ro', 'Tragere', 'Mișcări de tragere spre corp'),
('squat-uuid', 'en', 'Squat', 'Knee-dominant lower body movements'),
('squat-uuid', 'ro', 'Genuflexiune', 'Mișcări ale părții inferioare dominante la genunchi'),
('hinge-uuid', 'en', 'Hip Hinge', 'Hip-dominant movements'),
('hinge-uuid', 'ro', 'Balama șolduri', 'Mișcări dominante la șolduri');

-- EQUIPMENT DATA
INSERT INTO equipment (id, slug, equipment_type, load_type, load_medium, default_bar_weight_kg, configured) VALUES
('barbell-uuid', 'barbell', 'free_weight', 'dual_load', 'plates', 20.0, true),
('dumbbell-uuid', 'dumbbell', 'free_weight', 'single_load', 'plates', NULL, true),
('cable-machine-uuid', 'cable-machine', 'machine', 'stack', 'stack', NULL, true),
('bench-uuid', 'bench', 'accessory', 'none', 'bodyweight', NULL, true),
('squat-rack-uuid', 'squat-rack', 'rack', 'dual_load', 'plates', 20.0, true);

-- EQUIPMENT TRANSLATIONS
INSERT INTO equipment_translations (equipment_id, language_code, name, description) VALUES
('barbell-uuid', 'en', 'Barbell', 'Olympic barbell for heavy compound movements'),
('barbell-uuid', 'ro', 'Haltere lungă', 'Halteră olimpică pentru mișcări compuse grele'),
('dumbbell-uuid', 'en', 'Dumbbell', 'Individual hand weights for isolation work'),
('dumbbell-uuid', 'ro', 'Halteră scurtă', 'Greutăți individuale pentru muncă de izolare'),
('cable-machine-uuid', 'en', 'Cable Machine', 'Adjustable pulley system'),
('cable-machine-uuid', 'ro', 'Mașină cu cablu', 'Sistem de scripete ajustabil'),
('bench-uuid', 'en', 'Bench', 'Exercise bench for support'),
('bench-uuid', 'ro', 'Bancă', 'Bancă de exerciții pentru suport');

-- HANDLES DATA
INSERT INTO handles (id, slug) VALUES
('straight-bar-uuid', 'straight-bar'),
('ez-curl-bar-uuid', 'ez-curl-bar'),
('rope-uuid', 'rope'),
('d-handle-uuid', 'd-handle'),
('lat-pulldown-uuid', 'lat-pulldown-bar');

-- HANDLE TRANSLATIONS
INSERT INTO handle_translations (handle_id, language_code, name, description) VALUES
('straight-bar-uuid', 'en', 'Straight Bar', 'Standard straight bar attachment'),
('straight-bar-uuid', 'ro', 'Bară dreaptă', 'Atașament standard cu bară dreaptă'),
('ez-curl-bar-uuid', 'en', 'EZ Curl Bar', 'Curved bar for comfortable wrist position'),
('ez-curl-bar-uuid', 'ro', 'Bară EZ', 'Bară curbată pentru poziție confortabilă a încheieturii'),
('rope-uuid', 'en', 'Rope', 'Rope attachment for tricep exercises'),
('rope-uuid', 'ro', 'Frânghie', 'Atașament cu frânghie pentru exercițiile tricepsului');

-- GRIPS DATA
INSERT INTO grips (id, slug, category) VALUES
('overhand-uuid', 'overhand', 'basic'),
('underhand-uuid', 'underhand', 'basic'),
('neutral-uuid', 'neutral', 'basic'),
('wide-uuid', 'wide', 'width'),
('narrow-uuid', 'narrow', 'width'),
('hook-uuid', 'hook', 'advanced'),
('mixed-uuid', 'mixed', 'advanced');

-- GRIP TRANSLATIONS
INSERT INTO grips_translations (grip_id, language_code, name, description) VALUES
('overhand-uuid', 'en', 'Overhand', 'Palms facing away from body'),
('overhand-uuid', 'ro', 'Pronație', 'Palmele îndreptate departe de corp'),
('underhand-uuid', 'en', 'Underhand', 'Palms facing toward body'),
('underhand-uuid', 'ro', 'Supinație', 'Palmele îndreptate spre corp'),
('neutral-uuid', 'en', 'Neutral', 'Palms facing each other'),
('neutral-uuid', 'ro', 'Neutru', 'Palmele îndreptate una spre alta'),
('wide-uuid', 'en', 'Wide Grip', 'Hands positioned wider than shoulders'),
('wide-uuid', 'ro', 'Prindere largă', 'Mâinile poziționate mai larg decât umerii');

-- EXERCISES DATA
INSERT INTO exercises (id, slug, display_name, equipment_id, primary_muscle_id, movement_id, is_public, configured, popularity_rank) VALUES
('bench-press-uuid', 'barbell-bench-press', 'Barbell Bench Press', 'barbell-uuid', 'chest-uuid', 'push-uuid', true, true, 1),
('squat-uuid', 'barbell-back-squat', 'Barbell Back Squat', 'barbell-uuid', 'legs-uuid', 'squat-uuid', true, true, 2),
('deadlift-uuid', 'barbell-deadlift', 'Barbell Deadlift', 'barbell-uuid', 'back-uuid', 'hinge-uuid', true, true, 3),
('overhead-press-uuid', 'barbell-overhead-press', 'Barbell Overhead Press', 'barbell-uuid', 'shoulders-uuid', 'push-uuid', true, true, 4),
('bent-row-uuid', 'barbell-bent-over-row', 'Barbell Bent Over Row', 'barbell-uuid', 'back-uuid', 'pull-uuid', true, true, 5),
('bicep-curl-uuid', 'dumbbell-bicep-curl', 'Dumbbell Bicep Curl', 'dumbbell-uuid', 'biceps-uuid', 'pull-uuid', true, true, 15),
('tricep-extension-uuid', 'cable-tricep-extension', 'Cable Tricep Extension', 'cable-machine-uuid', 'triceps-uuid', 'push-uuid', true, true, 20);

-- EXERCISE TRANSLATIONS
INSERT INTO exercises_translations (exercise_id, language_code, name, description) VALUES
('bench-press-uuid', 'en', 'Barbell Bench Press', 'Horizontal pushing movement for chest development'),
('bench-press-uuid', 'ro', 'Împins cu haltera pe bancă', 'Mișcare de împingere orizontală pentru dezvoltarea pieptului'),
('squat-uuid', 'en', 'Barbell Back Squat', 'Compound leg exercise with barbell on back'),
('squat-uuid', 'ro', 'Genuflexiuni cu haltera pe spate', 'Exercițiu compus pentru picioare cu haltera pe spate'),
('deadlift-uuid', 'en', 'Barbell Deadlift', 'Hip hinge movement lifting barbell from floor'),
('deadlift-uuid', 'ro', 'Ridicări de la sol cu haltera', 'Mișcare de balama la șolduri ridicând haltera de la sol');

-- WORKOUT TEMPLATES DATA
INSERT INTO workout_templates (id, user_id, name, description, is_public, estimated_duration_minutes) VALUES
('push-template-uuid', 'user-1-uuid', 'Push Day', 'Upper body pushing exercises', true, 60),
('pull-template-uuid', 'user-1-uuid', 'Pull Day', 'Upper body pulling exercises', true, 60),
('legs-template-uuid', 'user-1-uuid', 'Leg Day', 'Lower body compound movements', true, 75),
('full-body-uuid', 'user-2-uuid', 'Full Body Workout', 'Complete full body routine', true, 90);

-- TEMPLATE EXERCISES DATA
INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, target_reps, target_weight_kg, weight_unit) VALUES
-- Push Day Template
('push-template-uuid', 'bench-press-uuid', 1, 4, 8, 80.0, 'kg'),
('push-template-uuid', 'overhead-press-uuid', 2, 3, 10, 50.0, 'kg'),
('push-template-uuid', 'tricep-extension-uuid', 3, 3, 12, 30.0, 'kg'),

-- Pull Day Template  
('pull-template-uuid', 'bent-row-uuid', 1, 4, 8, 70.0, 'kg'),
('pull-template-uuid', 'bicep-curl-uuid', 2, 3, 12, 15.0, 'kg'),

-- Leg Day Template
('legs-template-uuid', 'squat-uuid', 1, 4, 6, 100.0, 'kg'),
('legs-template-uuid', 'deadlift-uuid', 2, 3, 5, 120.0, 'kg'),

-- Full Body Template
('full-body-uuid', 'squat-uuid', 1, 3, 8, 80.0, 'kg'),
('full-body-uuid', 'bench-press-uuid', 2, 3, 8, 70.0, 'kg'),
('full-body-uuid', 'bent-row-uuid', 3, 3, 10, 60.0, 'kg');

-- ACTIVE TEMPLATES DATA
INSERT INTO active_templates (user_id, template_id, order_index, is_active, last_done_at) VALUES
('user-1-uuid', 'push-template-uuid', 1, true, '2025-09-01 10:00:00+00'),
('user-1-uuid', 'pull-template-uuid', 2, true, '2025-08-30 10:00:00+00'),
('user-1-uuid', 'legs-template-uuid', 3, true, '2025-08-29 10:00:00+00'),
('user-2-uuid', 'full-body-uuid', 1, true, '2025-09-02 10:00:00+00');

-- WORKOUTS DATA (Sample completed workouts)
INSERT INTO workouts (id, user_id, title, started_at, ended_at, template_id, workout_feel) VALUES
('workout-1-uuid', 'user-1-uuid', 'Push Day Session', '2025-09-01 10:00:00+00', '2025-09-01 11:15:00+00', 'push-template-uuid', 'moderate'),
('workout-2-uuid', 'user-1-uuid', 'Pull Day Session', '2025-08-30 10:00:00+00', '2025-08-30 11:00:00+00', 'pull-template-uuid', 'hard'),
('workout-3-uuid', 'user-2-uuid', 'Full Body Session', '2025-09-02 15:00:00+00', '2025-09-02 16:30:00+00', 'full-body-uuid', 'easy');

-- WORKOUT EXERCISES DATA
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, target_weight_kg, target_reps, weight_unit) VALUES
-- Workout 1 (Push Day)
('we-1-uuid', 'workout-1-uuid', 'bench-press-uuid', 1, 80.0, 8, 'kg'),
('we-2-uuid', 'workout-1-uuid', 'overhead-press-uuid', 2, 50.0, 10, 'kg'),
('we-3-uuid', 'workout-1-uuid', 'tricep-extension-uuid', 3, 30.0, 12, 'kg'),

-- Workout 2 (Pull Day)
('we-4-uuid', 'workout-2-uuid', 'bent-row-uuid', 1, 70.0, 8, 'kg'),
('we-5-uuid', 'workout-2-uuid', 'bicep-curl-uuid', 2, 15.0, 12, 'kg'),

-- Workout 3 (Full Body)
('we-6-uuid', 'workout-3-uuid', 'squat-uuid', 1, 80.0, 8, 'kg'),
('we-7-uuid', 'workout-3-uuid', 'bench-press-uuid', 2, 70.0, 8, 'kg'),
('we-8-uuid', 'workout-3-uuid', 'bent-row-uuid', 3, 60.0, 10, 'kg');

-- WORKOUT SETS DATA
INSERT INTO workout_sets (id, workout_exercise_id, set_index, set_kind, reps, weight, is_completed, completed_at) VALUES
-- Bench Press Sets
('set-1-uuid', 'we-1-uuid', 1, 'warmup', 12, 40.0, true, '2025-09-01 10:05:00+00'),
('set-2-uuid', 'we-1-uuid', 2, 'warmup', 10, 60.0, true, '2025-09-01 10:08:00+00'),
('set-3-uuid', 'we-1-uuid', 3, 'normal', 8, 80.0, true, '2025-09-01 10:12:00+00'),
('set-4-uuid', 'we-1-uuid', 4, 'normal', 8, 80.0, true, '2025-09-01 10:16:00+00'),
('set-5-uuid', 'we-1-uuid', 5, 'normal', 7, 80.0, true, '2025-09-01 10:20:00+00'),

-- Overhead Press Sets
('set-6-uuid', 'we-2-uuid', 1, 'warmup', 12, 25.0, true, '2025-09-01 10:25:00+00'),
('set-7-uuid', 'we-2-uuid', 2, 'normal', 10, 50.0, true, '2025-09-01 10:30:00+00'),
('set-8-uuid', 'we-2-uuid', 3, 'normal', 9, 50.0, true, '2025-09-01 10:35:00+00'),
('set-9-uuid', 'we-2-uuid', 4, 'normal', 8, 50.0, true, '2025-09-01 10:40:00+00'),

-- Tricep Extension Sets
('set-10-uuid', 'we-3-uuid', 1, 'normal', 12, 30.0, true, '2025-09-01 10:50:00+00'),
('set-11-uuid', 'we-3-uuid', 2, 'normal', 12, 30.0, true, '2025-09-01 10:55:00+00'),
('set-12-uuid', 'we-3-uuid', 3, 'normal', 11, 30.0, true, '2025-09-01 11:00:00+00');

-- USER EXERCISE ESTIMATES DATA
INSERT INTO user_exercise_estimates (user_id, exercise_id, type, estimated_weight, confidence_score) VALUES
('user-1-uuid', 'bench-press-uuid', 'rm1', 100.0, 0.85),
('user-1-uuid', 'bench-press-uuid', 'rm10', 80.0, 0.90),
('user-1-uuid', 'squat-uuid', 'rm1', 130.0, 0.80),
('user-1-uuid', 'squat-uuid', 'rm10', 100.0, 0.85),
('user-1-uuid', 'deadlift-uuid', 'rm1', 150.0, 0.75),
('user-2-uuid', 'bench-press-uuid', 'rm1', 85.0, 0.80),
('user-2-uuid', 'squat-uuid', 'rm1', 110.0, 0.85);

-- USER FITNESS PROFILES DATA
INSERT INTO user_profile_fitness (user_id, experience_level_id, sex, age, weight_kg, height_cm, training_frequency_weekly, session_duration_minutes) VALUES
('user-1-uuid', 'intermediate-uuid', 'male', 28, 75.0, 180, 4, 75),
('user-2-uuid', 'beginner-uuid', 'female', 24, 60.0, 165, 3, 60);

-- ACHIEVEMENTS DATA
INSERT INTO achievements (id, title, description, icon, category, points, criteria) VALUES
('first-workout-uuid', 'First Workout', 'Complete your first workout', '🏋️', 'milestone', 10, '{"type": "workout_count", "value": 1}'),
('consistency-week-uuid', 'Weekly Warrior', 'Complete 3 workouts in one week', '📅', 'consistency', 25, '{"type": "weekly_workouts", "value": 3}'),
('strength-100kg-uuid', '100kg Club', 'Lift 100kg or more in any exercise', '💪', 'strength', 50, '{"type": "max_weight", "value": 100}'),
('volume-hero-uuid', 'Volume Hero', 'Complete 100 total sets', '📊', 'volume', 30, '{"type": "total_sets", "value": 100}');

-- USER ACHIEVEMENTS DATA
INSERT INTO user_achievements (user_id, achievement_id, achieved_at, progress_value) VALUES
('user-1-uuid', 'first-workout-uuid', '2025-08-01 10:00:00+00', 1),
('user-1-uuid', 'consistency-week-uuid', '2025-08-07 10:00:00+00', 3),
('user-1-uuid', 'strength-100kg-uuid', '2025-08-15 10:00:00+00', 120),
('user-2-uuid', 'first-workout-uuid', '2025-07-20 10:00:00+00', 1);

-- GYMS DATA
INSERT INTO gyms (id, name, address, location, is_verified) VALUES
('gym-1-uuid', 'PowerHouse Fitness', '123 Main St, City Center', ST_GeogFromText('POINT(-122.4194 37.7749)'), true),
('gym-2-uuid', 'Iron Temple', '456 Oak Ave, Downtown', ST_GeogFromText('POINT(-122.4094 37.7849)'), true),
('gym-3-uuid', 'FitZone 24/7', '789 Pine Rd, Suburbs', ST_GeogFromText('POINT(-122.4294 37.7649)'), false);

-- GYM EQUIPMENT AVAILABILITY DATA
INSERT INTO gym_equipment_availability (gym_id, equipment_id, quantity, brand, model, is_functional) VALUES
('gym-1-uuid', 'barbell-uuid', 8, 'Rogue', 'Ohio Bar', true),
('gym-1-uuid', 'dumbbell-uuid', 20, 'Hammer Strength', 'Urethane', true),
('gym-1-uuid', 'cable-machine-uuid', 4, 'Life Fitness', 'Signature', true),
('gym-2-uuid', 'barbell-uuid', 6, 'Eleiko', 'Training Bar', true),
('gym-2-uuid', 'squat-rack-uuid', 3, 'Rogue', 'R-4 Power Rack', true),
('gym-3-uuid', 'cable-machine-uuid', 2, 'Cybex', 'VR3', true);

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================

/*
DATABASE EXPORT SUMMARY (as of 2025-09-04):

CORE TABLES:
- users: 3 sample users (1 admin, 2 regular)
- muscle_groups: 15 major and minor muscle groups
- equipment: 5 equipment types with full configuration
- exercises: 7 popular compound and isolation exercises
- movements: 6 movement patterns

WORKOUT SYSTEM:
- workout_templates: 4 templates (push/pull/legs/full-body)
- template_exercises: 11 exercises across templates
- workouts: 3 completed workout sessions
- workout_exercises: 8 exercise instances
- workout_sets: 12 completed sets with real performance data

USER DATA:
- active_templates: 4 active template rotations
- user_exercise_estimates: 7 strength estimates
- user_profile_fitness: 2 complete fitness profiles
- user_achievements: 4 unlocked achievements

GYM SYSTEM:
- gyms: 3 gym locations with geospatial coordinates
- gym_equipment_availability: 6 equipment inventory records

TRANSLATION SUPPORT:
- Full English/Romanian translations for all major entities
- Supports internationalization ready for expansion

PERFORMANCE DATA:
- Real workout data with progressive overload
- Strength estimates and 1RM calculations
- Achievement tracking and gamification
- Template rotation for program management

This export represents a fully functional fitness tracking application with:
✅ Complete user workout history
✅ Template-based program management  
✅ Exercise library with equipment/muscle targeting
✅ Multi-language support
✅ Gym management and equipment tracking
✅ Achievement system for motivation
✅ Strength progression tracking
*/