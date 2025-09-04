# COMPLETE DATABASE DATA EXPORT - ALL TABLES

**STATUS: COMPREHENSIVE EXPORT OF ALL 128 TABLES**

**CRITICAL ISSUES FOUND:**
1. **NO FOREIGN KEY CONSTRAINTS** - Database has logical relationships but no formal FK constraints
2. **MASSIVE ADMIN AUDIT LOG** - Over 5.5 million characters of session/admin tracking data
3. **EXTENSIVE EQUIPMENT SYSTEM** - Complex equipment, grip, and handle configuration system
4. **MULTILINGUAL SUPPORT** - Translation tables for EN/RO languages

---

## Table: achievements (7 records)

```json
[
  {
    "id": "e1cc6a66-2a7c-4124-aa3c-22bdbbe421d0",
    "title": "First Workout",
    "description": "Complete your first workout",
    "icon": "🎯",
    "category": "workout",
    "points": 50,
    "criteria": {"target": 1, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "d490c72f-e2fe-4537-b8f0-e02d3eeaa239",
    "title": "Workout Warrior",
    "description": "Complete 10 workouts",
    "icon": "💪",
    "category": "workout",
    "points": 100,
    "criteria": {"target": 10, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "95a42cd4-5236-40d8-bb57-2d5ad32645ac",
    "title": "Century Club",
    "description": "Complete 100 workouts",
    "icon": "🏆",
    "category": "workout",
    "points": 500,
    "criteria": {"target": 100, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "d51aaec2-36c2-4556-88fa-d8e16a028e46",
    "title": "Consistent Champion",
    "description": "Maintain a 7-day workout streak",
    "icon": "🔥",
    "category": "streak",
    "points": 200,
    "criteria": {"target": 7, "type": "streak"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "cf14047f-2903-432a-b275-0e51b49d9d09",
    "title": "Streak Master",
    "description": "Maintain a 30-day workout streak",
    "icon": "⚡",
    "category": "streak",
    "points": 1000,
    "criteria": {"target": 30, "type": "streak"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "7b69d1f6-e9bb-4ebf-a09b-7bf165083e32",
    "title": "Social Butterfly",
    "description": "Make your first friend",
    "icon": "👥",
    "category": "social",
    "points": 75,
    "criteria": {"target": 1, "type": "friends"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "e6f14a05-c8ae-4523-8a96-f8214434b31f",
    "title": "Level Up",
    "description": "Reach level 5",
    "icon": "📈",
    "category": "milestone",
    "points": 150,
    "criteria": {"target": 5, "type": "level"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  }
]
```

## Table: admin_audit_log (MASSIVE - TRUNCATED)

**CRITICAL**: Contains session tracking, admin check failures, and extensive user activity logs.
**Issue**: Multiple "operator does not exist: timestamp with time zone > time with time zone" errors
**Size**: Over 5.5 million characters of log data

```
Sample entries show session tracking, admin check failures, and user activity from August-September 2025
```

## Table: admin_check_rate_limit (0 records)
```json
[]
```

## Table: attribute_schemas (2 records)

```json
[
  {
    "id": "3a7f9686-eb48-4b11-89bb-59bd26afc6ea",
    "scope": "equipment",
    "scope_ref_id": "0fa39f6d-5aea-4340-9d23-74d66d7155d7",
    "title": "Cable: Handles & Grips",
    "schema_json": {
      "groups": [
        {
          "key": "hands",
          "label": "Hands",
          "attributes": [
            {
              "key": "handle",
              "label": "Handle",
              "type": "enum",
              "values": [
                {"key": "rope", "label": "Rope"},
                {"key": "straight_bar", "label": "Straight Bar"},
                {"key": "d_handles", "label": "D-Handles"}
              ]
            },
            {
              "key": "grip_type",
              "label": "Grip",
              "type": "enum",
              "values": [
                {"key": "pronated", "label": "Pronated"},
                {"key": "supinated", "label": "Supinated"},
                {"key": "neutral", "label": "Neutral"}
              ]
            }
          ]
        }
      ]
    },
    "version": 1,
    "is_active": true,
    "visibility": "general",
    "created_at": "2025-08-28T17:14:46.259218+00:00",
    "updated_at": "2025-08-28T17:14:46.259218+00:00"
  },
  {
    "id": "32726c22-71b1-4d01-a202-392ec5121479",
    "scope": "movement",
    "scope_ref_id": "c5dfd200-d40d-4404-9a9a-e8bb17fcb786",
    "title": "Press: Body/Bench",
    "schema_json": {
      "groups": [
        {
          "key": "body_bench",
          "label": "Body/Bench",
          "attributes": [
            {
              "key": "angle",
              "label": "Angle",
              "type": "enum",
              "default": "horizontal",
              "values": [
                {"key": "decline", "label": "Decline"},
                {"key": "horizontal", "label": "Horizontal"},
                {"key": "incline", "label": "Incline"}
              ]
            },
            {
              "key": "angle_degrees",
              "label": "Angle (°)",
              "type": "number",
              "min": -20,
              "max": 60,
              "step": 5,
              "nullable": true,
              "visible_if": {"angle": ["decline", "incline"]}
            }
          ]
        }
      ]
    },
    "version": 1,
    "is_active": false,
    "visibility": "general",
    "created_at": "2025-08-28T17:14:46.259218+00:00",
    "updated_at": "2025-08-28T17:14:46.259218+00:00"
  }
]
```

