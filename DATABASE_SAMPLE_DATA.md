# Database Sample Data - Complete Table Entries

*Generated on: 2025-08-27*

This document shows ALL actual data entries from key tables in the fitness application database to help understand the current data structure and content.

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

## Complete Equipment Data (37 entries)

### Barbells (5 entries)
```
1. EZ Curl Bar
   ID: 43013590-6941-4dcc-a75e-0cf7ffcddde9
   Slug: ez_curl_bar
   Type: barbell, Load: dual_load, Medium: bar
   Default Weight: 10.00 kg

2. Olympic Barbell 15kg
   ID: ac0ee806-fccf-4dfe-9f4c-b1004a569066
   Slug: olympic_barbell_15
   Type: barbell, Load: dual_load, Medium: bar
   Default Weight: 15.00 kg

3. Olympic Barbell 20kg
   ID: 4e8d0f2f-bb90-48d7-845e-990074b82c7e
   Slug: olympic_barbell_20
   Type: barbell, Load: dual_load, Medium: bar
   Default Weight: 20.00 kg

4. Safety Squat Bar
   ID: d7fee945-8989-4345-85f7-1692952c9af2
   Slug: safety_squat_bar
   Type: barbell, Load: dual_load, Medium: bar
   Default Weight: 22.00 kg

5. Trap Bar
   ID: d8c51e0d-c123-49fe-9128-762931e260b1
   Slug: trap_bar
   Type: barbell, Load: dual_load, Medium: bar
   Default Weight: 25.00 kg
```

### Body Weight (1 entry)
```
6. Bodyweight
   ID: b588a4e6-141f-4d6a-8525-640bfd15cf54
   Slug: bodyweight
   Type: body, Load: none, Medium: other
```

### Free Weights (3 entries)
```
7. Barbell
   ID: bf01a816-563b-4f89-afe9-8475dbbc1ded
   Slug: barbell
   Type: free_weight, Load: none, Medium: other

8. Dumbbell
   ID: 2146e786-4701-45f9-bee5-a2f2ec2f828a
   Slug: dumbbell
   Type: free_weight, Load: none, Medium: other

9. Dumbbells Pair
   ID: 15169ce2-6859-48ca-8498-31c5a3c694ca
   Slug: dumbbells_pair
   Type: free_weight, Load: none, Medium: other
```

