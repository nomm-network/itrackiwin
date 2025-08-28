# Current Database Data Export

This file contains all current data from the handle-related tables in our fitness tracking database.

## Handles Table
*Core handle configurations - different types of equipment attachments and grips*

```json
[
  {
    "id": "600176fe-0de5-46ff-8935-cb382dd5b791",
    "slug": "dip-handles",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "90b57052-0ac7-4c65-8348-f6ec42dd4da9",
    "slug": "dual-d-handle",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "71b786ad-09aa-41e9-a328-8b8304728521",
    "slug": "ez-curl-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "473e303c-f971-4e71-b8ba-494b1c242ac3",
    "slug": "lat-pulldown-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "a1573461-ee2e-44a0-ae51-efba893d8d6e",
    "slug": "parallel-bars",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "f6997066-bf00-46d4-8bd0-7746205dea3b",
    "slug": "pull-up-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "cc2f2cd4-dfa3-4ba7-8f63-578483fb9057",
    "slug": "seated-row-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "2f3db93c-a293-40bb-a8b2-10e577da8abd",
    "slug": "single-handle",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "ce6aa328-c0f3-404f-8883-2ec992d15fa4",
    "slug": "straight-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "30e802d7-54f6-4768-a422-0def7f187181",
    "slug": "suspension-straps",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "9a561d10-a26e-4919-91c4-6612d92d5bb1",
    "slug": "swiss-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "549a1c03-6880-4186-846b-17482a102784",
    "slug": "trap-bar",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  },
  {
    "id": "5bfc1611-8204-432b-93bb-8dde7a9587ac",
    "slug": "tricep-rope",
    "created_at": "2025-08-28T14:02:58.898588+00:00"
  }
]
```

## Grips Table
*Hand positions and grip width options*

```json
[
  {
    "id": "15201a40-0acf-43a4-9736-1bc334b22a66",
    "slug": "close",
    "category": "width",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  },
  {
    "id": "2a40b2e7-0f4c-403a-ab77-ce33edce93c3",
    "slug": "medium",
    "category": "width",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  },
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
  },
  {
    "id": "0b08d4eb-1845-41fd-8777-5f2833bbd656",
    "slug": "wide",
    "category": "width",
    "is_compatible_with": [],
    "created_at": "2025-08-28T11:43:53.330933+00:00"
  }
]
```

## Equipment Table (First 20 entries)
*Exercise equipment with loading characteristics*

```json
[
  {
    "id": "0f873cea-c27e-4c76-9711-0591bb577084",
    "slug": "ab-crunch-machine",
    "equipment_type": "machine",
    "kind": "abs",
    "load_type": "stack",
    "load_medium": "stack",
    "default_single_min_increment_kg": 5,
    "default_stack": [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    "created_at": "2025-08-28T12:49:34.582837+00:00"
  },
  {
    "id": "618fb54e-b2ff-4400-9f26-15aedb05a807",
    "slug": "abductor-machine",
    "equipment_type": "machine",
    "kind": "outer-thigh",
    "load_type": "stack",
    "load_medium": "stack",
    "default_single_min_increment_kg": 5,
    "default_stack": [5, 10, 15, 20, 25, 30, 35, 40, 45],
    "created_at": "2025-08-28T12:49:34.582837+00:00"
  },
  {
    "id": "ddda2b7f-3728-4cfc-8216-1715e4aa899e",
    "slug": "adductor-machine",
    "equipment_type": "machine",
    "kind": "inner-thigh",
    "load_type": "stack",
    "load_medium": "stack",
    "default_single_min_increment_kg": 5,
    "default_stack": [5, 10, 15, 20, 25, 30, 35, 40, 45],
    "created_at": "2025-08-28T12:49:34.582837+00:00"
  },
  {
    "id": "3d8d6ab0-6fd6-4ad0-b654-a07c9e84e5ae",
    "slug": "barbell",
    "equipment_type": "free_weight",
    "kind": "barbell",
    "load_type": "dual_load",
    "load_medium": "bar",
    "default_bar_weight_kg": 20,
    "default_side_min_plate_kg": 1.25,
    "created_at": "2025-08-28T12:49:34.582837+00:00"
  },
  {
    "id": "243fdc06-9c04-4bc1-8773-d9da7f981bc1",
    "slug": "cable-machine",
    "equipment_type": "machine",
    "kind": "cable",
    "load_type": "stack",
    "load_medium": "stack",
    "default_single_min_increment_kg": 5,
    "default_stack": [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    "created_at": "2025-08-28T12:49:34.582837+00:00"
  }
]
```

