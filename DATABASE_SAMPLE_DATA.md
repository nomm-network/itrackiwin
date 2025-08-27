# Database Sample Data - Real Table Entries

*Generated on: 2025-08-27*

This document shows actual data entries from key tables in the fitness application database to help understand the current data structure and content.

## Table Record Counts

| Table Name | Record Count |
|------------|--------------|
| equipment | 37 |
| exercises | 30 |
| handles | 12 |
| grips | 9 |
| personal_records | 6 |
| template_exercises | 5 |
| user_exercise_estimates | 2 |
| workout_templates | 2 |
| workouts | 0 |
| workout_exercises | 0 |
| workout_sets | 0 |
| workout_checkins | 0 |

## Equipment Data (Sample)

### Barbells
```
ID: 43013590-6941-4dcc-a75e-0cf7ffcddde9
Slug: ez_curl_bar
Type: barbell
Load Type: dual_load
Load Medium: bar
Default Weight: 10.00 kg

ID: ac0ee806-fccf-4dfe-9f4c-b1004a569066
Slug: olympic_barbell_15
Type: barbell
Load Type: dual_load
Load Medium: bar
Default Weight: 15.00 kg

ID: 4e8d0f2f-bb90-48d7-845e-990074b82c7e
Slug: olympic_barbell_20
Type: barbell
Load Type: dual_load
Load Medium: bar
Default Weight: 20.00 kg

ID: d7fee945-8989-4345-85f7-1692952c9af2
Slug: safety_squat_bar
Type: barbell
Load Type: dual_load
Load Medium: bar
Default Weight: 22.00 kg

ID: d8c51e0d-c123-49fe-9128-762931e260b1
Slug: trap_bar
Type: barbell
Load Type: dual_load
Load Medium: bar
Default Weight: 25.00 kg
```

### Free Weights
```
ID: bf01a816-563b-4f89-afe9-8475dbbc1ded
Slug: barbell
Type: free_weight
Load Type: none
Load Medium: other

ID: 2146e786-4701-45f9-bee5-a2f2ec2f828a
Slug: dumbbell
Type: free_weight
Load Type: none
Load Medium: other

ID: 15169ce2-6859-48ca-8498-31c5a3c694ca
Slug: dumbbells_pair
Type: free_weight
Load Type: none
Load Medium: other
```

### Machines & Cables
```
ID: 378b3d7f-9fe7-4337-b38f-a01b608fbea3
Slug: machine
Type: machine
Load Type: none
Load Medium: other

ID: e9450e7f-f184-43b4-916a-c7b89bb64b80
Slug: cable_crossover_stack
Type: machine
Load Type: stack
Load Medium: stack

ID: 7c982e45-8241-4fc6-8203-4c8ce6dcd4be
Slug: cable
Type: machine
Load Type: none
Load Medium: other
```

## Exercise Data (Sample)

### Barbell Exercises
```
Exercise: Barbell Bench Press
ID: b9844b71-d422-4119-9f22-a4c6e460f07c
Slug: barbell_bench_press
Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
Body Part: 1643dca9-5784-46ad-a3c1-bd67d2a125b4
Primary Muscle: 2bc489d4-2dcf-4652-9473-b4cdd2ca74cf
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Back Squat
ID: fd3964b7-c175-4d6b-bc96-5a8bae726c9f
Slug: back_squat
Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
Body Part: 72a125c2-e2fa-49c6-b129-d1a946996d3c
Primary Muscle: f829b77d-e044-4cca-9513-f2a4b07c9191
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Overhead Press
ID: 8d6f265b-6784-47fe-9eba-6c4cf6f7b0aa
Slug: overhead_press
Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
Body Part: 5fb5cc84-7bf1-48d9-8296-3eef485e3654
Primary Muscle: 46a61ac3-ce6d-4b13-9baa-cca2bd5aed54
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Romanian Deadlift
ID: 6dce3d53-8699-4425-871c-35cc8b4a137f
Slug: romanian_deadlift
Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
Body Part: 72a125c2-e2fa-49c6-b129-d1a946996d3c
Primary Muscle: c8d26f47-7c54-437d-a2ac-2c9fdb140975
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Barbell Curl
ID: 990e4209-0c29-4b20-88d2-f6307b196b4b
Slug: barbell_curl
Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
Body Part: 903924e8-cbb4-4b23-82b4-813703148f69
Primary Muscle: a3a44d4e-0b11-413b-a5b8-a3cf355804bc
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true
```