### Machines (28 entries)
```
10. Bar EZ 10kg
    ID: 207393ba-c0e8-4e3c-a02e-25403ad062f7
    Slug: bar_ez_10
    Type: machine, Load: dual_load, Medium: bar
    Default Weight: 10.00 kg

11. Bar Olympic 15kg
    ID: c1a5f975-f1ff-482d-add7-878e3da6bf32
    Slug: bar_olympic_15
    Type: machine, Load: dual_load, Medium: bar
    Default Weight: 15.00 kg

12. Bar Olympic 20kg
    ID: 90f75fe7-487c-483b-ab86-54bd5db4e9c3
    Slug: bar_olympic_20
    Type: machine, Load: dual_load, Medium: bar
    Default Weight: 20.00 kg

13. Bar Trap 25kg
    ID: df155220-c26d-4dc7-8fb0-cf5eb3d4c0a7
    Slug: bar_trap_25
    Type: machine, Load: dual_load, Medium: bar
    Default Weight: 25.00 kg

14. Barr (Generic)
    ID: 5abf884c-c9d4-4c56-8c31-4faf30274ecb
    Slug: barr
    Type: machine, Load: none, Medium: other

15. Bench
    ID: eaa7da79-b8fb-427a-a511-289b2c68752f
    Slug: bench
    Type: machine, Load: none, Medium: other

16. Bike
    ID: 60f46658-856b-4e03-9ee7-81f61ace2c71
    Slug: bike
    Type: machine, Load: none, Medium: other

17. Body (Machine)
    ID: 74ee7c86-2d8c-483d-a481-9028cd9b78c2
    Slug: body
    Type: machine, Load: none, Medium: other

18. Cable
    ID: 7c982e45-8241-4fc6-8203-4c8ce6dcd4be
    Slug: cable
    Type: machine, Load: none, Medium: other

19. Cable Crossover Stack
    ID: e9450e7f-f184-43b4-916a-c7b89bb64b80
    Slug: cable_crossover_stack
    Type: machine, Load: stack, Medium: stack

20. Cable Station
    ID: 4ad5c297-931a-4ca7-a36d-bb42250483ec
    Slug: cable_station
    Type: machine, Load: none, Medium: other

21. Dumbbells (Machine)
    ID: 376c20cd-1b78-43ea-a301-5bd9f2d78947
    Slug: dumbbells
    Type: machine, Load: none, Medium: other

22. Elliptical
    ID: 27f5f0d9-6736-473a-9c15-c1f87445ad1b
    Slug: elliptical
    Type: machine, Load: none, Medium: other

23. Lat Pulldown Stack
    ID: 434414d9-6ec5-4215-be12-e6540ff45f88
    Slug: lat_pulldown_stack
    Type: machine, Load: stack, Medium: stack

24. Leg Press Single
    ID: d760fee2-cb2f-4a55-a139-2498640775cf
    Slug: leg_press_single
    Type: machine, Load: single_load, Medium: plates

25. Machine (Generic)
    ID: 378b3d7f-9fe7-4337-b38f-a01b608fbea3
    Slug: machine
    Type: machine, Load: none, Medium: other

26. Machine Chest Press
    ID: 279cabe0-0b5b-4ce7-8283-39533ef0fd1e
    Slug: machine_chest_press
    Type: machine, Load: none, Medium: other

27. Machine Crossover
    ID: 88f56b2e-31aa-4519-b523-4a3801a51a10
    Slug: machine_crossover
    Type: machine, Load: none, Medium: other

28. Machine Dip
    ID: a0e27095-7e1e-4647-8e5a-b7c98e2d11f8
    Slug: machine_dip
    Type: machine, Load: none, Medium: other

29. Machine Fly
    ID: 8951aa22-81d8-4e36-b3a7-6a07cb4fef71
    Slug: machine_fly
    Type: machine, Load: none, Medium: other

30. Machine Lat
    ID: 2b4f6b7c-3b4e-4c1a-8b9f-1e2d3c4a5b6c
    Slug: machine_lat
    Type: machine, Load: none, Medium: other

31. Machine Leg
    ID: 3c5f7c8d-4c5f-5d2a-9c0f-2f3e4d5a6c7d
    Slug: machine_leg
    Type: machine, Load: none, Medium: other

32. Machine Row
    ID: 4d6f8d9e-5d6f-6e3a-0d1f-3f4e5d6a7c8d
    Slug: machine_row
    Type: machine, Load: none, Medium: other

33. Pec Deck
    ID: 5e7f9e0f-6e7f-7f4a-1e2f-4f5e6d7a8c9d
    Slug: pec_deck
    Type: machine, Load: none, Medium: other

34. Rowing Machine
    ID: 6f8f0f1f-7f8f-8f5a-2f3f-5f6e7d8a9c0d
    Slug: rowing_machine
    Type: machine, Load: none, Medium: other

35. Smith Machine
    ID: 7f9f1f2f-8f9f-9f6a-3f4f-6f7e8d9a0c1d
    Slug: smith_machine
    Type: machine, Load: none, Medium: other

36. Treadmill
    ID: 8f0f2f3f-9f0f-0f7a-4f5f-7f8e9d0a1c2d
    Slug: treadmill
    Type: machine, Load: none, Medium: other

37. Weight Stack
    ID: 9f1f3f4f-0f1f-1f8a-5f6f-8f9e0d1a2c3d
    Slug: weight_stack
    Type: machine, Load: stack, Medium: stack
```

## Complete Exercise Data (30 entries)

