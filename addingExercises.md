# Adding Exercises - Admin Setup Guide

Got it. Here's the exact, step-by-step Admin prep to complete before you open "Add Exercise". I'm calling out the page you need, the tables it feeds, and the minimum you must enter so grips/handles/equipment all show up correctly.

⸻

## 0) Sanity: what must exist already
•	Tables in use: body_parts, muscle_groups, muscles (+ their *_translations), equipment, handles, grips, handle_equipment, handle_grip_compatibility, equipment_handle_grips, tags (or movement tags), exercise_aliases (optional later).
•	Decision we're following:
•	Grips: orientation only (overhand, underhand, neutral, mixed).
•	Handles: used for exercise creation defaults/compat, not in workout UI.
•	Angles: modeled as separate exercises (Flat / Incline / Decline etc.), not attributes.

⸻

## 1) Body Taxonomy (once)

**Admin page**: "Body Taxonomy"  
**Tables**: body_parts, muscle_groups, muscles (+ translations)

**Do**:
•	Confirm the 5 body parts exist (arms, back, chest, core, legs).
•	Confirm the muscle_groups you'll actually assign as primary in exercises (e.g., chest; shoulders; biceps; triceps; forearms; back; traps; neck; abs; obliques; lower_back; quads; hamstrings; calves; glutes).
•	Keep muscle-level rows (Upper/Mid/Lower Chest etc.) only if you'll display them; primary assignment will reference muscle_groups.

**Readiness check**: each body_part has ≥1 muscle_group, and each muscle_group has translations (en/ro).

⸻

## 2) Movement Tags (lightweight)

**Admin page**: "Movements" (or reuse your Tags page)  
**Tables**: tags (or movement_types if you have it)

**Do** (simple): create a small, controlled list as tags:
Press, Row, Pull-down, Fly, Curl, Extension, Raise, Squat, Hinge, Lunge, Carry, Rotation/Anti-rotation.

**Readiness check**: at least those 10–12 tags exist so you can tag new exercises.

⸻

## 3) Equipment

**Admin page**: "Equipment"  
**Table**: equipment

**Do**:
•	Ensure your popular items exist with correct load_type and load_medium and defaults (bar weight, stack json, min increments).
Examples: Olympic barbell (dual_load + bar), EZ bar (single_load + bar), benches (flat/incline/decline), cable stations (stack), plate-loaded machines (dual_load + plates), fixed dumbbells (single_load + other or plates if adjustable), smith (dual_load + bar/plates), etc.

**Readiness check**: every equipment you'll attach to early chest/row/curl/triceps/cable exercises exists and has sensible defaults.

⸻

## 4) Handles

**Admin page**: "Handles"  
**Table**: handles (+ translations)

**Do** (keep it lean):
•	Bar family: straight-bar, ez-curl-bar, trap-bar, swiss-bar.
•	Cable family: lat-pulldown-bar, seated-row-bar, tricep-rope, single-handle, dual-d-handle.
•	Bodyweight/special: pull-up-bar, dip-handles, suspension-straps, parallel-bars.

**Readiness check**: at least the above are present; translations ok.

⸻

## 5) Grips (orientation only)

**Admin page**: "Grips"  
**Table**: grips (+ translations)

**Do**: overhand, underhand, neutral, mixed. That's it.

**Readiness check**: all four exist and are visible.

⸻

## 6) Compatibility (the critical wiring so grips appear)

You'll do these three in this order; this is the most common reason "grips don't show."

### 6.1 Handle ↔ Equipment

**Admin page**: "Handle–Equipment Compatibility"  
**Table**: handle_equipment

**Do**: For each equipment, tick the real-world handles it accepts. Examples:
•	Olympic barbell → straight-bar, ez-curl-bar (optional for curls), swiss-bar (optional).
•	Cable station (lat-pulldown) → lat-pulldown-bar, tricep-rope, single-handle, dual-d-handle.
•	Seated row → seated-row-bar, v-bar/dual-d-handle, single-handle.
•	Pull-up station → pull-up-bar. Dip station → dip-handles. Smith → straight-bar.

