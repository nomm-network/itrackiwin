# 📘 Workout & Tracking Flow Documentation

## 1. Exercises
- **Definition**: Base movements in the DB (exercises table).
- **Fields**:
  - `exercise_id` → unique identifier
  - `equipment_id` → links to equipment (barbell, dumbbell, cable, machine, etc.)
  - `body_part_id`, `primary_muscle_id`, `secondary_muscle_group_ids` → for Bro's targeting logic
  - `default_grips` → JSON of grips (e.g. neutral, wide, rope, etc.)
- **Special Flags (extensions)**:
  - `is_barbell_load` → means Bro calculates total weight from bar + plates.
  - `is_dual_load` / `is_single_load` → for machines with dual/single sided plates.
  - `is_unilateral` → for single-sided exercises (left/right distinction needed).

👉 **Operator note**: when adding new exercises, make sure you set the correct equipment and flags so Bro knows how to calculate weights and targets.

---

## 2. Templates
- **Definition**: Predefined workouts (blueprints). Stored in `workout_templates` + `template_exercises`.
- **Template_exercises hold**:
  - `exercise_id` (reference to exercises)
  - `default_sets`, `target_reps`, `target_weight` (baseline)
  - Notes and preferred grips
- Users can select a template to start a workout.

👉 Deleting a template does not affect history. Completed workouts are snapshots (copied into `workout_exercises` + `workout_sets`).

---

## 3. Workouts
- Instance of training started from a template (or empty).
- Stored in `workouts` table with `started_at`, `ended_at`, `user_id`.
- **Linked children**:
  - `workout_exercises` (what exercises were done)
  - `workout_sets` (all sets logged, weights, reps, notes)

👉 **Flow**: Template → Workout copy → User logs sets → Data written in `workout_sets`.

---

## 4. Sets
- Each set is a row in `workout_sets`:
  - `set_index` → number (1, 2, 3…)
  - `weight`, `reps`, `notes`
  - `is_completed`
  - `side` (if unilateral: "left" / "right")
- Related table `workout_set_grips` → tracks which grip(s) were used.

👉 **Unilateral exercises**: Each side is its own row. Example:
- Set 1 left: 20kg × 12
- Set 1 right: 22kg × 12

Both are stored separately under same `set_index`.

---

## 5. Warmups
- Stored as JSON in `workout_exercises.warmup_plan`.
- **Generated**:
  1. From estimates (first-time 10RM input).
  2. From last working sets logged.
  3. Adjusted based on `warmup_feedback`:
     - "not_enough" → Bro increases reps aggressively.
     - "excellent" → keep same.
     - "too_much" → reduce reps/weight.

👉 **Rule**: Warmup always allows 3–5 reps higher than working sets (if target 8–12 reps → warmup 8–15).

---

## 6. Tracking Logic

**First-time exercise**:
- No history? → System asks for user's estimate (10 reps weight).
- Warmup calculated from this estimate.

**Returning exercise**:
- Bro pulls last `workout_sets` for the same `exercise_id` & `set_index`.
- 📜 Previous data displayed in UI:
  - Prev: 60 × 8 😐
- 🎯 Target suggested:
  - Based on rep range, feel feedback, and gym equipment constraints.

**Logging**:
- User enters set → saved in `workout_sets`.
- Bro recalculates `warmup_plan` if needed.
- History saved permanently (deleting template does not break this).

---

## 7. Special Cases
- **Bars**: If `is_barbell_load = true`, user logs one-side load. Bro adds plates × 2 + bar weight.
- **Machines dual/single load**: Similar, based on `is_dual_load` or `is_single_load`.
- **Unilateral**: Add `side` field in set → allows tracking asymmetry (left weaker than right).

---

## 8. Bro Intelligence

Bro uses:
1. **User profile**: sex, focus, prioritized muscles.
2. **Gym config**: available plates, bars, machines.
3. **History**: last sets, feel feedback.
4. **Rules**:
   - Push reps up to rep-range ceiling before adding weight.
   - Never increase if pain is reported.
   - Adjust down during bad readiness check or period-tracking.

---

## 9. Operator Checklist

✅ **When adding new exercise**:
- Correct equipment & flags (bar, dual_load, unilateral).
- Primary/secondary muscles.
- Default grips.

✅ **When debugging workouts**:
- Check if `exercise_id` vs `workout_exercise_id` mix-up exists.
- Verify `set_index` starts at 0 consistently.
- Ensure `warmup_plan` updates after sets.

✅ **When testing**:
- First-time exercise → popup estimate works?
- Second-time → Prev/Target show correctly?
- Warmup feedback adjusts next session?