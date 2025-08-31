# COMPLETE WORKOUT DATABASE EXPORT

## Current Active Workout (Full Data)

### Workout Record
```json
{
  "id": "bc0d8632-fff4-4b71-8b5a-30f1026ae383",
  "user_id": "f3024241-c467-4d6a-8315-44928316cfa9", 
  "title": "Push Day",
  "started_at": "2025-08-31T15:43:59.344016+00:00",
  "ended_at": null,
  "session_unit": "kg",
  "notes": null,
  "estimated_duration_minutes": null,
  "total_duration_seconds": null,
  "perceived_exertion": null,
  "created_at": "2025-08-31T15:43:59.344016+00:00"
}
```

### Workout Exercise Record  
```json
{
  "id": "7e9936d3-e641-44a6-bb06-0cf76a1694bb",
  "workout_id": "bc0d8632-fff4-4b71-8b5a-30f1026ae383",
  "exercise_id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
  "order_index": 0,
  "target_sets": 3,
  "target_weight_kg": null,
  "grip_ids": null,
  "grip_key": null,
  "handle_id": null,
  "bar_type_id": null,
  "selected_bar_id": null,
  "load_type": null,
  "load_entry_mode": null,
  "weight_input_mode": "per_side",
  "per_side_weight": null,
  "display_name": null,
  "notes": null,
  "target_origin": null,
  "group_id": null,
  "is_superset_group": null,
  "warmup_plan": {
    "base_weight": 60,
    "est_minutes": 3,
    "steps": [
      {
        "id": "W1",
        "percent": 0.4166666666666667,
        "reps": 10,
        "restSec": 60,
        "rest_sec": 60
      },
      {
        "id": "W2", 
        "percent": 0.5833333333333334,
        "reps": 8,
        "restSec": 90,
        "rest_sec": 90
      },
      {
        "id": "W3",
        "percent": 0.7916666666666666,
        "reps": 5,
        "restSec": 120,
        "rest_sec": 120
      }
    ],
    "strategy": "ramped"
  },
  "warmup_quality": null,
  "warmup_feedback": "excellent",
  "warmup_feedback_at": "2025-08-31T15:51:02.050000+00:00",
  "warmup_snapshot": null,
  "warmup_updated_at": "2025-08-31T17:08:49.652000+00:00"
}
```

### Workout Sets
**CRITICAL: NO SETS EXIST** - All attempts to create sets fail due to database trigger conflicts.

```json
[]
```

## Exercise Data (Complete)

### Exercise Record
```json
{
  "id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
  "slug": "upper-chest-press-machine",
  "display_name": "Upper Chest Press (Machine)",
  "custom_display_name": "Upper Chest Press (Machine)",
  "owner_user_id": null,
  "is_public": true,
  "created_at": "2025-08-30T12:34:53.631752+00:00",
  "popularity_rank": 85,
  "body_part_id": "db555682-5959-4b63-9c75-078a5870390e",
  "primary_muscle_id": "1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e",
  "equipment_id": "5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0",
  "secondary_muscle_group_ids": [
    "d49325b3-9d8a-4833-9b8f-12bd1fc54a9f",
    "77919287-d5dd-454f-8760-c9c9322c4533"
  ],
  "default_grip_ids": [
    "38571da9-3843-4004-b0e5-dee9c953bde1",
    "3f119821-a26d-43c9-ac19-1746f286862f"
  ],
  "capability_schema": {},
  "exercise_skill_level": "low",
  "complexity_score": 3,
  "contraindications": [],
  "default_bar_weight": null,
  "default_handle_ids": null,
  "is_bar_loaded": false,
  "load_type": "dual_load",
  "default_bar_type_id": null,
  "requires_handle": false,
  "allows_grips": true,
  "is_unilateral": false,
  "attribute_values_json": {},
  "source_url": null,
  "loading_hint": "total",
  "tags": ["machine", "press", "chest"],
  "thumbnail_url": null,
  "image_url": null,
  "movement_id": "0c64f081-5cb8-4682-8395-315d5533362c",
  "equipment_ref_id": null,
  "movement_pattern_id": "02024706-63ca-4f34-a4d6-7df57a6d6899",
  "name_locale": "en",
  "name_version": 1,
  "display_name_tsv": "'chest':2 'machine':4 'press':3 'upper':1"
}
```

### Exercise Translation
```json
{
  "id": "0a95458b-3c2c-4155-b276-616cee78bf29",
  "exercise_id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
  "language_code": "en",
  "name": "Upper Chest Press (Machine)",
  "description": "Machine press targeting the upper chest with neutral and overhand grips.234",
  "created_at": "2025-08-30T12:34:53.631752+00:00",
  "updated_at": "2025-08-31T15:39:21.471027+00:00"
}
```

## Grips Data (Complete System)

