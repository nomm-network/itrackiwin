# Equipment Handle Grips Export

This document contains the complete export of the `equipment_handle_grips` table as of the last update.

## Table Structure

The `equipment_handle_grips` table maps which grip types are compatible with each equipment-handle combination.

### Columns:
- `id` (UUID): Primary key
- `equipment_id` (UUID): Foreign key reference to equipment table
- `handle_id` (UUID): Foreign key reference to handles table  
- `grip_id` (UUID): Foreign key reference to grips table
- `is_default` (boolean): Whether this grip is the default choice for this equipment-handle combination
- `created_at` (timestamp): Record creation timestamp

## Complete Data Export

| Equipment | Handle | Grip | Is Default |
|-----------|--------|------|------------|
| ab-crunch-machine | dual-d-handle | close | false |
| ab-crunch-machine | dual-d-handle | neutral | **true** |
| ab-crunch-machine | single-handle | neutral | false |
| ab-crunch-machine | single-handle | overhand | false |
| ab-crunch-machine | single-handle | underhand | **true** |
| ab-crunch-machine | tricep-rope | close | false |
| ab-crunch-machine | tricep-rope | neutral | **true** |
| abductor-machine | dual-d-handle | close | false |
| abductor-machine | dual-d-handle | neutral | **true** |
| abductor-machine | single-handle | neutral | false |
| abductor-machine | single-handle | overhand | false |
| abductor-machine | single-handle | underhand | **true** |
| abductor-machine | tricep-rope | close | false |
| abductor-machine | tricep-rope | neutral | **true** |
| adductor-machine | dual-d-handle | close | false |
| adductor-machine | dual-d-handle | neutral | **true** |
| adductor-machine | single-handle | neutral | false |
| adductor-machine | single-handle | overhand | false |
| adductor-machine | single-handle | underhand | **true** |
| adductor-machine | tricep-rope | close | false |
| adductor-machine | tricep-rope | neutral | **true** |
| barbell | ez-curl-bar | close | false |
| barbell | ez-curl-bar | overhand | false |
| barbell | ez-curl-bar | underhand | **true** |
| barbell | straight-bar | close | false |
| barbell | straight-bar | overhand | **true** |
| barbell | straight-bar | underhand | false |
| barbell | straight-bar | wide | false |
| barbell | swiss-bar | close | false |
| barbell | swiss-bar | neutral | **true** |
| barbell | swiss-bar | wide | false |
| barbell | trap-bar | close | false |
| barbell | trap-bar | neutral | **true** |
| cable-machine | dual-d-handle | close | false |
| cable-machine | dual-d-handle | neutral | **true** |
| cable-machine | ez-curl-bar | close | false |
| cable-machine | ez-curl-bar | overhand | false |
| cable-machine | ez-curl-bar | underhand | **true** |
| cable-machine | lat-pulldown-bar | close | false |
| cable-machine | lat-pulldown-bar | overhand | **true** |
| cable-machine | lat-pulldown-bar | underhand | false |
| cable-machine | lat-pulldown-bar | wide | false |
| cable-machine | seated-row-bar | close | **true** |
| cable-machine | seated-row-bar | neutral | **true** |
| cable-machine | seated-row-bar | overhand | false |
| cable-machine | seated-row-bar | underhand | false |
| cable-machine | single-handle | neutral | false |
| cable-machine | single-handle | overhand | false |
| cable-machine | single-handle | underhand | false |
| cable-machine | straight-bar | close | false |
| cable-machine | straight-bar | overhand | **true** |
| cable-machine | straight-bar | underhand | false |
| cable-machine | straight-bar | wide | false |
| cable-machine | swiss-bar | close | false |
| cable-machine | swiss-bar | neutral | **true** |
| cable-machine | swiss-bar | wide | false |
| cable-machine | tricep-rope | close | false |
| cable-machine | tricep-rope | neutral | **true** |
| dumbbells | single-handle | neutral | false |
| dumbbells | single-handle | overhand | false |
| dumbbells | single-handle | underhand | false |
| lat-pulldown-machine | dual-d-handle | close | false |
| lat-pulldown-machine | dual-d-handle | neutral | **true** |
| lat-pulldown-machine | lat-pulldown-bar | close | false |
| lat-pulldown-machine | lat-pulldown-bar | overhand | **true** |
| lat-pulldown-machine | lat-pulldown-bar | underhand | false |
| lat-pulldown-machine | lat-pulldown-bar | wide | false |
| lat-pulldown-machine | seated-row-bar | close | **true** |
| lat-pulldown-machine | seated-row-bar | neutral | **true** |
| lat-pulldown-machine | seated-row-bar | overhand | false |
| lat-pulldown-machine | seated-row-bar | underhand | false |
| lat-pulldown-machine | single-handle | neutral | false |
| lat-pulldown-machine | single-handle | overhand | false |
| lat-pulldown-machine | single-handle | underhand | false |
| lat-pulldown-machine | straight-bar | close | false |
| lat-pulldown-machine | straight-bar | overhand | **true** |
| lat-pulldown-machine | straight-bar | underhand | false |
| lat-pulldown-machine | straight-bar | wide | false |
| lat-pulldown-machine | tricep-rope | close | false |
| lat-pulldown-machine | tricep-rope | neutral | **true** |
| leg-press-machine | single-handle | neutral | false |
| leg-press-machine | single-handle | overhand | false |
| leg-press-machine | single-handle | underhand | false |
| power-rack | dual-d-handle | close | false |
| power-rack | dual-d-handle | neutral | **true** |
| power-rack | dip-handles | close | false |
| power-rack | dip-handles | neutral | **true** |
| power-rack | ez-curl-bar | close | false |
| power-rack | ez-curl-bar | overhand | false |
| power-rack | ez-curl-bar | underhand | **true** |
| power-rack | lat-pulldown-bar | close | false |
| power-rack | lat-pulldown-bar | overhand | **true** |
| power-rack | lat-pulldown-bar | underhand | false |
| power-rack | lat-pulldown-bar | wide | false |
| power-rack | parallel-bars | close | false |
| power-rack | parallel-bars | neutral | **true** |
| power-rack | parallel-bars | wide | false |
| power-rack | pull-up-bar | close | false |
| power-rack | pull-up-bar | neutral | false |
| power-rack | pull-up-bar | overhand | **true** |
| power-rack | pull-up-bar | underhand | false |
| power-rack | pull-up-bar | wide | false |
| power-rack | seated-row-bar | close | **true** |
| power-rack | seated-row-bar | neutral | **true** |
| power-rack | seated-row-bar | overhand | false |
| power-rack | seated-row-bar | underhand | false |
| power-rack | single-handle | neutral | false |
| power-rack | single-handle | overhand | false |
| power-rack | single-handle | underhand | false |
| power-rack | straight-bar | close | false |
| power-rack | straight-bar | overhand | **true** |
| power-rack | straight-bar | underhand | false |
| power-rack | straight-bar | wide | false |
| power-rack | suspension-straps | close | false |
| power-rack | suspension-straps | neutral | **true** |
| power-rack | suspension-straps | overhand | false |
| power-rack | suspension-straps | underhand | false |
| power-rack | suspension-straps | wide | false |
| power-rack | swiss-bar | close | false |
| power-rack | swiss-bar | neutral | **true** |
| power-rack | swiss-bar | wide | false |
| power-rack | trap-bar | close | false |
| power-rack | trap-bar | neutral | **true** |
| power-rack | tricep-rope | close | false |
| power-rack | tricep-rope | neutral | **true** |
| seated-row-machine | dual-d-handle | close | false |
| seated-row-machine | dual-d-handle | neutral | **true** |
| seated-row-machine | lat-pulldown-bar | close | false |
| seated-row-machine | lat-pulldown-bar | overhand | **true** |
| seated-row-machine | lat-pulldown-bar | underhand | false |
| seated-row-machine | lat-pulldown-bar | wide | false |
| seated-row-machine | seated-row-bar | close | **true** |
| seated-row-machine | seated-row-bar | neutral | **true** |
| seated-row-machine | seated-row-bar | overhand | false |
| seated-row-machine | seated-row-bar | underhand | false |
| seated-row-machine | single-handle | neutral | false |
| seated-row-machine | single-handle | overhand | false |
| seated-row-machine | single-handle | underhand | false |
| seated-row-machine | straight-bar | close | false |
| seated-row-machine | straight-bar | overhand | **true** |
| seated-row-machine | straight-bar | underhand | false |
| seated-row-machine | straight-bar | wide | false |
| seated-row-machine | tricep-rope | close | false |
| seated-row-machine | tricep-rope | neutral | **true** |

