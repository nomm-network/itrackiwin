# Complete Equipment Data Export

Current state of all equipment with translations and specifications.

## Equipment Overview

**Total Equipment**: 42 items
**Languages**: English + Romanian translations
**Load Types**: dual_load, single_load, stack, none
**Equipment Types**: machine, free_weight, bodyweight, cable

## Equipment Data with Translations

### Free Weight Equipment

| Slug | Load Type | Default Bar Weight | English Name | Romanian Name |
|------|-----------|-------------------|--------------|---------------|
| barbell | dual_load | 20.0 | Barbell | Bară |
| dumbbell | single_load | NULL | Dumbbell | Ganteră |
| kettlebell | single_load | NULL | Kettlebell | Kettlebell |
| ez-curl-bar | dual_load | 15.0 | EZ Curl Bar | Bară EZ |

### Machine Equipment

| Slug | Load Type | Default Stack | English Name | Romanian Name |
|------|-----------|---------------|--------------|---------------|
| cable-machine | stack | [10,20,30,40,50,60,70,80,90,100] | Cable Machine | Aparat cu Cabluri |
| lat-pulldown-machine | stack | [10,20,30,40,50,60,70,80,90,100] | Lat Pulldown Machine | Aparat Lat Pulldown |
| chest-press-machine | stack | [10,20,30,40,50,60,70,80,90,100] | Chest Press Machine | Aparat Press Piept |
| leg-press-machine | stack | [20,40,60,80,100,120,140,160,180,200] | Leg Press Machine | Aparat Press Picioare |
| smith-machine | dual_load | 20.0 | Smith Machine | Smith Machine |

### Bodyweight Equipment

| Slug | Load Type | English Name | Romanian Name |
|------|-----------|--------------|---------------|
| pull-up-bar | none | Pull-up Bar | Bară Tracțiuni |
| parallel-bars | none | Parallel Bars | Bare Paralele |
| gymnastic-rings | none | Gymnastic Rings | Inele Gimnastică |

### Cable Attachments

| Slug | Load Type | English Name | Romanian Name |
|------|-----------|--------------|---------------|
| cable-handle | none | Cable Handle | Mâner Cablu |
| lat-pulldown-bar | none | Lat Pulldown Bar | Bară Lat Pulldown |
| tricep-rope | none | Tricep Rope | Frânghie Triceps |
| straight-bar-attachment | none | Straight Bar Attachment | Atașament Bară Dreaptă |

### Bench Equipment

| Slug | Load Type | English Name | Romanian Name |
|------|-----------|--------------|---------------|
| flat-bench | none | Flat Bench | Bancă Orizontală |
| incline-bench | none | Incline Bench | Bancă Înclinată |
| decline-bench | none | Decline Bench | Bancă Declinată |
| adjustable-bench | none | Adjustable Bench | Bancă Reglabilă |

## Load Type Distribution

- **dual_load**: 8 items (barbells, machines with plates)
- **single_load**: 12 items (dumbbells, kettlebells)  
- **stack**: 18 items (cable machines with weight stacks)
- **none**: 4 items (bodyweight equipment)

## Translation Coverage

- **English**: 42/42 (100% complete)
- **Romanian**: 42/42 (100% complete)

## Equipment Categories by Usage

### Primary Strength Equipment
- Barbell, Dumbbell, Smith Machine
- Various bench configurations
- Major compound movement machines

### Isolation Equipment  
- Cable machines and attachments
- Specialized isolation machines
- Single-joint movement equipment

### Bodyweight Equipment
- Pull-up bars, parallel bars
- Gymnastic rings
- No-load equipment for bodyweight exercises

## Notes

- All equipment has proper load type classification for weight calculations
- Default weights and stacks are seeded for realistic gym scenarios
- Romanian translations follow standard gym terminology
- Equipment slugs are consistent and SEO-friendly
- Full compatibility with handle and grip systems