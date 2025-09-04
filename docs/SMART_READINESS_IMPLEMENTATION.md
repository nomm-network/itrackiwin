# Smart Readiness, Targets and Warmups Implementation

## Overview
Successfully implemented a complete smart readiness system that automatically adjusts workout targets and generates warmup plans based on user readiness scores.

## Database Functions Added

### 1. Readiness Score Calculation
- `compute_readiness_score()` - Calculates 0-100 readiness score based on:
  - Energy (20% weight)
  - Sleep quality (20% weight) 
  - Sleep hours (20% weight)
  - Soreness (20% weight, inverted)
  - Stress (10% weight, inverted)
  - Illness (-20 penalty)
  - Alcohol (-10 penalty)
  - Supplements (+10% max bonus)

### 2. Base Load Selection
- `pick_base_load()` - Intelligently selects baseline weight from recent workouts:
  - Prefers high-readiness sessions (>60 score) within last 60 days
  - Falls back to most recent workout if no high-readiness data
  - Limited to last 3 workouts for relevance

### 3. Readiness Multiplier
- `readiness_multiplier()` - Maps readiness score to weight adjustment:
  - <30: 0.90x (10% reduction)
  - 30-40: 0.95x (5% reduction) 
  - 40-50: 0.98x (2% reduction)
  - 50-60: 1.00x (no change)
  - 60-70: 1.02x (2% increase)
  - 70-80: 1.04x (4% increase)
  - 80-90: 1.06x (6% increase)
  - 90+: 1.08x (8% increase)

### 4. Warmup Generation
- `generate_warmup_steps()` - Creates 3-step progressive warmup:
  - 40% working weight × 10 reps (60s rest)
  - 60% working weight × 8 reps (90s rest)
  - 80% working weight × 5 reps (120s rest)

## Database Schema Updates

### New Tables
- `readiness_logs` - Stores user readiness check-ins with full RLS

### Column Additions
- `workouts.readiness_score` - Stores computed readiness score for the workout
- `workout_exercises.readiness_adjusted_from` - References source workout_exercise used for target calculation

## Updated Start Workflow

### Enhanced `start_workout()` RPC
1. Creates workout record
2. Fetches latest readiness data from `readiness_logs`
3. Computes readiness score using `compute_readiness_score()`
4. For each template exercise:
   - Gets base load from `pick_base_load()` 
   - Falls back to template target or user estimates
   - Applies readiness multiplier
   - Generates warmup steps
   - Stores all data in `workout_exercises` with `attribute_values_json.warmup`

## Frontend Integration

### New Components
- `SmartTargetDisplay` - Shows target weight, readiness score, and warmup steps
- `useReadinessCheckin` - Hook for saving readiness data

### Updated Workflow
1. User fills readiness check-in (energy, sleep, etc.)
2. Data saved to `readiness_logs` table
3. Start workout calls enhanced `start_workout()` RPC
4. Targets and warmups automatically calculated and displayed
5. UI shows readiness-adjusted targets with source attribution

## Key Benefits

### Deterministic Target Setting
- Always uses best available data source (recent high-readiness > template > estimates)
- Consistent readiness-based adjustments
- Full audit trail of source data

### Smart Base Selection
- Prefers high-performance baseline sessions
- Avoids using data from low-readiness workouts
- Maintains relevance with 60-day window

### Immediate Warmup Availability
- No more blank warmup displays on workout start
- Progressive warmup automatically scaled to working weight
- Clear rest periods between warmup sets

### User Experience
- Single start workflow (no complex options)
- Transparent readiness scoring
- Clear indication of target source and adjustments

## Implementation Notes

- All database functions use `SECURITY DEFINER` with proper auth checks
- RLS policies ensure data isolation between users
- Default readiness score of 65 used when no check-in data available
- Warmup steps stored as JSON in `attribute_values_json` for flexibility
- System gracefully handles missing data at each fallback level