## Summary Statistics

- **Total Equipment-Handle-Grip Records**: 130
- **Equipment Types Covered**: 8
  - ab-crunch-machine (7 combinations)
  - abductor-machine (7 combinations)
  - adductor-machine (7 combinations)
  - barbell (10 combinations)
  - cable-machine (17 combinations)
  - dumbbells (3 combinations)
  - lat-pulldown-machine (17 combinations)
  - leg-press-machine (3 combinations)
  - power-rack (37 combinations)
  - seated-row-machine (17 combinations)
- **Handle Types Used**: 12 (dip-handles, dual-d-handle, ez-curl-bar, lat-pulldown-bar, parallel-bars, pull-up-bar, seated-row-bar, single-handle, straight-bar, suspension-straps, swiss-bar, trap-bar, tricep-rope)
- **Grip Types Used**: 6 (close, neutral, overhand, underhand, wide)
- **Default Assignments**: 33 combinations marked as default

## Notes

- **Equipment Compatibility**: Each equipment type has specific compatible handle-grip combinations
- **Default Patterns**: Most equipment defaults to neutral grip where available
- **Barbell Equipment**: Traditional barbells follow expected grip patterns (overhand for straight-bar, neutral for swiss/trap bars)
- **Machine Equipment**: Cable and machine equipment generally defaults to neutral grips for handles like dual-d-handle and tricep-rope
- **Power Rack**: The most versatile equipment with 37 different handle-grip combinations
- **Grip Distribution**: Neutral grip is the most common default, followed by overhand

## Equipment-Specific Patterns

### Machine Equipment (ab-crunch, abductor, adductor, lat-pulldown, seated-row)
- Dual-d-handle defaults to **neutral** grip
- Single-handle defaults to **underhand** grip  
- Tricep-rope defaults to **neutral** grip
- Lat-pulldown-bar defaults to **overhand** grip
- Seated-row-bar has dual defaults: **close** and **neutral**

### Barbell Equipment
- Straight-bar defaults to **overhand** grip
- EZ-curl-bar defaults to **underhand** grip
- Swiss-bar and trap-bar default to **neutral** grip

### Power Rack (Most Versatile)
- Supports all handle types with appropriate grip defaults
- Pull-up-bar defaults to **overhand** grip
- Dip-handles and parallel-bars default to **neutral** grip
- Suspension-straps default to **neutral** grip

## Last Updated

This export reflects the database state as of 2025-08-28, immediately after the equipment-handle-grip mapping migration completion.