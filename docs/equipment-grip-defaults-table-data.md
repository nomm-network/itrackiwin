# Equipment Grip Defaults Table Data

Current state of the `equipment_grip_defaults` table with 16 grip default configurations.

## Equipment Grip Defaults

| Equipment | Handle | Grip | Is Default |
|---|---|---|---|
| cable-machine | single-handle | neutral | ✓ |
| cable-machine | straight-bar | overhand | ✓ |
| cable-machine | straight-bar | underhand | ✗ |
| cable-machine | tricep-rope | neutral | ✓ |
| cable-machine | (none) | overhand | ✓ |
| chest-press-machine | (none) | neutral | ✓ |
| dumbbell | (none) | neutral | ✓ |
| ez-curl-bar | straight-bar | neutral | ✓ |
| hack-squat-machine | (none) | neutral | ✓ |
| lat-pulldown-machine | single-handle | neutral | ✓ |
| lat-pulldown-machine | (none) | overhand | ✓ |
| leg-press-machine | (none) | neutral | ✓ |
| olympic-barbell | straight-bar | overhand | ✓ |
| pec-deck-machine | (none) | neutral | ✓ |
| smith-machine | straight-bar | overhand | ✓ |
| trap-bar | trap-bar | neutral | ✓ |

## Grip Usage Patterns

### Neutral Grip (8 configurations)
- **Free weights**: dumbbells, trap bar
- **Machines**: chest press, hack squat, leg press, pec deck
- **Cable**: single handles, tricep rope

### Overhand Grip (5 configurations)  
- **Barbells**: olympic barbell, smith machine
- **Cable**: straight bar, lat pulldown (no handle)

### Underhand Grip (1 configuration)
- **Cable**: straight bar (non-default option)

## Equipment Without Handle Requirements

These equipment pieces use built-in grips (handle_id = null):

- **dumbbell**: neutral grip (built-in handle)
- **chest-press-machine**: neutral grip (machine handles)
- **hack-squat-machine**: neutral grip (shoulder pads/handles)
- **lat-pulldown-machine**: overhand grip (lat bar attachment)
- **leg-press-machine**: neutral grip (foot plates)
- **pec-deck-machine**: neutral grip (arm pads/handles)

## Equipment Requiring Specific Handles

- **olympic-barbell**: requires straight-bar handle
- **ez-curl-bar**: requires straight-bar handle  
- **smith-machine**: requires straight-bar handle
- **trap-bar**: requires trap-bar handle
- **cable-machine**: supports multiple handles (single, straight-bar, tricep-rope)

## Default vs Non-Default Options

- **15 default configurations**: Primary recommended grip for each equipment/handle combo
- **1 non-default configuration**: Cable machine with straight bar + underhand grip (alternative option)

## Notes

- Total configurations: 16
- All entries created between 2025-08-29 14:33:15 and 14:36:42
- Covers key upper-body and lower-body equipment
- Provides foundation for grip-aware exercise programming