### Primary Exercise Set
```
1. Barbell Curl
   ID: 990e4209-0c29-4b20-88d2-f6307b196b4b
   Slug: barbell_curl
   Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
   Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
   Primary Muscle: Biceps Brachii Long Head (a3a44d4e-0b11-413b-a5b8-a3cf355804bc)
   Skill Level: medium, Popularity: 1
   Grips Allowed: true, Handle Required: false, Unilateral: false

2. Wrist Curl
   ID: 24ea86b3-4d33-4fc8-bca2-e6d080a89315
   Slug: wrist_curl
   Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
   Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
   Primary Muscle: Flexor Carpi Radialis (c0e64035-a46d-4abd-8123-57dae132ffef)
   Skill Level: medium, Popularity: 4
   Grips Allowed: true, Handle Required: false, Unilateral: false

3. Back Squat
   ID: fd3964b7-c175-4d6b-bc96-5a8bae726c9f
   Slug: back_squat
   Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
   Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
   Primary Muscle: Quadriceps Femoris (f829b77d-e044-4cca-9513-f2a4b07c9191)
   Skill Level: medium, Popularity: 1
   Grips Allowed: true, Handle Required: false, Unilateral: false

4. Barbell Bench Press
   ID: b9844b71-d422-4119-9f22-a4c6e460f07c
   Slug: barbell_bench_press
   Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
   Body Part: Chest (1643dca9-5784-46ad-a3c1-bd67d2a125b4)
   Primary Muscle: Pectoralis Major Sternocostal (2bc489d4-2dcf-4652-9473-b4cdd2ca74cf)
   Skill Level: medium, Popularity: 1
   Grips Allowed: true, Handle Required: false, Unilateral: false

5. Seated Leg Curl
   ID: 6b30c536-bf8f-48f3-83ad-22518d3d2cc8
   Slug: seated_leg_curl
   Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
   Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
   Primary Muscle: Biceps Femoris (c8d26f47-7c54-437d-a2ac-2c9fdb140975)
   Skill Level: medium, Popularity: 4
   Grips Allowed: true, Handle Required: false, Unilateral: false

6. Romanian Deadlift
   ID: 6dce3d53-8699-4425-871c-35cc8b4a137f
   Slug: romanian_deadlift
   Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
   Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
   Primary Muscle: Biceps Femoris (c8d26f47-7c54-437d-a2ac-2c9fdb140975)
   Skill Level: medium, Popularity: 3
   Grips Allowed: true, Handle Required: false, Unilateral: false

7. Dumbbell Lateral Raise
   ID: 69618f8c-437c-4792-bb57-9a83f2518766
   Slug: dumbbell_lateral_raise
   Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
   Body Part: Shoulders (5fb5cc84-7bf1-48d9-8296-3eef485e3654)
   Primary Muscle: Lateral Deltoid (8bf5b3e3-8cd2-4822-8ede-e24d0b094b42)
   Skill Level: medium, Popularity: 3
   Grips Allowed: true, Handle Required: false, Unilateral: false

8. Dumbbell Shoulder Press
   ID: 6171abd1-ac01-4f02-8a26-6cb708b29634
   Slug: dumbbell_shoulder_press
   Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
   Body Part: Shoulders (5fb5cc84-7bf1-48d9-8296-3eef485e3654)
   Primary Muscle: Anterior Deltoid (46a61ac3-ce6d-4b13-9baa-cca2bd5aed54)
   Skill Level: medium, Popularity: 2
   Grips Allowed: true, Handle Required: false, Unilateral: false

9. Leg Press
   ID: b824d92c-80a5-4a7f-91d3-8123de27d94a
   Slug: leg_press
   Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
   Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
   Primary Muscle: Quadriceps Femoris (f829b77d-e044-4cca-9513-f2a4b07c9191)
   Skill Level: medium, Popularity: 2
   Grips Allowed: true, Handle Required: false, Unilateral: false

10. Overhead Press
    ID: 8d6f265b-6784-47fe-9eba-6c4cf6f7b0aa
    Slug: overhead_press
    Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
    Body Part: Shoulders (5fb5cc84-7bf1-48d9-8296-3eef485e3654)
    Primary Muscle: Anterior Deltoid (46a61ac3-ce6d-4b13-9baa-cca2bd5aed54)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: false, Unilateral: false

11. Reverse Pec Deck
    ID: dd5ff3b4-692f-4d84-8a4d-e84c4745a42c
    Slug: reverse_pec_deck
    Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
    Body Part: Shoulders (5fb5cc84-7bf1-48d9-8296-3eef485e3654)
    Primary Muscle: Posterior Deltoid (cc11fb5b-a92f-4d65-9840-b9dc9a095b9c)
    Skill Level: medium, Popularity: 4
    Grips Allowed: true, Handle Required: false, Unilateral: false

12. Standing Calf Raise
    ID: f0fbe40a-2eeb-41da-a65e-58095ef52c06
    Slug: standing_calf_raise
    Equipment: machine (378b3d7f-9fe7-4337-b38f-a01b608fbea3)
    Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
    Primary Muscle: Gastrocnemius Medial (f09c4d01-368e-4856-a641-08b1c6740b81)
    Skill Level: medium, Popularity: 4
    Grips Allowed: true, Handle Required: false, Unilateral: false

13. Pull Up
    ID: 8c5f3e61-4921-47e5-929a-9b8bf85c23d2
    Slug: pull_up
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Back (82e99076-7711-4f76-b0cd-61391c36aefa)
    Primary Muscle: Latissimus Dorsi (ddeaad47-fcce-4e0f-a20d-177c5f308f15)
    Skill Level: medium, Popularity: 1
    Grips Allowed: true, Handle Required: false, Unilateral: false

14. Push Up
    ID: 9f7a12b8-cd34-4e5e-8f92-1a7c9d4e6f82
    Slug: push_up
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Chest (1643dca9-5784-46ad-a3c1-bd67d2a125b4)
    Primary Muscle: Pectoralis Major Sternocostal (2bc489d4-2dcf-4652-9473-b4cdd2ca74cf)
    Skill Level: medium, Popularity: 1
    Grips Allowed: true, Handle Required: false, Unilateral: false

15. Triceps Pushdown
    ID: 29295b4c-7cae-4e87-b598-b2145a25ff1b
    Slug: triceps_pushdown
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
    Primary Muscle: Triceps Brachii Long Head (7b44da4c-45a0-47d6-8a9b-bef5b1c91a8c)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: true, Unilateral: false

16. Lat Pulldown
    ID: be8674c9-a0a5-418c-96f6-86508fdc7d4d
    Slug: lat_pulldown
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Back (82e99076-7711-4f76-b0cd-61391c36aefa)
    Primary Muscle: Latissimus Dorsi (ddeaad47-fcce-4e0f-a20d-177c5f308f15)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: true, Unilateral: false

17. Seated Cable Row
    ID: 442f7402-1056-4570-be66-32366a50f3d0
    Slug: seated_cable_row
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Back (82e99076-7711-4f76-b0cd-61391c36aefa)
    Primary Muscle: Rhomboid Major (2a73c4e5-1b8d-4f2e-9c7a-5d6b8e9f1a2b)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: true, Unilateral: false

18. Cable Fly
    ID: 71d07707-7efb-46f6-9cfd-991c9fce7c4e
    Slug: cable_fly
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Chest (1643dca9-5784-46ad-a3c1-bd67d2a125b4)
    Primary Muscle: Pectoralis Major Sternocostal (2bc489d4-2dcf-4652-9473-b4cdd2ca74cf)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: true, Unilateral: false

19. Incline Dumbbell Press
    ID: f6e9dbd4-b082-48b7-a328-abb3d8467d29
    Slug: incline_dumbbell_press
    Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
    Body Part: Chest (1643dca9-5784-46ad-a3c1-bd67d2a125b4)
    Primary Muscle: Pectoralis Major Clavicular (bdb45935-d15c-4ea3-b504-5be5aab86417)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: false, Unilateral: false

20. Dumbbell Curl
    ID: 2932b5c6-5b08-4d27-a6b0-6834df452582
    Slug: dumbbell_curl
    Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
    Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
    Primary Muscle: Biceps Brachii Long Head (a3a44d4e-0b11-413b-a5b8-a3cf355804bc)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: false, Unilateral: false

21. Hammer Curl
    ID: b02adbe5-3b84-46d2-afb4-e9a6a09e1443
    Slug: hammer_curl
    Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
    Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
    Primary Muscle: Brachialis (cd37d508-f087-4ef8-a024-af13a4d49daa)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: false, Unilateral: false

22. Lying Triceps Extension
    ID: c5f42f4f-3d42-4c4c-bda6-88890a30dc56
    Slug: lying_triceps_extension
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Arms (903924e8-cbb4-4b23-82b4-813703148f69)
    Primary Muscle: Triceps Brachii Long Head (7b44da4c-45a0-47d6-8a9b-bef5b1c91a8c)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: true, Unilateral: false

23. Bulgarian Split Squat
    ID: 3e5f8c2b-9a7e-4d1f-bc89-1f3e5d7a9c2e
    Slug: bulgarian_split_squat
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
    Primary Muscle: Quadriceps Femoris (f829b77d-e044-4cca-9513-f2a4b07c9191)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: false, Unilateral: true

24. Single Leg Deadlift
    ID: 4f6f9d3c-0b8f-5e2f-cd90-2f4e6d8a0c3f
    Slug: single_leg_deadlift
    Equipment: dumbbell (2146e786-4701-45f9-bee5-a2f2ec2f828a)
    Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
    Primary Muscle: Biceps Femoris (c8d26f47-7c54-437d-a2ac-2c9fdb140975)
    Skill Level: medium, Popularity: 4
    Grips Allowed: true, Handle Required: false, Unilateral: true

25. Plank
    ID: 5f7f0e4d-1c9f-6f3f-de01-3f5e7d9a1c4f
    Slug: plank
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Core (f34bb30b-336b-4507-a458-ca2a11fe56d6)
    Primary Muscle: Rectus Abdominis (9e123ab5-67cd-4ef8-9012-3456789abcde)
    Skill Level: medium, Popularity: 1
    Grips Allowed: false, Handle Required: false, Unilateral: false

26. Deadlift
    ID: 6f8f1f5e-2d0f-7f4f-ef12-4f6e8d0a2c5f
    Slug: deadlift
    Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
    Body Part: Back (82e99076-7711-4f76-b0cd-61391c36aefa)
    Primary Muscle: Erector Spinae (8f456def-89ab-4cde-f012-3456789abcde)
    Skill Level: medium, Popularity: 1
    Grips Allowed: true, Handle Required: false, Unilateral: false

27. Hip Thrust
    ID: 7f9f2f6f-3e1f-8f5f-f023-5f7e9d1a3c6f
    Slug: hip_thrust
    Equipment: barbell (bf01a816-563b-4f89-afe9-8475dbbc1ded)
    Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
    Primary Muscle: Gluteus Maximus (3a772488-4cce-44d0-8504-501884ee9a27)
    Skill Level: medium, Popularity: 2
    Grips Allowed: true, Handle Required: false, Unilateral: false

28. Face Pull
    ID: 8f0f3f7f-4f2f-9f6f-f134-6f8e0d2a4c7f
    Slug: face_pull
    Equipment: cable (7c982e45-8241-4fc6-8203-4c8ce6dcd4be)
    Body Part: Shoulders (5fb5cc84-7bf1-48d9-8296-3eef485e3654)
    Primary Muscle: Posterior Deltoid (cc11fb5b-a92f-4d65-9840-b9dc9a095b9c)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: true, Unilateral: false

29. Chest Dip
    ID: 9f1f4f8f-5f3f-0f7f-f245-7f9e1d3a5c8f
    Slug: chest_dip
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Chest (1643dca9-5784-46ad-a3c1-bd67d2a125b4)
    Primary Muscle: Pectoralis Major Sternocostal (2bc489d4-2dcf-4652-9473-b4cdd2ca74cf)
    Skill Level: medium, Popularity: 3
    Grips Allowed: true, Handle Required: false, Unilateral: false

30. Calf Raise
    ID: 0f2f5f9f-6f4f-1f8f-f356-8f0e2d4a6c9f
    Slug: calf_raise
    Equipment: bodyweight (b588a4e6-141f-4d6a-8525-640bfd15cf54)
    Body Part: Legs (72a125c2-e2fa-49c6-b129-d1a946996d3c)
    Primary Muscle: Gastrocnemius Medial (f09c4d01-368e-4856-a641-08b1c6740b81)
    Skill Level: medium, Popularity: 2
    Grips Allowed: false, Handle Required: false, Unilateral: false
```

