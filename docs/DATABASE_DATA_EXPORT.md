# Database Data Export

## Movement Patterns

### movement_patterns Table
| ID | Slug | Created At |
|----|------|------------|
| 5b1a5df2-b9b1-491e-93dc-914896e8eaa3 | carry | 2025-08-30 11:23:52 |
| 5f6e3748-14e6-4537-b76b-4081e7c995f1 | hinge | 2025-08-30 11:23:52 |
| 0155ba5c-99a1-4f29-8561-43489bf72c3d | isolation | 2025-08-30 11:23:52 |
| e75c9e9a-55ef-4cc1-b0b5-dafbd9704a1b | lunge | 2025-08-30 11:23:52 |
| ac7157d7-4324-4a40-b98f-5183e47eed32 | pull | 2025-08-30 11:23:52 |
| 02024706-63ca-4f34-a4d6-7df57a6d6899 | push | 2025-08-30 11:23:52 |
| ec80214a-1697-4f36-ab3b-b5a3b7a0d1d4 | rotation | 2025-08-30 11:23:52 |
| 640e7fb0-6cc5-448a-b822-409f05ee68e9 | squat | 2025-08-30 11:23:52 |

### movement_patterns_translations Table

#### English Translations
| Pattern | Name | Description |
|---------|------|-------------|
| isolation | Isolation | Single-joint movements targeting specific muscles |
| push | Push | Movements that involve pushing weight away from the body |
| carry | Carry | Movements involving carrying or supporting load while moving |
| hinge | Hip Hinge | Hip-dominant movements with hip flexion and extension |
| squat | Squat Pattern | Knee-dominant movements with hip and knee flexion |
| pull | Pull | Movements that involve pulling weight toward the body |
| lunge | Lunge | Single-leg or split-stance movements |
| rotation | Rotation | Movements involving rotation or anti-rotation of the torso |

#### Romanian Translations
| Pattern | Name | Description |
|---------|------|-------------|
| isolation | Izolare | Mișcări cu o singură articulație ce vizează mușchi specifici |
| push | Împingere | Mișcări care implică împingerea greutății departe de corp |
| carry | Transport | Mișcări care implică transportul sau susținerea unei sarcini în timpul deplasării |
| hinge | Balansare Șold | Mișcări dominante pe șold cu flexia și extensia șoldurilor |
| squat | Model Genuflexiune | Mișcări dominante pe genunchi cu flexia șoldurilor și genunchilor |
| pull | Tragere | Mișcări care implică tragerea greutății către corp |
| lunge | Afund | Mișcări pe un picior sau în poziție divizată |
| rotation | Rotație | Mișcări care implică rotația sau anti-rotația trunchiului |

## Movements

### movements Table (Sample - 33 total)
| ID | Slug | Pattern | Created At |
|----|------|---------|------------|
| 8544c519-d504-479f-b0cb-c4812398174a | anti_rotation_press | rotation | 2025-08-30 11:23:52 |
| d73f4fd9-3516-4f87-9129-302af4f8f782 | back_extension | hinge | 2025-08-30 11:23:52 |
| 2b346f38-cdab-45cf-9e89-effe2de0df98 | back_squat | squat | 2025-08-30 11:23:52 |
| 179f6f9d-2df5-406b-902f-ff68c46b85ab | bulgarian_split_squat | lunge | 2025-08-30 11:23:52 |
| c20182f6-c09f-4322-a2e2-c86174728ca4 | curl | isolation | 2025-08-30 11:23:52 |
| 906eb5a8-61cf-43e7-942e-1bc708f6bd90 | deadlift | hinge | 2025-08-30 11:23:52 |
| c13388d5-e568-4166-9081-8b5b4e8ebc53 | dip | push | 2025-08-30 11:23:52 |
| 93a5f251-c95a-416a-bb56-9cb575f17f93 | extension | isolation | 2025-08-30 11:23:52 |
| 81712ddc-6b25-4708-b58f-a0b75f81f1fc | face_pull | pull | 2025-08-30 11:23:52 |
| 603c3b96-05b4-4e7b-b041-e14f8400bc73 | farmer_carry | carry | 2025-08-30 11:23:52 |

## Body Parts

### body_parts Table
| ID | Slug | Created At |
|----|------|------------|
| 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5 | arms | 2025-08-27 21:10:41 |
| 7828c330-5c72-46e3-b6b8-c897e4568ac1 | back | 2025-08-27 21:10:41 |
| db555682-5959-4b63-9c75-078a5870390e | chest | 2025-08-27 21:10:41 |
| 6fe4e259-43ba-4cba-a42a-7bcb30fce7f4 | core | 2025-08-27 21:10:41 |
| e5b05486-ec9d-494d-816f-76109ccde834 | legs | 2025-08-27 21:10:41 |

## Equipment (Sample)

