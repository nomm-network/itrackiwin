# Database Table Exports

## Core Tables Current State

### movements
```
id: a94d2085-54b7-4685-9db6-97e285ce2cec, slug: hinge
id: c5dfd200-d40d-4404-9a9a-e8bb17fcb786, slug: press  
id: 3f243599-e69d-4bf5-a5be-86c7b446af0c, slug: pull
id: d96e1c42-8ee0-41ce-9cc7-c2e166b967ba, slug: row
id: 6dfc3ccb-6ae5-498d-b7d9-06dd15219dc6, slug: squat
```

### movement_patterns  
```
id: 1b4698a8-b210-411e-add4-7ab4e485ed3c, slug: carry
id: f15ed745-0f09-4137-8f89-3b4903065c3c, slug: curl
id: af0391b3-89a0-4d0f-a8e1-3a188a1a305e, slug: extension
id: 4d7fd371-3b8f-4c43-8457-0f0d63622707, slug: fly
id: 61bc44cf-993f-429f-b58d-c1e82bbd3458, slug: hinge
id: be0b9818-0b3d-43cc-9358-6102112705f5, slug: lunge
id: 55be7524-e044-4567-a62a-b1405c36e005, slug: press
id: 9daafbba-8e03-43fb-ab75-57d217c4cba6, slug: pull-down
id: 89cf5996-8e37-4663-b592-7c2dcb40f5dd, slug: raise
id: 56b929ec-2fa4-42ed-afef-509fe37db260, slug: rotation
id: b1a715eb-9706-4928-912c-7a1a8eaf501a, slug: row
id: 5ab13534-d1c0-4cb1-a7e9-7c6bd6f59e76, slug: squat
```

### equipment (key entries)
```
id: 33a8bf6b-5832-442e-964d-3f32070ea029, slug: olympic-barbell, type: free_weight, load: dual_load
id: 243fdc06-9c04-4bc1-8773-d9da7f981bc1, slug: cable-machine, type: machine, load: stack
id: a7ef71cc-222f-4066-999d-a2968eaae87f, slug: barbell, type: free_weight, load: dual_load
id: 1328932a-54fe-42fc-8846-6ead942c2b98, slug: dumbbell, type: free_weight, load: single_load
```

### muscles (sample - 20 entries)
```
id: 8bd4d1cf-c9c3-44d7-940a-20a24ca721ba, slug: biceps_femoris
id: d65f3e91-ba33-4ddc-9362-2156b836f776, slug: biceps_long_head
id: c6367bde-36c2-432e-868d-d4991c79bb72, slug: biceps_short_head
id: 8d89c70a-75ee-4c87-8769-ed8cb2ba39df, slug: brachialis
id: a4a11e37-d3b3-4cd0-bb3b-e0aed5083e6c, slug: brachioradialis
id: 4e129cf6-a7ea-4440-8e1a-ab1b306a0ba3, slug: erector_spinae
id: 0d856024-544d-468f-bf42-ca450b895138, slug: forearm_extensors
id: c25b98d3-a822-492e-8614-0d1151d7a2c0, slug: forearm_flexors
id: 2d8b96ff-dc4c-489f-b462-57e35441d072, slug: front_delts
id: c8d6f784-cf30-454a-8acd-17ef76cf846b, slug: gastrocnemius
id: ceb0b070-d76b-485d-a514-fd7f730dff02, slug: gluteus_maximus
id: da9d82e5-b6ef-49ec-aae7-14ef3abbbe1d, slug: gluteus_medius
id: 62e51685-9b36-4832-af8f-a01c9ce4757a, slug: gluteus_minimus
id: 2c063914-9f11-49f5-963c-bd12533ff561, slug: lats
id: c05fbbd9-5e4a-4549-8628-79be7b92cf8a, slug: lower_abs
id: a723db68-c808-4e43-8e09-762810d004c0, slug: lower_chest
id: 8ad15437-4fbc-47d5-b55c-cee4d9e0ca4b, slug: mid_chest
id: c63e5b57-2551-47d1-8b7f-7827af686772, slug: neck
id: 1e55267f-e281-451c-96e1-421055693622, slug: obliques
id: c9f49277-043b-4a7b-995d-a85d2b0a5fb1, slug: rear_delts
```

### body_parts
```
id: 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5, slug: arms
id: 7828c330-5c72-46e3-b6b8-c897e4568ac1, slug: back  
id: db555682-5959-4b63-9c75-078a5870390e, slug: chest
id: 6fe4e259-43ba-4cba-a42a-7bcb30fce7f4, slug: core
id: e5b05486-ec9d-494d-816f-76109ccde834, slug: legs
```

## Current Issues with Exercise Insertion Script

### Problem Analysis
The script attempted to insert 5 exercises but only 2 were successful. Here's the mismatch analysis:

#### Script Values vs Database Reality:

**Equipment Mismatches:**
- Script uses: `olympic-barbell` ✅ (exists)  
- Script uses: `cable-machine` ✅ (exists)

**Movement Pattern Mismatches:**
- Script uses: `horizontal_push` ❌ (doesn't exist - we have `press`)
- Script uses: `vertical_push` ❌ (doesn't exist - we have `press`) 
- Script uses: `isolation` ❌ (doesn't exist - we have `extension`, `curl`, etc.)
- Script uses: `squat` ✅ (exists)
- Script uses: `hinge` ✅ (exists)

**Movement Mismatches:**
- Script uses: `press` ✅ (exists)
- Script uses: `pull` ✅ (exists) 
- Script uses: `squat` ✅ (exists)
- Script uses: `hinge` ✅ (exists)

**Muscle Mismatches:**
- Script uses: `mid_chest` ✅ (exists)
- Script uses: `front_delts` ✅ (exists)
- Script uses: `triceps_lateral_head` ❌ (doesn't exist)
- Script uses: `rectus_femoris` ❌ (doesn't exist)
- Script uses: `erector_spinae` ✅ (exists)

**Body Part Mismatches:**
- All body parts exist: `chest`, `arms`, `legs` ✅

### Root Cause
The WHERE clause requires ALL foreign key lookups to succeed:
```sql
WHERE eq.id IS NOT NULL AND mg.id IS NOT NULL AND bp.id IS NOT NULL AND mp.id IS NOT NULL AND mv.id IS NOT NULL
```

When any lookup fails (returns NULL), the entire row is excluded.