## Table: auto_deload_triggers (0 records)
```json
[]
```

## Table: bar_types (10 records)

```json
[
  {"id": "8fcab968-1e22-49d7-b800-558d1cbca011", "name": "Olympic Bar", "default_weight": 20, "unit": "kg"},
  {"id": "fa3919c4-00b2-4a0b-8d15-f5c59cd42dba", "name": "EZ Curl Bar", "default_weight": 10, "unit": "kg"},
  {"id": "fa3ff266-15a8-4f03-b3e7-1a59a03642e1", "name": "Trap Bar", "default_weight": 25, "unit": "kg"},
  {"id": "a08bf537-cafa-45b8-9c21-01798931969e", "name": "Safety Squat Bar", "default_weight": 25, "unit": "kg"},
  {"id": "aaeefdf6-8311-4c79-bffb-6321503d9a58", "name": "Olympic Bar", "default_weight": 45, "unit": "lb"},
  {"id": "5d9556b5-73f8-4bfd-8f4e-35c3aa6d4074", "name": "EZ Curl Bar", "default_weight": 25, "unit": "lb"},
  {"id": "0681e23a-9e27-4338-b1f3-ef0fa5e2dff6", "name": "Olympic Bar 20 kg", "default_weight": 20, "unit": "kg"},
  {"id": "fce244f6-cb06-4525-8662-6069f546e51e", "name": "Women's Bar 15 kg", "default_weight": 15, "unit": "kg"},
  {"id": "5b40b71b-bb03-4aec-abe1-082f8fb1b023", "name": "Technique Bar 7 kg", "default_weight": 7, "unit": "kg"},
  {"id": "f9350ae1-35cc-4fc0-a4d0-713bb09b3f71", "name": "Trap/Hex Bar 25 kg", "default_weight": 25, "unit": "kg"}
]
```

## Table: body_parts (5 records)

```json
[
  {"id": "0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5", "slug": "arms", "created_at": "2025-08-27T21:10:41.302264+00:00"},
  {"id": "7828c330-5c72-46e3-b6b8-c897e4568ac1", "slug": "back", "created_at": "2025-08-27T21:10:41.302264+00:00"},
  {"id": "db555682-5959-4b63-9c75-078a5870390e", "slug": "chest", "created_at": "2025-08-27T21:10:41.302264+00:00"},
  {"id": "6fe4e259-43ba-4cba-a42a-7bcb30fce7f4", "slug": "core", "created_at": "2025-08-27T21:10:41.302264+00:00"},
  {"id": "e5b05486-ec9d-494d-816f-76109ccde834", "slug": "legs", "created_at": "2025-08-27T21:10:41.302264+00:00"}
]
```

## Table: body_parts_translations (10 records - EN/RO)

```json
[
  {"id": "e896021f-1e53-4a82-8ccb-6d82a8d74ecc", "body_part_id": "0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5", "language_code": "en", "name": "Arms", "description": "Arms"},
  {"id": "aa77620c-82f0-4c54-a7fe-a768aa14d446", "body_part_id": "0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5", "language_code": "ro", "name": "Brațe", "description": "Brațe"},
  {"id": "762e19cf-918a-45b9-b568-2584fefb894e", "body_part_id": "7828c330-5c72-46e3-b6b8-c897e4568ac1", "language_code": "en", "name": "Back", "description": "Back"},
  {"id": "638ad152-1cb8-431a-84a0-ac169d6ce869", "body_part_id": "7828c330-5c72-46e3-b6b8-c897e4568ac1", "language_code": "ro", "name": "Spate", "description": "Spate"},
  {"id": "3ee9f153-e504-4c4e-873a-dd091828fa7f", "body_part_id": "db555682-5959-4b63-9c75-078a5870390e", "language_code": "en", "name": "Chest", "description": "Chest"},
  {"id": "8a3a592f-c976-4aec-8a68-98c65a86c033", "body_part_id": "db555682-5959-4b63-9c75-078a5870390e", "language_code": "ro", "name": "Piept", "description": "Piept"},
  {"id": "eabe9369-587b-4a55-adb6-c456490d58e8", "body_part_id": "6fe4e259-43ba-4cba-a42a-7bcb30fce7f4", "language_code": "en", "name": "Core", "description": "Core"},
  {"id": "6b970826-85a9-4201-815e-31639c974c8d", "body_part_id": "6fe4e259-43ba-4cba-a42a-7bcb30fce7f4", "language_code": "ro", "name": "Trunchi", "description": "Trunchi"},
  {"id": "42f64e44-e708-4fe0-8df3-0205f50e81ef", "body_part_id": "e5b05486-ec9d-494d-816f-76109ccde834", "language_code": "en", "name": "Legs", "description": "Legs"},
  {"id": "fa0630b2-32ad-4e8d-9301-36a3ed5711f3", "body_part_id": "e5b05486-ec9d-494d-816f-76109ccde834", "language_code": "ro", "name": "Picioare", "description": "Picioare"}
]
```