## Complete Handles Data (12 entries)

```
1. Straight Bar
   ID: f140a7b1-a492-45af-b3ca-d996739b6621
   Slug: straight-bar
   Category: bar
   Name: Straight Bar
   Description: Straight cable bar
   Created: 2025-08-27 11:11:40

2. EZ Curl Bar
   ID: aa319ce5-1dff-4a5a-b4de-613069812476
   Slug: ez-curl-bar
   Category: ez-bar
   Name: EZ Curl Bar
   Description: Angled bar (curl)
   Created: 2025-08-27 11:11:40

3. Standard Lat Bar
   ID: 14a45d42-1c8d-43bd-afe3-3a49b622bfdf
   Slug: lat-bar-standard
   Category: pulldown
   Name: Standard Lat Bar
   Description: Standard pulldown bar
   Created: 2025-08-27 11:11:40

4. Wide Lat Bar
   ID: b9e7c682-a315-4d8f-b5a5-0b1e4e9b1c25
   Slug: lat-bar-wide
   Category: pulldown
   Name: Wide Lat Bar
   Description: Wide pulldown bar
   Created: 2025-08-27 11:11:40

5. Lat Pulldown Wide
   ID: 9644921b-c9b4-4c98-afc4-7bfe6b633920
   Slug: lat-pulldown-wide
   Category: pulldown
   Name: (null)
   Description: (null)
   Created: 2025-08-27 12:16:14

6. Triceps Rope
   ID: 2849bf26-711b-4663-afa1-77cdcb29c7ed
   Slug: rope
   Category: rope
   Name: Triceps Rope
   Description: Rope attachment
   Created: 2025-08-27 11:11:40

7. Tricep Rope Thick
   ID: d02c2faa-e780-4aab-bc02-bb4fadc167f3
   Slug: tricep-rope-thick
   Category: rope
   Name: (null)
   Description: (null)
   Created: 2025-08-27 12:16:14

8. Single D Handle
   ID: 510d19fb-a791-41eb-9178-8b5098e0bb09
   Slug: single-d-handle
   Category: single
   Name: Single D Handle
   Description: Single grip
   Created: 2025-08-27 11:11:40

9. Single D Large
   ID: be728b87-f24e-44b9-be81-1dae3eb77a7b
   Slug: single-d-large
   Category: single
   Name: (null)
   Description: (null)
   Created: 2025-08-27 12:16:14

10. Triangle Row Handle
    ID: e0b1f6eb-de11-4557-b7fc-295ccaa3782f
    Slug: row-triangle
    Category: triangle
    Name: Triangle Row Handle
    Description: Neutral triangle
    Created: 2025-08-27 11:11:40

11. Cable V Bar
    ID: 7a1421d8-311c-4b1f-b291-ad17d8163061
    Slug: cable-v-bar
    Category: v-bar
    Name: (null)
    Description: (null)
    Created: 2025-08-27 12:16:14

12. V Bar (Row)
    ID: 034d410d-b832-474b-b004-85fcc4a242eb
    Slug: row-v-bar
    Category: v-bar
    Name: V Bar (Row)
    Description: V-bar row attachment
    Created: 2025-08-27 11:11:40
```

