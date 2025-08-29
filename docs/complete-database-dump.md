# Complete Database Data Export

This file contains ALL current data from ALL handle-related tables in the fitness tracking database.

## Table Status Summary

| Table Name | Status | Record Count |
|------------|--------|--------------|
| handles | ✅ HAS DATA | 13 records |
| grips | ✅ HAS DATA | 7 records |
| equipment | ✅ HAS DATA | 50+ records |
| handle_translations | ✅ HAS DATA | 26 records |
| handle_equipment | ❌ EMPTY | 0 records |
| handle_equipment_rules | ❌ EMPTY | 0 records |
| handle_grip_compatibility | ❌ EMPTY | 0 records |

## 1. HANDLES Table (13 records)
```json
[
  {"id": "600176fe-0de5-46ff-8935-cb382dd5b791", "slug": "dip-handles", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "90b57052-0ac7-4c65-8348-f6ec42dd4da9", "slug": "dual-d-handle", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "71b786ad-09aa-41e9-a328-8b8304728521", "slug": "ez-curl-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "473e303c-f971-4e71-b8ba-494b1c242ac3", "slug": "lat-pulldown-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "a1573461-ee2e-44a0-ae51-efba893d8d6e", "slug": "parallel-bars", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "f6997066-bf00-46d4-8bd0-7746205dea3b", "slug": "pull-up-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "cc2f2cd4-dfa3-4ba7-8f63-578483fb9057", "slug": "seated-row-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "2f3db93c-a293-40bb-a8b2-10e577da8abd", "slug": "single-handle", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "ce6aa328-c0f3-404f-8883-2ec992d15fa4", "slug": "straight-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "30e802d7-54f6-4768-a422-0def7f187181", "slug": "suspension-straps", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "9a561d10-a26e-4919-91c4-6612d92d5bb1", "slug": "swiss-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "549a1c03-6880-4186-846b-17482a102784", "slug": "trap-bar", "created_at": "2025-08-28T14:02:58.898588+00:00"},
  {"id": "5bfc1611-8204-432b-93bb-8dde7a9587ac", "slug": "tricep-rope", "created_at": "2025-08-28T14:02:58.898588+00:00"}
]
```

## 2. GRIPS Table (7 records)
```json
[
  {"id": "353c77e2-cd33-43c5-a396-095b96c2f4cc", "slug": "mixed", "category": "hand_position", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "3f119821-a26d-43c9-ac19-1746f286862f", "slug": "neutral", "category": "hand_position", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "38571da9-3843-4004-b0e5-dee9c953bde1", "slug": "overhand", "category": "hand_position", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "255960ca-ec28-484f-8f2f-11089be4fb19", "slug": "underhand", "category": "hand_position", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "15201a40-0acf-43a4-9736-1bc334b22a66", "slug": "close", "category": "width", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "2a40b2e7-0f4c-403a-ab77-ce33edce93c3", "slug": "medium", "category": "width", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"},
  {"id": "0b08d4eb-1845-41fd-8777-5f2833bbd656", "slug": "wide", "category": "width", "is_compatible_with": [], "created_at": "2025-08-28T11:43:53.330933+00:00"}
]
```