### All Grips (Core Data)
```json
[
  {
    "id": "353c77e2-cd33-43c5-a396-095b96c2f4cc",
    "slug": "mixed",
    "category": "hand_position",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  },
  {
    "id": "3f119821-a26d-43c9-ac19-1746f286862f", 
    "slug": "neutral",
    "category": "hand_position",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  },
  {
    "id": "38571da9-3843-4004-b0e5-dee9c953bde1",
    "slug": "overhand", 
    "category": "hand_position",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  },
  {
    "id": "255960ca-ec28-484f-8f2f-11089be4fb19",
    "slug": "underhand",
    "category": "hand_position", 
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  }
]
```

### Complete Grip Translations (All Languages)
```json
[
  // OVERHAND GRIP
  {
    "grip_id": "38571da9-3843-4004-b0e5-dee9c953bde1",
    "language_code": "en",
    "name": "Overhand",
    "description": "Pronated grip. Common on rows, pulldowns, pull-ups. Puts more load on upper back/forearms."
  },
  {
    "grip_id": "38571da9-3843-4004-b0e5-dee9c953bde1",
    "language_code": "ro", 
    "name": "Priză pronată",
    "description": "Priză pronată. Folosită la ramat, tracțiuni/pulldown; mai mult accent pe spate superior/antebrațe."
  },
  
  // UNDERHAND GRIP
  {
    "grip_id": "255960ca-ec28-484f-8f2f-11089be4fb19",
    "language_code": "en",
    "name": "Underhand (Supinated)",
    "description": "Supinated grip. Favors biceps involvement and lower lats on pulls."
  },
  {
    "grip_id": "255960ca-ec28-484f-8f2f-11089be4fb19",
    "language_code": "ro",
    "name": "Priză supinată", 
    "description": "Priză supinată. Implică mai mult bicepsul și lats inferior la tracțiuni/pulldown."
  },
  
  // NEUTRAL GRIP
  {
    "grip_id": "3f119821-a26d-43c9-ac19-1746f286862f",
    "language_code": "en",
    "name": "Neutral (Hammer)",
    "description": "Thumbs-facing grip (hammer). Joint-friendly; hits brachioradialis well."
  },
  {
    "grip_id": "3f119821-a26d-43c9-ac19-1746f286862f",
    "language_code": "ro",
    "name": "Priză neutră (ciocan)",
    "description": "Priză neutră (palmele față în față). Mai blândă pentru articulații; lucrează bine brahioradialul."
  },
  
  // MIXED GRIP
  {
    "grip_id": "353c77e2-cd33-43c5-a396-095b96c2f4cc",
    "language_code": "en", 
    "name": "Mixed (Alternating)",
    "description": "One hand over, one under. Used mainly on heavy deadlifts for bar security."
  },
  {
    "grip_id": "353c77e2-cd33-43c5-a396-095b96c2f4cc",
    "language_code": "ro",
    "name": "Priză mixtă (alternată)",
    "description": "O mână pronată, una supinată. Folosită la îndreptări grele pentru siguranța barei."
  }
]
```

## Personal Records Data

### Current State
**COMPLETELY EMPTY** - No personal records exist due to database trigger conflicts preventing any set logging.

```json
[]
```

## Database Constraints (Current State)

### Personal Records Table Constraints
```sql
-- Primary Key
personal_records_pkey: PRIMARY KEY (id)

-- Foreign Keys  
personal_records_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
personal_records_exercise_id_fkey: FOREIGN KEY (exercise_id) REFERENCES exercises(id)
personal_records_workout_set_id_fkey: FOREIGN KEY (workout_set_id) REFERENCES workout_sets(id) ON DELETE SET NULL

-- Unique Constraint (CORRECTED)
personal_records_user_ex_kind_grip_unique: UNIQUE (user_id, exercise_id, kind, grip_key)
```

## Database Triggers (PROBLEMATIC STATE)

### Current Triggers on workout_sets
```sql
-- CORRECT TRIGGER (should be only one)
tr_upsert_prs_with_grips_after_set: AFTER INSERT OR UPDATE FOR EACH ROW EXECUTE upsert_prs_with_grips_after_set()

-- BROKEN TRIGGER (causes conflicts)
trg_upsert_prs_after_set: AFTER INSERT OR UPDATE FOR EACH ROW EXECUTE upsert_prs_after_set()

-- DUPLICATE TRIGGER (redundant)
upsert_prs_with_grips_trigger: AFTER INSERT OR UPDATE FOR EACH ROW EXECUTE upsert_prs_with_grips_after_set()
```

## Summary

**Total Workout Records**: 1 (in progress)
**Total Workout Exercises**: 1 (cannot log sets)
**Total Workout Sets**: 0 (all attempts fail)
**Total Personal Records**: 0 (cannot be created)
**Total Grips**: 4 (fully configured)
**Total Grip Translations**: 12 (English + Romanian)

**CRITICAL STATUS**: Complete workout logging system failure due to database trigger conflicts.