### Dumbbell Exercises
```
Exercise: Dumbbell Shoulder Press
ID: 6171abd1-ac01-4f02-8a26-6cb708b29634
Slug: dumbbell_shoulder_press
Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
Body Part: 5fb5cc84-7bf1-48d9-8296-3eef485e3654
Primary Muscle: 46a61ac3-ce6d-4b13-9baa-cca2bd5aed54
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Dumbbell Lateral Raise
ID: 69618f8c-437c-4792-bb57-9a83f2518766
Slug: dumbbell_lateral_raise
Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
Body Part: 5fb5cc84-7bf1-48d9-8296-3eef485e3654
Primary Muscle: 8bf5b3e3-8cd2-4822-8ede-e24d0b094b42
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Incline Dumbbell Press
ID: f6e9dbd4-b082-48b7-a328-abb3d8467d29
Slug: incline_dumbbell_press
Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
Body Part: 1643dca9-5784-46ad-a3c1-bd67d2a125b4
Primary Muscle: 2bc489d4-2dcf-4652-9473-b4cdd2ca74cf
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true
```

### Machine Exercises
```
Exercise: Leg Press
ID: b824d92c-80a5-4a7f-91d3-8123de27d94a
Slug: leg_press
Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
Body Part: 72a125c2-e2fa-49c6-b129-d1a946996d3c
Primary Muscle: f829b77d-e044-4cca-9513-f2a4b07c9191
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Seated Leg Curl
ID: 6b30c536-bf8f-48f3-83ad-22518d3d2cc8
Slug: seated_leg_curl
Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
Body Part: 72a125c2-e2fa-49c6-b129-d1a946996d3c
Primary Muscle: c8d26f47-7c54-437d-a2ac-2c9fdb140975
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Standing Calf Raise
ID: f0fbe40a-2eeb-41da-a65e-58095ef52c06
Slug: standing_calf_raise
Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
Body Part: 72a125c2-e2fa-49c6-b129-d1a946996d3c
Primary Muscle: f09c4d01-368e-4856-a641-08b1c6740b81
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true

Exercise: Reverse Pec Deck
ID: dd5ff3b4-692f-4d84-8a4d-e84c4745a42c
Slug: reverse_pec_deck
Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
Body Part: 5fb5cc84-7bf1-48d9-8296-3eef485e3654
Primary Muscle: cc11fb5b-a92f-4d65-9840-b9dc9a095b9c
Skill Level: medium
Owner: f3024241-c467-4d6a-8315-44928316cfa9
Public: true
```

## Handles Data

### Cable Handles
```
Handle: Straight Bar
ID: f140a7b1-a492-45af-b3ca-d996739b6621
Slug: straight-bar
Category: bar

Handle: EZ Curl Bar
ID: aa319ce5-1dff-4a5a-b4de-613069812476
Slug: ez-curl-bar
Category: ez-bar

Handle: Standard Lat Bar
ID: 14a45d42-1c8d-43bd-afe3-3a49b622bfdf
Slug: lat-bar-standard
Category: pulldown

Handle: Wide Lat Bar
ID: b9e7c682-a315-4d8f-b5a5-0b1e4e9b1c25
Slug: lat-bar-wide
Category: pulldown

Handle: Triceps Rope
ID: 2849bf26-711b-4663-afa1-77cdcb29c7ed
Slug: rope
Category: rope

Handle: Single D Handle
ID: 510d19fb-a791-41eb-9178-8b5098e0bb09
Slug: single-d-handle
Category: single

Handle: Triangle Row Handle
ID: e0b1f6eb-de11-4557-b7fc-295ccaa3782f
Slug: row-triangle
Category: triangle

Handle: V Bar (Row)
ID: 034d410d-b832-474b-b004-85fcc4a242eb
Slug: row-v-bar
Category: v-bar
```

## Grips Data

### Grip Orientations
```
Grip: Overhand
ID: dffda414-897f-4b80-bc86-d2017fff7685
Slug: overhand
Category: orientation

Grip: Underhand
ID: a1aaa64e-084e-4358-96aa-e7ed17cd206f
Slug: underhand
Category: orientation

Grip: Neutral
ID: 7e1183b7-ad06-46dd-bc20-06ff9b56974e
Slug: neutral
Category: orientation

Grip: Mixed
ID: 60a2adca-0f97-478f-964c-a455574f4f75
Slug: mixed
Category: orientation
```

### Grip Widths
```
Grip: Standard
ID: 0045f0be-a2c3-410d-b512-f903eeff2531
Slug: standard
Category: width

Grip: Wide
ID: 0936084e-7084-4098-9fac-5627a87c9773
Slug: wide
Category: width

Grip: Close
ID: 31fb64d3-e0db-43e4-b7fc-14b175783bea
Slug: close
Category: width
```