This step guarantees the handle list populates when you pick equipment in Add Exercise.

### 6.2 Handle ↔ Grip (orientation)

**Admin page**: "Handle–Grip Compatibility"  
**Table**: handle_grip_compatibility

**Do**: Allow the orientations each handle reasonably supports:
•	Straight-bar: overhand, underhand, mixed (for deadlift); neutral = no.
•	EZ-curl-bar: overhand, underhand (neutral grips don't exist on EZ).
•	Swiss-bar / dual-D / pull-up bars with parallel grips: neutral (+ over/under if the bar shape allows).
•	Rope: neutral (primary).
•	Single-handle: neutral, overhand, underhand (forearm rotation).

This step is what makes the grip options even eligible.

### 6.3 Equipment ↔ Handle ↔ Grip (defaults)

**Admin page**: "Equipment Default Grips"  
**Table**: equipment_handle_grips

**Do**: Seed a sane default orientation per (equipment, handle):
•	Lat-pulldown machine + lat-pulldown-bar → default overhand.
•	Seated row + seated-row-bar → default neutral.
•	Cable + tricep-rope → default neutral.
•	Barbell (straight) → default overhand for presses/rows, mixed appears later for deadlift-type.

This gives the Add Exercise form a preselected grip when you pick equipment+handle.

**Readiness check**: pick a few equipment rows and confirm the UI now shows compatible handles and (when a handle is chosen) the grip list. If grips still don't show, it means 6.2 or 6.3 is empty or the Add Exercise form isn't requesting them by the correct equipment_id/handle_id.

⸻

## 7) Tags & Aliases (search quality)

**Admin pages**: "Exercise Tags", "Aliases/Synonyms"  
**Tables**: tags (join table for exercises later), exercise_aliases

**Do**: Prepare common aliases per family (e.g., "incline press", "inclined press", "negative bench" → Decline, "front squat" alias if you add it, etc.). You'll attach them after exercises exist.

⸻

## 8) Final pre-flight before "Add Exercise"

Quick mental checklist:
•	✅ Equipment present & correct defaults
•	✅ Handles exist
•	✅ Grips (4 orientations) exist
•	✅ handle_equipment populated (so handles appear per equipment)
•	✅ handle_grip_compatibility populated (so grips appear per handle)
•	✅ equipment_handle_grips has defaults (so something is preselected)
•	✅ Movement tags ready (so you can tag exercises)
•	✅ Body taxonomy solid (so you can assign primary muscle_group)

⸻

## What the Add Exercise form expects (so it doesn't look empty)
1.	You choose Equipment → form loads handles from handle_equipment.
2.	You choose a Handle → form loads grips from handle_grip_compatibility filtered by that handle; if a default exists in equipment_handle_grips, it preselects it.
3.	You set Primary muscle_group (not individual muscle).
4.	Add movement tag(s), aliases, and any simple attributes (tempo/ROM if you use them).
5.	Save.

If any list is empty:
•	Empty Handles list ⇒ missing handle_equipment for that equipment.
•	Handles show but Grips empty ⇒ missing handle_grip_compatibility for that handle.
•	A grip list shows but no default ticked ⇒ missing equipment_handle_grips default row.

⸻

## Minimal pages you need in Admin (just the ones to build pre-data)
•	Body Taxonomy
•	Movements/Tags
•	Equipment
•	Handles
•	Grips
•	Handle–Equipment Compatibility
•	Handle–Grip Compatibility
•	Equipment Default Grips
•	(Optional) Aliases/Synonyms

Keep these lean; no extra complexity required.

If you want, I can give you a super short QA checklist for each page (what to test in 30 seconds) so your operator can blitz through setup and ensure "Add Exercise" always shows valid handles and grips.