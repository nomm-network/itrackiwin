# Handle-Equipment Export

This document contains the complete export of the `handle_equipment` table as of the last update.

## Table Structure

The `handle_equipment` table maps which handles are compatible with each piece of equipment, along with default handle preferences.

### Columns:
- `equipment_id` (UUID): Foreign key reference to equipment table
- `handle_id` (UUID): Foreign key reference to handles table
- `is_default` (boolean): Whether this handle is the default choice for the equipment

## Complete Data Export

| Equipment Slug | Handle Slug | Is Default |
|----------------|-------------|------------|
| ab-crunch-machine | dual-d-handle | false |
| ab-crunch-machine | single-handle | false |
| ab-crunch-machine | tricep-rope | false |
| abductor-machine | dual-d-handle | false |
| abductor-machine | single-handle | false |
| abductor-machine | tricep-rope | false |
| adductor-machine | dual-d-handle | false |
| adductor-machine | single-handle | false |
| adductor-machine | tricep-rope | false |
| cable-machine | dual-d-handle | false |
| cable-machine | lat-pulldown-bar | **true** |
| cable-machine | seated-row-bar | false |
| cable-machine | single-handle | false |
| cable-machine | tricep-rope | false |
| chest-press-machine | dual-d-handle | false |
| chest-press-machine | single-handle | false |
| chest-press-machine | tricep-rope | false |
| ez-curl-bar | ez-curl-bar | **true** |
| fixed-barbell | ez-curl-bar | false |
| fixed-barbell | straight-bar | **true** |
| glute-kickback-machine | dual-d-handle | false |
| glute-kickback-machine | single-handle | false |
| glute-kickback-machine | tricep-rope | false |
| lat-pulldown-machine | dual-d-handle | false |
| lat-pulldown-machine | lat-pulldown-bar | **true** |
| lat-pulldown-machine | seated-row-bar | false |
| lat-pulldown-machine | single-handle | false |
| lat-pulldown-machine | tricep-rope | false |
| leg-curl-machine | dual-d-handle | false |
| leg-curl-machine | single-handle | false |
| leg-curl-machine | tricep-rope | false |
| leg-extension-machine | dual-d-handle | false |
| leg-extension-machine | single-handle | false |
| leg-extension-machine | tricep-rope | false |
| leg-press-machine | dual-d-handle | false |
| leg-press-machine | single-handle | false |
| leg-press-machine | tricep-rope | false |
| low-row-machine | dual-d-handle | false |
| low-row-machine | single-handle | false |
| low-row-machine | tricep-rope | false |
| olympic-barbell | ez-curl-bar | false |
| olympic-barbell | straight-bar | **true** |
| olympic-barbell | swiss-bar | false |
| olympic-barbell | trap-bar | false |
| power-rack | dip-handles | **true** |
| power-rack | pull-up-bar | **true** |
| preacher-curl-machine | dual-d-handle | false |
| preacher-curl-machine | single-handle | false |
| preacher-curl-machine | tricep-rope | false |
| reverse-fly-machine | dual-d-handle | false |
| reverse-fly-machine | single-handle | false |
| reverse-fly-machine | tricep-rope | false |
| seated-calf-raise-machine | dual-d-handle | false |
| seated-calf-raise-machine | single-handle | false |
| seated-calf-raise-machine | tricep-rope | false |
| seated-row-machine | dual-d-handle | false |
| seated-row-machine | seated-row-bar | **true** |
| seated-row-machine | single-handle | false |
| seated-row-machine | tricep-rope | false |
| shoulder-press-machine | dual-d-handle | false |
| shoulder-press-machine | single-handle | false |
| shoulder-press-machine | tricep-rope | false |
| smith-machine | straight-bar | **true** |
| squat-rack | pull-up-bar | **true** |
| standing-calf-raise-machine | dual-d-handle | false |
| standing-calf-raise-machine | single-handle | false |
| standing-calf-raise-machine | tricep-rope | false |
| swiss-bar | swiss-bar | **true** |
| trap-bar | trap-bar | **true** |
| tricep-dip-machine | dual-d-handle | false |
| tricep-dip-machine | single-handle | false |
| tricep-dip-machine | tricep-rope | false |

## Equipment Categories

### 1. Free Weight Equipment
| Equipment | Default Handle | Alternative Handles |
|-----------|----------------|-------------------|
| olympic-barbell | straight-bar | ez-curl-bar, swiss-bar, trap-bar |
| fixed-barbell | straight-bar | ez-curl-bar |
| ez-curl-bar | ez-curl-bar | - |
| swiss-bar | swiss-bar | - |
| trap-bar | trap-bar | - |
| smith-machine | straight-bar | - |

### 2. Cable/Stack Machines
| Equipment | Default Handle | Alternative Handles |
|-----------|----------------|-------------------|
| cable-machine | lat-pulldown-bar | dual-d-handle, seated-row-bar, single-handle, tricep-rope |
| lat-pulldown-machine | lat-pulldown-bar | dual-d-handle, seated-row-bar, single-handle, tricep-rope |
| seated-row-machine | seated-row-bar | dual-d-handle, single-handle, tricep-rope |

### 3. Bodyweight Stations
| Equipment | Default Handle | Alternative Handles |
|-----------|----------------|-------------------|
| power-rack | dip-handles, pull-up-bar | - |
| squat-rack | pull-up-bar | - |

### 4. Plate-Loaded Machines
| Equipment | Default Handle | Alternative Handles |
|-----------|----------------|-------------------|
| chest-press-machine | none | dual-d-handle, single-handle, tricep-rope |
| shoulder-press-machine | none | dual-d-handle, single-handle, tricep-rope |
| leg-press-machine | none | dual-d-handle, single-handle, tricep-rope |
| leg-curl-machine | none | dual-d-handle, single-handle, tricep-rope |
| leg-extension-machine | none | dual-d-handle, single-handle, tricep-rope |

## Summary Statistics

- **Total Equipment-Handle Mappings**: 67
- **Equipment Pieces Mapped**: 20
- **Handles Used**: 8
- **Equipment with Default Handles**: 9
- **Equipment without Defaults**: 11 (mostly plate-loaded machines with fixed built-in handles)

## Handle Usage Distribution

| Handle | Usage Count | Default Count |
|--------|-------------|---------------|
| dual-d-handle | 17 | 0 |
| single-handle | 17 | 0 |
| tricep-rope | 17 | 0 |
| straight-bar | 3 | 3 |
| lat-pulldown-bar | 2 | 2 |
| seated-row-bar | 2 | 1 |
| pull-up-bar | 2 | 2 |
| dip-handles | 1 | 1 |
| ez-curl-bar | 2 | 1 |
| swiss-bar | 1 | 1 |
| trap-bar | 1 | 1 |

## Notes

- **Cable Attachments**: Most stack-based machines support the common cable attachments (dual-d-handle, single-handle, tricep-rope)
- **Dedicated Equipment**: Specialized bars (ez-curl-bar, swiss-bar, trap-bar) map 1:1 to their equipment counterparts
- **Multi-Station Equipment**: Power racks support both pull-up and dip functionalities
- **Realistic Mappings**: The mappings reflect real gym equipment capabilities and common usage patterns

## Last Updated

This export reflects the database state as of the handle-equipment mapping migration completion.