## Handle Translations Table
*Multilingual names and descriptions for handles*

```json
[
  {
    "id": "3223dae8-4e86-472f-b171-11638edbcbfa",
    "handle_id": "2f3db93c-a293-40bb-a8b2-10e577da8abd",
    "language_code": "en",
    "name": "Single Handle",
    "description": "One-handed handle for cable work.",
    "created_at": "2025-08-28T14:12:17.641782+00:00",
    "updated_at": "2025-08-28T14:12:17.641782+00:00"
  },
  {
    "id": "0449901e-71eb-441d-b9ae-e11d0ff81852",
    "handle_id": "2f3db93c-a293-40bb-a8b2-10e577da8abd",
    "language_code": "ro",
    "name": "Mâner simplu",
    "description": "Mâner pentru o singură mână la cabluri.",
    "created_at": "2025-08-28T14:12:17.641782+00:00",
    "updated_at": "2025-08-28T14:12:17.641782+00:00"
  },
  {
    "id": "38f0a6bd-e7fd-40cf-b37c-29a9e001513a",
    "handle_id": "30e802d7-54f6-4768-a422-0def7f187181",
    "language_code": "en",
    "name": "Suspension Straps",
    "description": "TRX style straps for bodyweight training.",
    "created_at": "2025-08-28T14:12:17.641782+00:00",
    "updated_at": "2025-08-28T14:12:17.641782+00:00"
  },
  {
    "id": "4ed3f500-67c9-448f-b212-85f3293e2057",
    "handle_id": "30e802d7-54f6-4768-a422-0def7f187181",
    "language_code": "ro",
    "name": "Curele suspensie",
    "description": "Curele tip TRX pentru antrenament cu greutatea corpului.",
    "created_at": "2025-08-28T14:12:17.641782+00:00",
    "updated_at": "2025-08-28T14:12:17.641782+00:00"
  },
  {
    "id": "b92882b0-2d28-4252-b9a2-8b552044f90b",
    "handle_id": "473e303c-f971-4e71-b8ba-494b1c242ac3",
    "language_code": "en",
    "name": "Lat Pulldown Bar",
    "description": "Long cable bar, wide and close grip options.",
    "created_at": "2025-08-28T14:12:17.641782+00:00",
    "updated_at": "2025-08-28T14:12:17.641782+00:00"
  }
]
```

## Handle Equipment Table
*Direct handle-to-equipment mappings - CURRENTLY EMPTY*

```json
[]
```

## Handle Equipment Rules Table  
*Rule-based handle-equipment compatibility - CURRENTLY EMPTY*

```json
[]
```

## Handle Grip Compatibility Table
*Which grips can be used with which handles - CURRENTLY EMPTY*

```json
[]
```

---

**Last Updated:** August 28, 2025  
**Total Tables:** 7  
**Tables with Data:** 4 (handles, grips, equipment, handle_translations)  
**Empty Tables:** 3 (handle_equipment, handle_equipment_rules, handle_grip_compatibility)

## Notes

- The handle_equipment and handle_equipment_rules tables are empty, indicating the compatibility mapping system hasn't been populated yet
- The handle_grip_compatibility table is also empty, meaning grip-handle relationships need to be established
- All handles and grips have been created with basic structure
- Handle translations are available in English and Romanian
- Equipment table contains comprehensive fitness equipment with proper loading characteristics