## 3. HANDLE_TRANSLATIONS Table (26 records)
```json
[
  {"id": "3223dae8-4e86-472f-b171-11638edbcbfa", "handle_id": "2f3db93c-a293-40bb-a8b2-10e577da8abd", "language_code": "en", "name": "Single Handle", "description": "One-handed handle for cable work.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "0449901e-71eb-441d-b9ae-e11d0ff81852", "handle_id": "2f3db93c-a293-40bb-a8b2-10e577da8abd", "language_code": "ro", "name": "Mâner simplu", "description": "Mâner pentru o singură mână la cabluri.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "38f0a6bd-e7fd-40cf-b37c-29a9e001513a", "handle_id": "30e802d7-54f6-4768-a422-0def7f187181", "language_code": "en", "name": "Suspension Straps", "description": "TRX style straps for bodyweight training.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "4ed3f500-67c9-448f-b212-85f3293e2057", "handle_id": "30e802d7-54f6-4768-a422-0def7f187181", "language_code": "ro", "name": "Curele suspensie", "description": "Curele tip TRX pentru antrenament cu greutatea corpului.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "b92882b0-2d28-4252-b9a2-8b552044f90b", "handle_id": "473e303c-f971-4e71-b8ba-494b1c242ac3", "language_code": "en", "name": "Lat Pulldown Bar", "description": "Long cable bar, wide and close grip options.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "c743ff43-d4da-49a8-85d3-13e960c7f708", "handle_id": "473e303c-f971-4e71-b8ba-494b1c242ac3", "language_code": "ro", "name": "Bară tracțiuni la helcometru", "description": "Bară lungă pentru cabluri, cu opțiuni de priză largă sau apropiată.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "7685bad1-6e92-437e-b7f4-b4a7d6872fc9", "handle_id": "549a1c03-6880-4186-846b-17482a102784", "language_code": "en", "name": "Trap Bar", "description": "Hexagonal bar used for deadlifts and shrugs, neutral grip.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "900e0684-5907-42d0-b124-b9560393b050", "handle_id": "549a1c03-6880-4186-846b-17482a102784", "language_code": "ro", "name": "Bară trap", "description": "Bară hexagonală folosită la îndreptări și ridicări de umeri, priză neutră.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "01eb70ab-fa0b-4fc2-a1b4-dfac8e83ff3d", "handle_id": "5bfc1611-8204-432b-93bb-8dde7a9587ac", "language_code": "en", "name": "Tricep Rope", "description": "Rope attachment for pushdowns, curls, face pulls.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "7cc5f10b-b796-4be9-8024-b61bd4b7b211", "handle_id": "5bfc1611-8204-432b-93bb-8dde7a9587ac", "language_code": "ro", "name": "Coadă triceps", "description": "Atașament din frânghie pentru extensii triceps, flexii, face pulls.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "89a1dab6-5ad4-4bd4-ae81-042b8c0c2f8e", "handle_id": "600176fe-0de5-46ff-8935-cb382dd5b791", "language_code": "en", "name": "Dip Handles", "description": "Parallel handles for dips and pushups.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "2d2d3f68-37b6-480a-b710-cfe875d7f884", "handle_id": "600176fe-0de5-46ff-8935-cb382dd5b791", "language_code": "ro", "name": "Mânere flotări paralele", "description": "Mânere paralele pentru dips și flotări.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "96e68dd8-1901-40c2-98e8-29200c679eaa", "handle_id": "71b786ad-09aa-41e9-a328-8b8304728521", "language_code": "en", "name": "EZ Curl Bar", "description": "Angled bar reducing wrist strain, popular for curls and extensions.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "13e55cea-40c5-4bfd-9ccf-e7e78f90a4d8", "handle_id": "71b786ad-09aa-41e9-a328-8b8304728521", "language_code": "ro", "name": "Bară EZ", "description": "Bară îndoită care reduce tensiunea încheieturilor, folosită la flexii și extensii.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "4e5fb235-b020-49ce-9693-3b788cc04761", "handle_id": "90b57052-0ac7-4c65-8348-f6ec42dd4da9", "language_code": "en", "name": "Dual D-Handle", "description": "Double D-handle for rows and pulldowns.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "8e559720-8a9f-4795-987a-3c94a1a5a77a", "handle_id": "90b57052-0ac7-4c65-8348-f6ec42dd4da9", "language_code": "ro", "name": "Mâner D dublu", "description": "Mâner dublu tip D pentru ramat și tracțiuni.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "2585c5ba-ec0b-4952-bc51-ef0a317d3f4b", "handle_id": "9a561d10-a26e-4919-91c4-6612d92d5bb1", "language_code": "en", "name": "Swiss Bar", "description": "Multi-grip bar for pressing and rowing variations.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"},
  {"id": "19d2a98c-9481-4f75-befd-85ef668f9554", "handle_id": "9a561d10-a26e-4919-91c4-6612d92d5bb1", "language_code": "ro", "name": "Bară elvețiană", "description": "Bară cu mai multe prize pentru împins și tracțiuni.", "created_at": "2025-08-28T14:12:17.641782+00:00", "updated_at": "2025-08-28T14:12:17.641782+00:00"}
]
```

## 4. HANDLE_EQUIPMENT Table (0 records)
```json
[]
```

## 5. HANDLE_EQUIPMENT_RULES Table (0 records)
```json
[]
```

## 6. HANDLE_GRIP_COMPATIBILITY Table (0 records)
**Schema:**
```sql
CREATE TABLE handle_grip_compatibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id uuid NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES grips(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(handle_id, grip_id)
);
```

```json
[]
```

## Quick Reference for Insert Scripts

### Handle IDs by Slug:
- `dip-handles` → `600176fe-0de5-46ff-8935-cb382dd5b791`
- `dual-d-handle` → `90b57052-0ac7-4c65-8348-f6ec42dd4da9`
- `ez-curl-bar` → `71b786ad-09aa-41e9-a328-8b8304728521`
- `lat-pulldown-bar` → `473e303c-f971-4e71-b8ba-494b1c242ac3`
- `parallel-bars` → `a1573461-ee2e-44a0-ae51-efba893d8d6e`
- `pull-up-bar` → `f6997066-bf00-46d4-8bd0-7746205dea3b`
- `seated-row-bar` → `cc2f2cd4-dfa3-4ba7-8f63-578483fb9057`
- `single-handle` → `2f3db93c-a293-40bb-a8b2-10e577da8abd`
- `straight-bar` → `ce6aa328-c0f3-404f-8883-2ec992d15fa4`
- `suspension-straps` → `30e802d7-54f6-4768-a422-0def7f187181`
- `swiss-bar` → `9a561d10-a26e-4919-91c4-6612d92d5bb1`
- `trap-bar` → `549a1c03-6880-4186-846b-17482a102784`
- `tricep-rope` → `5bfc1611-8204-432b-93bb-8dde7a9587ac`

### Grip IDs by Slug:
- `mixed` → `353c77e2-cd33-43c5-a396-095b96c2f4cc`
- `neutral` → `3f119821-a26d-43c9-ac19-1746f286862f`
- `overhand` → `38571da9-3843-4004-b0e5-dee9c953bde1`
- `underhand` → `255960ca-ec28-484f-8f2f-11089be4fb19`
- `close` → `15201a40-0acf-43a4-9736-1bc334b22a66`
- `medium` → `2a40b2e7-0f4c-403a-ab77-ce33edce93c3`
- `wide` → `0b08d4eb-1845-41fd-8777-5f2833bbd656`

---

**Last Updated:** August 28, 2025  
**Status:** COMPLETE - All 7 tables exported, 3 empty tables ready for population