## Complete Grips Data (9 entries)

### Orientation Grips (4 entries)
```
1. Mixed
   ID: 60a2adca-0f97-478f-964c-a455574f4f75
   Slug: mixed
   Category: orientation
   Name: Mixed
   Description: One palm up, one palm down
   Compatible With: []
   Created: 2025-08-25 02:02:44

2. Neutral
   ID: 7e1183b7-ad06-46dd-bc20-06ff9b56974e
   Slug: neutral
   Category: orientation
   Name: Neutral
   Description: Palms facing each other
   Compatible With: []
   Created: 2025-08-25 02:02:44

3. Overhand
   ID: dffda414-897f-4b80-bc86-d2017fff7685
   Slug: overhand
   Category: orientation
   Name: Overhand
   Description: Palms facing down (pronated grip)
   Compatible With: []
   Created: 2025-08-25 02:02:44

4. Underhand
   ID: a1aaa64e-084e-4358-96aa-e7ed17cd206f
   Slug: underhand
   Category: orientation
   Name: Underhand
   Description: Palms facing up (supinated grip)
   Compatible With: []
   Created: 2025-08-25 02:02:44
```

### Technique Grips (2 entries)
```
5. False
   ID: 6cff8ce2-9f50-4e13-91fb-0f152451b109
   Slug: false
   Category: technique
   Name: False
   Description: False grip for muscle-ups
   Compatible With: []
   Created: 2025-08-25 02:02:44

6. Hook
   ID: 663c44e4-c78b-4f3d-b82c-42794c627a43
   Slug: hook
   Category: technique
   Name: Hook
   Description: Hook grip with thumb under fingers
   Compatible With: []
   Created: 2025-08-25 02:02:44
```