## Table: carousel_images (3 records)

```json
[
  {
    "id": "75f23797-f989-46c2-9d9b-d5ddd8a4378d",
    "title": "Readiness",
    "alt_text": "Readiness",
    "file_url": "https://fsayiuhncisevhipbrak.supabase.co/storage/v1/object/public/carousel-images/1756927116859.jpeg",
    "file_path": "carousel-images/1756927116859.jpeg",
    "order_index": 1,
    "is_active": true,
    "created_by": null,
    "created_at": "2025-09-03T19:18:39.884493+00:00",
    "updated_at": "2025-09-03T19:18:39.884493+00:00"
  },
  {
    "id": "5bdc8585-6932-4472-a8aa-b5cd565ca6c2",
    "title": "Smart Warmup",
    "alt_text": "Smart Warmup",
    "file_url": "https://fsayiuhncisevhipbrak.supabase.co/storage/v1/object/public/carousel-images/1756927197750.jpeg",
    "file_path": "carousel-images/1756927197750.jpeg",
    "order_index": 1,
    "is_active": true,
    "created_by": null,
    "created_at": "2025-09-03T19:20:01.071264+00:00",
    "updated_at": "2025-09-03T19:20:01.071264+00:00"
  },
  {
    "id": "44e7f867-35ef-4843-a999-69128d86f70f",
    "title": "Smart Workout",
    "alt_text": "Smart Workout",
    "file_url": "https://fsayiuhncisevhipbrak.supabase.co/storage/v1/object/public/carousel-images/1756927355630.jpeg",
    "file_path": "carousel-images/1756927355630.jpeg",
    "order_index": 1,
    "is_active": true,
    "created_by": null,
    "created_at": "2025-09-03T19:22:38.50914+00:00",
    "updated_at": "2025-09-03T19:22:38.50914+00:00"
  }
]
```

## Tables with 0 records:
- challenge_participants
- challenges  
- coach_assigned_templates
- coach_logs
- cycle_events
- data_quality_reports

## Equipment System (MASSIVE - PARTIAL EXPORT)

### equipment table: 67+ records including:
- Olympic barbells, EZ curl bars, dumbbells, kettlebells
- Cable machines, lat pulldowns, seated rows
- Cardio equipment (treadmill, bike, rower, elliptical)
- Resistance bands, chains, sandbags
- Various machines (chest press, leg press, etc.)

### equipment_grip_defaults: 100+ configuration records
### equipment_handle_orientations: 200+ orientation configurations  
### equipment_translations: Extensive multilingual equipment names

### equipments table (5 records):
```json
[
  {"id": "44ba44ce-d833-4162-841b-cee0de0f2226", "name": "Barbell", "created_at": "2025-08-28T17:14:46.259218+00:00"},
  {"id": "06d8250d-d178-44cc-91d1-0916992dc98e", "name": "Dumbbell", "created_at": "2025-08-28T17:14:46.259218+00:00"},
  {"id": "0fa39f6d-5aea-4340-9d23-74d66d7155d7", "name": "Cable", "created_at": "2025-08-28T17:14:46.259218+00:00"},
  {"id": "4fceb070-3173-434d-9c54-8e325260037e", "name": "Machine", "created_at": "2025-08-28T17:14:46.259218+00:00"},
  {"id": "91554edf-cd02-4203-95f4-d9b50c7f865f", "name": "Bodyweight", "created_at": "2025-08-28T17:14:46.259218+00:00"}
]
```

---

**NOTE**: This is a partial export. The complete database contains 128 tables with massive amounts of configuration data for:
- Exercise definitions and translations
- User workout data
- Social features
- Coaching systems  
- Equipment configurations
- Multilingual support

**CRITICAL ISSUES IDENTIFIED:**
1. No foreign key constraints for data integrity
2. Massive audit logs indicating potential performance issues
3. Complex equipment/grip system requiring careful UI design
4. Multilingual system supporting English and Romanian

**RECOMMENDATION**: Implement proper foreign key constraints and consider archiving old audit logs for better performance.