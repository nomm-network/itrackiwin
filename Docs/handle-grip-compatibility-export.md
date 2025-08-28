# Handle-Grip Compatibility Export

This document contains the complete export of the `handle_grip_compatibility` table as of the last update.

## Table Structure

The `handle_grip_compatibility` table maps which grips are compatible with each handle, along with default grip preferences.

### Columns:
- `handle_id` (UUID): Foreign key reference to handles table
- `grip_id` (UUID): Foreign key reference to grips table  
- `is_default` (boolean): Whether this grip is a default choice for the handle

## Complete Data Export

| Handle Slug | Grip Slug | Is Default |
|-------------|-----------|------------|
| dip-handles | close | false |
| dip-handles | neutral | **true** |
| dual-d-handle | close | false |
| dual-d-handle | neutral | **true** |
| ez-curl-bar | close | false |
| ez-curl-bar | overhand | false |
| ez-curl-bar | underhand | **true** |
| lat-pulldown-bar | close | false |
| lat-pulldown-bar | overhand | **true** |
| lat-pulldown-bar | underhand | false |
| lat-pulldown-bar | wide | false |
| parallel-bars | close | false |
| parallel-bars | neutral | **true** |
| parallel-bars | wide | false |
| pull-up-bar | close | false |
| pull-up-bar | neutral | false |
| pull-up-bar | overhand | **true** |
| pull-up-bar | underhand | false |
| pull-up-bar | wide | false |
| seated-row-bar | close | **true** |
| seated-row-bar | neutral | **true** |
| seated-row-bar | overhand | false |
| seated-row-bar | underhand | false |
| single-handle | neutral | false |
| single-handle | overhand | false |
| single-handle | underhand | false |
| straight-bar | close | false |
| straight-bar | overhand | **true** |
| straight-bar | underhand | false |
| straight-bar | wide | false |
| suspension-straps | close | false |
| suspension-straps | neutral | **true** |
| suspension-straps | overhand | false |
| suspension-straps | underhand | false |
| suspension-straps | wide | false |
| swiss-bar | close | false |
| swiss-bar | neutral | **true** |
| swiss-bar | wide | false |
| trap-bar | close | false |
| trap-bar | neutral | **true** |
| tricep-rope | close | false |
| tricep-rope | neutral | **true** |

## Summary Statistics

- **Total Compatibility Records**: 43
- **Handles with Compatibility Data**: 13
- **Grips Used**: 6 (close, neutral, overhand, underhand, wide)
- **Default Assignments**: 13 (some handles have multiple defaults for different grip dimensions)

## Notes

- **Multiple Defaults**: Some handles like `seated-row-bar` and `pull-up-bar` have multiple default grips because they represent different grip dimensions (hand position vs. width)
- **Neutral Preference**: Most bodyweight and cable handles default to neutral grip
- **Barbell Patterns**: Traditional barbells (straight-bar, ez-curl-bar) follow expected grip patterns
- **Coverage**: All major handle types have appropriate grip compatibility mappings

## Last Updated

This export reflects the database state as of the handle-equipment mapping migration completion.