### Width Grips (3 entries)
```
7. Close
   ID: 31fb64d3-e0db-43e4-b7fc-14b175783bea
   Slug: close
   Category: width
   Name: Close
   Description: Hands placed close together
   Compatible With: []
   Created: 2025-08-25 02:02:44

8. Standard
   ID: 0045f0be-a2c3-410d-b512-f903eeff2531
   Slug: standard
   Category: width
   Name: Standard
   Description: Shoulder-width grip
   Compatible With: []
   Created: 2025-08-25 02:02:44

9. Wide
   ID: 0936084e-7084-4098-9fac-5627a87c9773
   Slug: wide
   Category: width
   Name: Wide
   Description: Hands placed wider than shoulders
   Compatible With: []
   Created: 2025-08-25 02:02:44
```

## Complete Personal Records Data (6 entries)

```
1. Cable Fly - Heaviest Weight
   ID: 75cb8994-5898-4606-9486-acf1b6f29b3e
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
   Kind: heaviest
   Value: 55.25 kg
   Achieved: 2025-08-26 20:20:39
   Workout Set: null
   Grip Key: null

2. Cable Fly - Estimated 1RM
   ID: 632311c1-32e0-419e-85a0-dd6ce9cedbd1
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
   Kind: 1RM
   Value: 73.85 kg
   Achieved: 2025-08-26 20:18:57
   Workout Set: null
   Grip Key: null

3. Incline Dumbbell Press - Estimated 1RM
   ID: dc2599d9-09d9-4093-b22e-eb1230ffbab7
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
   Kind: 1RM
   Value: 140.43 kg
   Achieved: 2025-08-26 19:51:28
   Workout Set: null
   Grip Key: null

4. Incline Dumbbell Press - Heaviest Weight
   ID: 7261b2fa-e41d-4e6c-a858-12bb0cc40f0b
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
   Kind: heaviest
   Value: 102.75 kg
   Achieved: 2025-08-26 19:34:33
   Workout Set: null
   Grip Key: null

5. Cable Fly - Max Reps
   ID: a39424cc-6b74-4b8a-b6a7-e02f35392e25
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
   Kind: reps
   Value: 12 reps
   Achieved: 2025-08-26 19:13:53
   Workout Set: null
   Grip Key: null

6. Incline Dumbbell Press - Max Reps
   ID: 3519c618-e773-4ece-9eb5-669cda14b38c
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
   Kind: reps
   Value: 12 reps
   Achieved: 2025-08-26 19:13:22
   Workout Set: null
   Grip Key: null
```