### equipment Table (Sample - 50+ total)
| ID | Slug | Type | Load Type | Load Medium |
|----|------|------|-----------|-------------|
| 0f873cea-c27e-4c76-9711-0591bb577084 | ab-crunch-machine | machine | stack | stack |
| 618fb54e-b2ff-4400-9f26-15aedb05a807 | abductor-machine | machine | stack | stack |
| ddda2b7f-3728-4cfc-8216-1715e4aa899e | adductor-machine | machine | stack | stack |
| a7ef71cc-222f-4066-999d-a2968eaae87f | barbell | free_weight | dual_load | other |
| 243fdc06-9c04-4bc1-8773-d9da7f981bc1 | cable-machine | machine | stack | stack |
| 7af58d6b-1406-4a46-a157-ee98e424d62f | calf-raise-machine | machine | dual_load | plates |
| 4462e023-770b-476d-9eed-7f9d42485ace | chains | free_weight | dual_load | chain |
| 5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0 | chest-press-machine | machine | stack | stack |
| 1328932a-54fe-42fc-8846-6ead942c2b98 | dumbbell | free_weight | single_load | plates |
| 0f22cd80-59f1-4e12-9cf2-cf725f3e4a02 | ez-curl-bar | free_weight | dual_load | bar |

### equipment_translations Table (Sample)

#### English Equipment Names
| Equipment | Name | Description |
|-----------|------|-------------|
| weight-plate | Weight Plate | Additional weight plates for barbells |
| treadmill | Treadmill | Running machine for cardio exercise |
| elliptical | Elliptical | Elliptical trainer for cardio workouts |
| ez-curl-bar | EZ Curl Bar | Angled barbell for bicep and tricep exercises |
| ab-crunch-machine | Ab Crunch Machine | Machine for targeted abdominal crunches |
| dumbbell | Dumbbell | Adjustable or fixed weight dumbbell |
| cable-machine | Cable Machine | Adjustable cable pulley system |
| hip-thrust-machine | Hip Thrust Machine | Machine for hip thrust exercises |
| kettlebell | Kettlebell | Cast iron weight with handle for dynamic exercises |

#### Romanian Equipment Names
| Equipment | Name | Description |
|-----------|------|-------------|
| weight-plate | Discuri de Greutate | Discuri de greutate suplimentare pentru bare |
| treadmill | Banda de Alergare | Mașină de alergare pentru exerciții cardio |
| elliptical | Eliptică | Antrenor eliptic pentru antrenament cardio |
| ez-curl-bar | Bară EZ | Bară unghiulară pentru exerciții biceps și triceps |
| ab-crunch-machine | Mașina de Crunch Abdominal | Mașină pentru crunch-uri abdominale țintite |
| dumbbell | Ganteră | Ganteră cu greutate reglabilă sau fixă |
| cable-machine | Mașina cu Cablu | Sistem de scripete cu cablu reglabil |
| hip-thrust-machine | Mașina Hip Thrust | Mașină pentru exerciții de hip thrust |
| kettlebell | Kettlebell | Greutate din fontă cu mâner pentru exerciții dinamice |

## Recent Database Changes

### Migration Summary (Last 5 migrations)

1. **movement_translations → movements_translations rename** (2025-08-30)
   - Renamed table for consistency with naming convention
   - Updated all references in application code
   - Added proper foreign key constraints

2. **Added movement_patterns_translations** (2025-08-30)
   - Created translation table for movement patterns
   - Added EN and RO translations for all 8 movement patterns
   - Established proper FK relationships

3. **Added movements_translations** (2025-08-30)
   - Created translation table for movements
   - Added EN and RO translations for all 33 movements
   - Linked to movements table via movement_id

4. **Equipment system enhancement** (2025-08-29)
   - Enhanced equipment table with load_type and load_medium enums
   - Added equipment translations for EN and RO
   - Improved equipment categorization

5. **Exercise attribute system** (2025-08-28)
   - Added movement_id and equipment_ref_id to exercises
   - Added attribute_values_json for dynamic properties
   - Prepared for new exercise creation workflow

## Data Statistics

- **Movement Patterns**: 8 patterns with full EN/RO translations
- **Movements**: 33+ movements with full EN/RO translations  
- **Body Parts**: 5 parts (arms, back, chest, core, legs)
- **Equipment**: 50+ equipment types with translations
- **Languages Supported**: English (en), Romanian (ro)
- **Total Translation Records**: 200+ across all tables

## Preparation for Exercise Creation

The database is now ready for exercise creation with:

1. **Complete Movement Hierarchy**: Pattern → Movement mapping
2. **Full Equipment Catalog**: All major gym equipment defined
3. **Internationalization**: Full EN/RO support
4. **Attribute System**: Dynamic exercise properties via JSON
5. **Proper Relationships**: All FK constraints in place
6. **RLS Security**: Access control policies implemented

The admin interface can now create exercises that properly reference:
- Movement patterns and specific movements
- Equipment with proper load types
- Muscle group hierarchies
- Internationalized naming and descriptions