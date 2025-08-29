# Compatibility Data Export

## Handle-Equipment Compatibility (169 mappings)

### Key Compatible Pairs (Defaults)
- **barbell** → **straight-bar** (default)
- **cable-machine** → **cable-handle** (default) 
- **cable-machine** → **lat-pulldown-bar** (default)
- **dumbbell** → **dumbbell-handle** (default)
- **ez-curl-bar** → **ez-curl-bar** (default)

### Full Equipment Coverage
Every equipment type has compatible handles:
- Machines (ab-crunch, chest-press, etc.) → cable attachments
- Barbells → straight-bar, ez-curl-bar
- Cable systems → multiple cable handles
- Specialized equipment → appropriate handles

## Handle-Grip Compatibility (22 mappings)

### Universal Compatibility Patterns
Most handles support multiple grips:

**Full 4-Grip Support (most handles):**
- straight-bar: overhand, underhand, neutral, mixed
- single-handle: overhand, underhand, neutral
- suspension-straps: overhand, underhand, neutral

**Neutral-Only Handles (specialized):**
- dip-handles: neutral only
- dual-d-handle: neutral only
- seated-row-bar: neutral only
- swiss-bar: neutral only
- trap-bar: neutral only
- tricep-rope: neutral only

**Limited Grip Handles:**
- ez-curl-bar: overhand, underhand (no neutral/mixed)
- lat-pulldown-bar: overhand, underhand, neutral (no mixed)
- pull-up-bar: overhand, underhand (no neutral/mixed)

## Equipment-Handle-Grips Three-Way Mapping (529 total)

### Default Grip Assignments
All equipment-handle combinations default to **overhand** grip where applicable:
- Cable machines with lat-pulldown-bar → overhand (default)
- Barbell with straight-bar → overhand (default)
- Most machine handles → neutral (default for specialized handles)

### Coverage Statistics
- **42 equipment** items
- **15 handle** types  
- **4 grip** orientations
- **169 equipment-handle** pairs
- **529 equipment-handle-grip** combinations
- **22 handle-grip** compatibility rules

## Critical Success Metrics
✅ **No Equipment Without Handles**: Every equipment has at least one compatible handle
✅ **No Handle Without Grips**: Every handle has at least one compatible grip  
✅ **Default Paths Exist**: Every equipment has a default handle and default grip
✅ **Fallback Coverage**: System can fall back to all 4 grips if needed

This comprehensive compatibility matrix ensures the grip selector will always show options and never present empty states during exercise creation.