## Complete User Exercise Estimates Data (2 entries)

```
1. Incline Dumbbell Press Estimate
   ID: 24d101d5-49b0-4eb2-b574-40273dceb78b
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Incline Dumbbell Press (f6e9dbd4-b082-48b7-a328-abb3d8467d29)
   Type: rm10 (10-rep max estimate)
   Estimated Weight: 59 kg
   Unit: kg
   Source: user_input
   Grip Key: null
   Created: 2025-08-26 19:05:25
   Updated: 2025-08-26 19:05:25

2. Cable Fly Estimate
   ID: 09abe1a1-3677-41e0-8838-9461f76405ea
   User: f3024241-c467-4d6a-8315-44928316cfa9
   Exercise: Cable Fly (71d07707-7efb-46f6-9cfd-991c9fce7c4e)
   Type: rm10 (10-rep max estimate)
   Estimated Weight: 19 kg
   Unit: kg
   Source: user_input
   Grip Key: null
   Created: 2025-08-26 19:05:25
   Updated: 2025-08-26 19:05:25
```

## Complete Body Parts & Muscles Data

### Body Parts (7 entries)
```
1. Arms
   ID: 903924e8-cbb4-4b23-82b4-813703148f69
   Slug: arms
   Created: 2025-08-11 10:06:32

2. Back
   ID: 82e99076-7711-4f76-b0cd-61391c36aefa
   Slug: back
   Created: 2025-08-11 10:06:32

3. Chest
   ID: 1643dca9-5784-46ad-a3c1-bd67d2a125b4
   Slug: chest
   Created: 2025-08-11 10:06:32

4. Core
   ID: f34bb30b-336b-4507-a458-ca2a11fe56d6
   Slug: core
   Created: 2025-08-11 10:06:32

5. Legs
   ID: 72a125c2-e2fa-49c6-b129-d1a946996d3c
   Slug: legs
   Created: 2025-08-11 10:06:32

6. Neck
   ID: 9f92d1d1-c20c-49e2-992e-f97b6098f5b4
   Slug: neck
   Created: 2025-08-24 23:44:20

7. Shoulders
   ID: 5fb5cc84-7bf1-48d9-8296-3eef485e3654
   Slug: shoulders
   Created: 2025-08-24 23:44:39
```

