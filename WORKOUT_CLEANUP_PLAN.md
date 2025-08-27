# Workout Catalog Cleanup & Seeding Plan

## Overview
Full reset & curated seed: nuke test data → migrate schema → seed ~50 rock-solid exercises with proper equipment/handles/grips.

---

## Step-by-Step Progress Tracker

### 0) Preconditions (5 minutes) ❌
- [ ] Make DB snapshot (Supabase: Backups → Create backup)
- [ ] Ensure you're the only writer (disable any background scripts)

### 1) Sanity: keep vs drop (what we KEEP) ❌
**DO NOT DELETE these foundations:**
- [ ] Verify body_parts, muscles, and their _translations are intact
- [ ] Verify grips, handles, equipment and their _translations are intact  
- [ ] Verify compatibility/link tables: handle_grip_compatibility
- [ ] Verify user/workout history tables (will truncate, not drop)

### 2) Migrate schema (add missing + remove confusing legacy) ❌

#### 2.1 Add slug to exercises (canonical key, required) ❌
- [ ] Add slug column if missing
- [ ] Create slugify helper function
- [ ] Populate slug from EN translations
- [ ] Enforce uniqueness with index

#### 2.2 Remove/retire legacy "name" columns ❌
- [ ] Rename legacy name columns to name__deprecated on exercises
- [ ] Rename legacy name columns on equipment/handles/grips if present

#### 2.3 Template exercise → add optional handle & default grips ❌
- [ ] Add handle_id column to template_exercises
- [ ] Add grip_ids array column to template_exercises

#### 2.4 Workout exercise → record actual chosen handle/grips/bar meta ❌
- [ ] Add handle_id to workout_exercises
- [ ] Add grip_ids array to workout_exercises  
- [ ] Add bar_type_id to workout_exercises
- [ ] Add load_type to workout_exercises
- [ ] Add per_side_weight to workout_exercises

### 3) Clean slate (truncate in the right order) ❌
- [ ] Truncate workout_sets, workout_exercises, workouts
- [ ] Truncate template_exercises, workout_templates
- [ ] Truncate exercise_handle_grips, exercise_grips, exercise_handles
- [ ] Optional: truncate user_exercise_estimates

### 4) Seed a clean "Top 50" exercise library ❌

#### 4.1 Insert exercises + translations ❌
**CHEST (8 exercises)**
- [ ] Barbell Bench Press
- [ ] Incline Dumbbell Press  
- [ ] Decline Barbell Press
- [ ] Dumbbell Flyes
- [ ] Cable Crossover
- [ ] Push-ups
- [ ] Incline Barbell Press
- [ ] Dips

**BACK (10 exercises)**
- [ ] Seated Cable Row
- [ ] Lat Pulldown
- [ ] Barbell Rows
- [ ] T-Bar Row
- [ ] Cable High Row
- [ ] Wide Grip Pulldown
- [ ] Reverse Flyes
- [ ] Face Pulls
- [ ] Shrugs
- [ ] Deadlift

**LEGS (12 exercises)**
- [ ] Barbell Back Squat
- [ ] Romanian Deadlift
- [ ] Leg Press
- [ ] Leg Curls
- [ ] Leg Extensions
- [ ] Walking Lunges
- [ ] Bulgarian Split Squats
- [ ] Calf Raises
- [ ] Goblet Squats
- [ ] Sumo Deadlift
- [ ] Front Squats
- [ ] Stiff Leg Deadlift

**SHOULDERS (8 exercises)**
- [ ] Seated DB Shoulder Press
- [ ] Lateral Raises
- [ ] Rear Delt Flyes
- [ ] Military Press
- [ ] Arnold Press
- [ ] Cable Lateral Raises
- [ ] Upright Rows
- [ ] Front Raises

**ARMS (8 exercises)**
- [ ] Cable Triceps Pushdown
- [ ] Bicep Curls
- [ ] Hammer Curls
- [ ] Tricep Dips
- [ ] Overhead Tricep Extension
- [ ] Preacher Curls
- [ ] Close Grip Bench Press
- [ ] Cable Bicep Curls

**CORE (4 exercises)**
- [ ] Plank
- [ ] Russian Twists
- [ ] Cable Crunches
- [ ] Hanging Leg Raises

#### 4.2 Link default handles / default grips per exercise ❌
- [ ] Set up exercise_handles relationships
- [ ] Set up exercise_grips relationships  
- [ ] Configure handle_grip_compatibility

### 5) Make templates use "same exercise, different grip/handle" ❌
- [ ] Create sample templates with handle/grip variations
- [ ] Test template system with new schema

### 6) Front-end wiring ❌

#### 6.1 Template Editor ❌
- [ ] Update to fetch handle_id and grip_ids
- [ ] Display handle + grips badges
- [ ] Edit interface for handle/grip selection

#### 6.2 Start workout (instantiate) ❌
- [ ] Copy handle_id, grip_ids from template to workout
- [ ] Copy bar defaults and load_type

#### 6.3 During workout (logging) ❌
- [ ] Read handle/grip context during set logging
- [ ] Show translated exercise names
- [ ] Warmup recalculation with JSONB logic

### 7) QA checklist ❌
- [ ] Exercise add form shows translations, not slugs
- [ ] Template editor shows Handle and Grips correctly
- [ ] Can add same exercise twice with different handle/grips
- [ ] Workout page shows exercise names and preserves handle/grip choices
- [ ] Set logging doesn't violate unique constraints

### 8) (Optional) View for quick admin auditing ❌
- [ ] Create v_exercise_display view
- [ ] Test admin auditing capabilities

### 9) Final housekeeping ❌
- [ ] Drop *_deprecated columns after FE verification
- [ ] Commit migration scripts to repo
- [ ] Complete seeding of remaining exercises

---

## Current Status: Ready to Start ⏳
**Next Action:** Begin with Step 0 (Preconditions) and Step 2 (Schema Migration)