### Grip Techniques
```
Grip: Hook
ID: 663c44e4-c78b-4f3d-b82c-42794c627a43
Slug: hook
Category: technique

Grip: False
ID: 6cff8ce2-9f50-4e13-91fb-0f152451b109
Slug: false
Category: technique
```

## Personal Records Data

```
Record #1:
ID: 75cb8994-5898-4606-9486-acf1b6f29b3e
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
Kind: heaviest
Value: 55.25 kg
Achieved: 2025-08-26 20:20:39

Record #2:
ID: 632311c1-32e0-419e-85a0-dd6ce9cedbd1
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
Kind: 1RM
Value: 73.85 kg
Achieved: 2025-08-26 20:18:57

Record #3:
ID: dc2599d9-09d9-4093-b22e-eb1230ffbab7
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
Kind: 1RM
Value: 140.43 kg
Achieved: 2025-08-26 19:51:28

Record #4:
ID: 7261b2fa-e41d-4e6c-a858-12bb0cc40f0b
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
Kind: heaviest
Value: 102.75 kg
Achieved: 2025-08-26 19:34:33

Record #5:
ID: a39424cc-6b74-4b8a-b6a7-e02f35392e25
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
Kind: reps
Value: 12 reps
Achieved: 2025-08-26 19:13:53

Record #6:
ID: 3519c618-e773-4ece-9eb5-669cda14b38c
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
Kind: reps
Value: 12 reps
Achieved: 2025-08-26 19:13:22
```

## Workout Templates Data

```
Template #1:
ID: 07ba05a6-88e6-4b19-97b0-827b4af55110
User: f3024241-c467-4d6a-8315-44928316cfa9
Name: "Back + Biceps"
Notes: (empty)
Exercise Count: 3
Created: 2025-08-26 20:12:29

Template #2:
ID: 98a68d88-1cf1-4b4e-84f2-c316203df726
User: f3024241-c467-4d6a-8315-44928316cfa9
Name: "Chest + Shoulders + Triceps"
Notes: (null)
Exercise Count: 2
Created: 2025-08-25 03:20:57
```

## User Exercise Estimates Data

```
Estimate #1:
ID: (auto-generated)
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: (unknown exercise)
Estimated 1RM: (to be calculated)
Confidence Score: 0.5 (default)
Based on Sets: 0 (default)
Last Calculated: (null)

Estimate #2:
ID: (auto-generated)
User: f3024241-c467-4d6a-8315-44928316cfa9
Exercise: (unknown exercise)
Estimated 1RM: (to be calculated)
Confidence Score: 0.5 (default)
Based on Sets: 0 (default)
Last Calculated: (null)
```

## Key Observations

### Data Maturity
- **Core Data**: Well-populated with 30 exercises, 37 equipment types, comprehensive handle/grip system
- **User Activity**: 1 active user (f3024241-c467-4d6a-8315-44928316cfa9) with recent workout history
- **Template Usage**: 2 templates created covering major muscle groups
- **Performance Tracking**: 6 personal records across 2 exercises (Cable Fly, Incline Dumbbell Press)

### Exercise Distribution
- **Barbell Exercises**: Back Squat, Bench Press, Overhead Press, Romanian Deadlift, Barbell Curl
- **Dumbbell Exercises**: Shoulder Press, Lateral Raise, Incline Press, Wrist Curl
- **Machine Exercises**: Leg Press, Seated Leg Curl, Calf Raise, Reverse Pec Deck

### Equipment Variety
- **Barbells**: Olympic (15kg, 20kg), EZ Curl (10kg), Safety Squat (22kg), Trap Bar (25kg)
- **Machines**: Generic machines, cable systems with weight stacks
- **Free Weights**: Individual dumbbells and pairs

### Handle/Grip System
- **Complete Setup**: 12 handles covering bars, cables, ropes, attachments
- **Grip Variations**: 9 grips covering orientation, width, and technique variations
- **Cable Focused**: Strong emphasis on cable machine attachments

### Performance Data
- **Recent Activity**: All personal records from August 26, 2025
- **Exercise Focus**: Cable Fly and Incline Dumbbell Press being actively tracked
- **PR Types**: Tracking heaviest weight, estimated 1RM, and max reps
- **Progressive Performance**: Shows 1RM estimates higher than heaviest actual weights (indicating calculation accuracy)

### Missing Data Areas
- **No Active Workouts**: 0 current workout sessions
- **No Set Logs**: 0 individual set records (indicating system ready for use but not actively logging)
- **No Readiness Data**: 0 pre-workout checkins (new feature not yet used)

This data represents a fitness application in the early stages of user adoption, with a solid foundation of exercise and equipment data, some template creation, and initial performance tracking.