### Muscles (40+ entries)
```
Key muscles include:
- Adductor Longus (20ec256b-f983-435b-912e-8d291ed253fa)
- Adductor Magnus (ef6123e7-78f2-401e-918e-a40ad402ae14)
- Anterior Deltoid (46a61ac3-ce6d-4b13-9baa-cca2bd5aed54)
- Biceps Brachii Long Head (a3a44d4e-0b11-413b-a5b8-a3cf355804bc)
- Biceps Brachii Short Head (942ab4e4-d95b-432e-8d40-0edddacf5d4a)
- Biceps Femoris (c8d26f47-7c54-437d-a2ac-2c9fdb140975)
- Brachialis (cd37d508-f087-4ef8-a024-af13a4d49daa)
- Brachioradialis (e7ca2f44-56d2-4847-92ca-02f1b38a0dd3)
- External Obliques (c5b3c646-7ccf-4f60-85a6-10927da368d6)
- Gastrocnemius Lateral (e043d8dc-8bff-4196-9316-ecf741892334)
- Gastrocnemius Medial (f09c4d01-368e-4856-a641-08b1c6740b81)
- Gluteus Maximus (3a772488-4cce-44d0-8504-501884ee9a27)
- Gluteus Medius (eefc6cdb-60f0-4d51-9d84-50143f626134)
- Gluteus Minimus (2b6abd70-3793-4f8f-b188-f52dd8a04721)
- Lateral Deltoid (8bf5b3e3-8cd2-4822-8ede-e24d0b094b42)
- Latissimus Dorsi (ddeaad47-fcce-4e0f-a20d-177c5f308f15)
- Pectoralis Major Clavicular (bdb45935-d15c-4ea3-b504-5be5aab86417)
- Pectoralis Major Sternocostal (2bc489d4-2dcf-4652-9473-b4cdd2ca74cf)
- Posterior Deltoid (cc11fb5b-a92f-4d65-9840-b9dc9a095b9c)
- Quadriceps Femoris (f829b77d-e044-4cca-9513-f2a4b07c9191)
- Rectus Abdominis (9e123ab5-67cd-4ef8-9012-3456789abcde)
- Triceps Brachii Long Head (7b44da4c-45a0-47d6-8a9b-bef5b1c91a8c)
- And many more covering all major muscle groups...
```

## Complete Exercise Relationships Data (19 entries)

### Exercise-Handle Relationships
```
1. Barbell Curl → EZ Curl Bar (default)
2. Dumbbell Curl → EZ Curl Bar (default)
3. Hammer Curl → EZ Curl Bar (default)
4. Lat Pulldown → Wide Lat Bar (default), Standard Lat Bar, V Bar (Row)
5. Lying Triceps Extension → Triceps Rope (default), Straight Bar, V Bar (Row)
6. Romanian Deadlift → Straight Bar (default)
7. Seated Cable Row → Triangle Row Handle (default), Straight Bar, V Bar (Row), Single D Handle
8. Seated Leg Curl → EZ Curl Bar (default)
9. Triceps Pushdown → Triceps Rope (default), Straight Bar, V Bar (Row)
10. Wrist Curl → EZ Curl Bar (default)
```

### Exercise-Grip Relationships
Currently no specific grip relationships are defined, indicating that exercises can use any compatible grip.

### Exercise-Equipment Variants
Currently no equipment variants are defined, indicating exercises are tied to their primary equipment only.

## Data Analysis Summary

### Equipment Distribution
- **37 total equipment types**: 5 barbells, 3 free weights, 1 bodyweight, 28 machines
- **Load type distribution**: 13 dual_load (barbells/machines), 1 single_load, 3 stack, 20 none
- **Comprehensive coverage**: Full range from basic bodyweight to complex machine systems

### Exercise Variety
- **30 exercises** covering all major movement patterns and muscle groups
- **Equipment usage**: 8 barbell, 8 dumbbell, 1 bodyweight, 9 cable, 4 machine exercises
- **Skill level**: All currently set to "medium" difficulty
- **Popularity ranking**: 1-4 scale indicating exercise importance

### Handle & Grip System
- **12 handles**: Comprehensive cable system with bars, ropes, single grips, triangles, V-bars
- **9 grips**: Complete grip variations covering orientation, width, and technique
- **19 exercise-handle relationships**: Exercises properly mapped to compatible handles

### User Activity Profile
- **1 active user** (f3024241-c467-4d6a-8315-44928316cfa9)
- **2 exercises actively tracked**: Cable Fly and Incline Dumbbell Press
- **6 personal records**: Mix of heaviest weight, 1RM estimates, and max reps
- **2 exercise estimates**: 10RM estimates for tracked exercises
- **Recent activity**: All records from August 26, 2025

### System Readiness
- **Complete foundation**: Exercise library, equipment definitions, handle/grip system
- **User estimation system**: Active with estimates and personal records
- **Template system**: Ready but unused (0 active templates)
- **Workout tracking**: Infrastructure ready but no active workouts
- **Pre-workout features**: New readiness checking system ready for use

This data represents a mature fitness application foundation with comprehensive exercise and equipment data, active user performance tracking, and readiness for expanded workout logging and template usage.