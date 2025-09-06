# API Documentation

## Overview
Complete API reference for the fitness platform, including REST endpoints, RPC functions, and integration patterns.

## Authentication

### Supabase JWT Authentication
```javascript
import { supabase } from '@/integrations/supabase/client';

// User signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// User login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

### API Key Access
```bash
# Headers for direct API access
Authorization: Bearer [JWT_TOKEN]
apikey: [SUPABASE_ANON_KEY]
Content-Type: application/json
```

## Core Entities API

### Exercises

#### Get Exercises
```javascript
// Get all public exercises
const { data, error } = await supabase
  .from('v_exercises_with_translations')
  .select('*')
  .limit(50);

// Search exercises by name
const { data, error } = await supabase
  .from('v_exercises_with_translations')
  .select('*')
  .ilike('name', '%bench press%');

// Filter by equipment
const { data, error } = await supabase
  .from('v_exercises_with_translations')
  .select('*')
  .eq('equipment_slug', 'barbell');

// Filter by muscle group
const { data, error } = await supabase
  .from('v_exercises_with_translations')
  .select('*')
  .eq('muscle_group_slug', 'chest');
```

#### Create Custom Exercise
```javascript
const { data, error } = await supabase
  .from('exercises')
  .insert({
    custom_display_name: 'My Custom Exercise',
    equipment_id: 'equipment-uuid',
    primary_muscle_id: 'muscle-uuid',
    is_public: false,
    owner_user_id: user.id
  });
```

### Workouts

#### Start Workout
```javascript
// Start workout from template
const { data, error } = await supabase.rpc('start_workout', {
  p_template_id: 'template-uuid'
});

// Start empty workout
const { data, error } = await supabase.rpc('start_workout');
```

#### Log Workout Set
```javascript
const { data, error } = await supabase.rpc('log_workout_set', {
  p_workout_exercise_id: 'workout-exercise-uuid',
  p_set_index: 1,
  p_metrics: {
    weight: { number: 100 },
    reps: { number: 8 },
    rpe: { number: 8 }
  },
  p_grip_ids: ['grip-uuid']
});
```

#### End Workout
```javascript
const { data, error } = await supabase.rpc('end_workout', {
  p_workout_id: 'workout-uuid'
});
```

### Workout Templates

#### Get User Templates
```javascript
const { data, error } = await supabase
  .from('workout_templates')
  .select(`
    *,
    template_exercises (
      *,
      exercises (name, equipment_id)
    )
  `)
  .eq('user_id', user.id);
```

#### Create Template
```javascript
const { data, error } = await supabase
  .from('workout_templates')
  .insert({
    name: 'Push Day',
    user_id: user.id,
    notes: 'Chest, shoulders, triceps'
  });
```

### Gyms

#### Get Marketplace Gyms
```javascript
const { data, error } = await supabase
  .from('v_marketplace_gyms')
  .select('*')
  .ilike('city', '%Berlin%')
  .order('active_members', { ascending: false })
  .limit(20);
```

#### Get Gym Details
```javascript
const { data, error } = await supabase
  .from('gyms')
  .select(`
    *,
    gym_equipment (
      equipment (name, slug),
      availability_status
    )
  `)
  .eq('slug', 'gym-slug')
  .single();
```

## RPC Functions

### User Management

#### Check User Role
```javascript
const { data, error } = await supabase.rpc('has_role', {
  _user_id: user.id,
  _role: 'admin'
});
```

#### Create Admin User
```javascript
const { data, error } = await supabase.rpc('create_admin_user', {
  target_user_id: 'user-uuid',
  requester_role: 'system'
});
```

### AI Coaching

#### Get Readiness Score
```javascript
const { data, error } = await supabase.rpc('compute_readiness_for_user', {
  p_user_id: user.id
});
```

#### Detect Training Stagnation
```javascript
const { data, error } = await supabase.rpc('fn_detect_stagnation', {
  p_exercise_id: 'exercise-uuid',
  p_lookback_sessions: 5
});
```

#### Generate Warmup
```javascript
const { data, error } = await supabase.rpc('fn_suggest_warmup', {
  p_exercise_id: 'exercise-uuid',
  p_working_weight: 100,
  p_working_reps: 8
});
```

#### Suggest Sets
```javascript
const { data, error } = await supabase.rpc('fn_suggest_sets', {
  p_exercise_id: 'exercise-uuid',
  p_progression_type: 'linear',
  p_target_reps: 8
});
```

### Commission System

#### Export Ambassador Commissions
```javascript
const { data, error } = await supabase.rpc('export_my_commissions_csv', {
  p_year: 2025,
  p_month: 1
});

// Download CSV
const blob = new Blob([data], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'commissions_2025_01.csv';
a.click();
```

#### Export Payouts (Superadmin Only)
```javascript
const { data, error } = await supabase.rpc('export_payouts_csv', {
  p_year: 2025,
  p_month: 1
});
```

#### Run Commission Accruals
```javascript
const { data, error } = await supabase.rpc('run_commission_accruals', {
  p_year: 2025,
  p_month: 1
});
```

### Analytics

#### Get Gym Activity
```javascript
const { data, error } = await supabase
  .from('v_gym_activity')
  .select('*')
  .eq('gym_id', 'gym-uuid');
```

#### Get Top Exercises for Gym
```javascript
const { data, error } = await supabase
  .from('v_gym_top_exercises')
  .select('*')
  .eq('gym_id', 'gym-uuid')
  .order('usages_30d', { ascending: false })
  .limit(10);
```

## Data Models

### Exercise Model
```typescript
interface Exercise {
  id: string;
  slug: string;
  display_name: string;
  custom_display_name?: string;
  equipment_id: string;
  primary_muscle_id?: string;
  body_part_id?: string;
  movement_pattern_id?: string;
  is_public: boolean;
  owner_user_id?: string;
  load_type?: 'dual_load' | 'single_load' | 'stack' | 'none';
  is_unilateral?: boolean;
  complexity_score?: number;
  created_at: string;
}
```

### Workout Model
```typescript
interface Workout {
  id: string;
  user_id: string;
  template_id?: string;
  started_at: string;
  ended_at?: string;
  readiness_score?: number;
  workout_exercises?: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_sets?: number;
  target_reps?: number;
  target_weight_kg?: number;
  weight_unit: 'kg' | 'lb';
  attribute_values_json?: any;
  workout_sets?: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  is_completed: boolean;
  completed_at?: string;
  metric_values?: WorkoutSetMetricValue[];
  grips?: WorkoutSetGrip[];
}
```

### Gym Model
```typescript
interface Gym {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address?: string;
  photo_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
}
```

### Mentor Model
```typescript
interface MentorProfile {
  id: string;
  user_id: string;
  role_key: string;
  life_category_id: string;
  headline?: string;
  bio?: string;
  hourly_rate_cents?: number;
  currency?: string;
  is_approved: boolean;
  is_public: boolean;
  accepts_clients: boolean;
  avatar_url?: string;
  slug?: string;
  created_at: string;
}
```

### Commission Model
```typescript
interface AmbassadorCommissionAgreement {
  id: string;
  ambassador_id: string;
  gym_id: string;
  battle_id: string;
  tier: string;
  percent: number;
  starts_at: string;
  ends_at?: string;
  created_at: string;
}

interface AmbassadorCommissionAccrual {
  id: string;
  agreement_id: string;
  year: number;
  month: number;
  gross_revenue: number;
  commission_due: number;
  computed_at: string;
}
```

## Error Handling

### Common Error Codes
```javascript
// Authentication errors
if (error?.code === 'invalid_credentials') {
  // Handle login failure
}

// Authorization errors  
if (error?.code === 'insufficient_privilege') {
  // Handle permission denied
}

// Data validation errors
if (error?.code === '23505') {
  // Handle unique constraint violation
}

// RLS policy errors
if (error?.message?.includes('row-level security')) {
  // Handle RLS policy violation
}
```

### Error Response Format
```typescript
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}
```

## Rate Limiting

### Default Limits
- **Authentication**: 60 requests/hour per IP
- **Database Queries**: 1000 requests/minute per user
- **RPC Functions**: 100 requests/minute per user
- **File Uploads**: 10 uploads/minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Real-time Subscriptions

### Workout Progress
```javascript
const subscription = supabase
  .channel('workout-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workout_sets',
    filter: `workout_exercise_id=eq.${workoutExerciseId}`
  }, (payload) => {
    console.log('Set logged:', payload);
  })
  .subscribe();
```

### Gym Equipment Status
```javascript
const subscription = supabase
  .channel('equipment-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public', 
    table: 'gym_equipment_availability',
    filter: `gym_id=eq.${gymId}`
  }, (payload) => {
    console.log('Equipment status changed:', payload);
  })
  .subscribe();
```

## SDK Integration Examples

### React Hooks
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Custom hook for exercises
export function useExercises(filters = {}) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: async () => {
      let query = supabase.from('v_exercises_with_translations').select('*');
      
      if (filters.equipment) {
        query = query.eq('equipment_slug', filters.equipment);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 300000, // 5 minutes
  });
}

// Custom hook for logging sets
export function useLogSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workoutExerciseId, setIndex, metrics, grips }) => {
      const { data, error } = await supabase.rpc('log_workout_set', {
        p_workout_exercise_id: workoutExerciseId,
        p_set_index: setIndex,
        p_metrics: metrics,
        p_grip_ids: grips
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sets'] });
    }
  });
}
```

### Flutter Integration
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

// Initialize Supabase
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);

final supabase = Supabase.instance.client;

// Get exercises
final response = await supabase
  .from('v_exercises_with_translations')
  .select()
  .limit(50);

// Log workout set
final response = await supabase.rpc('log_workout_set', params: {
  'p_workout_exercise_id': workoutExerciseId,
  'p_set_index': setIndex,
  'p_metrics': metrics,
  'p_grip_ids': grips,
});
```

## Testing

### Unit Tests
```javascript
import { supabase } from '@/integrations/supabase/client';

describe('Exercise API', () => {
  test('should fetch exercises', async () => {
    const { data, error } = await supabase
      .from('v_exercises_with_translations')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('name');
  });
});
```

### Integration Tests
```javascript
describe('Workout Flow', () => {
  test('should complete workout flow', async () => {
    // Start workout
    const { data: workout } = await supabase.rpc('start_workout');
    expect(workout).toBeDefined();
    
    // Log set
    const { data: set } = await supabase.rpc('log_workout_set', {
      p_workout_exercise_id: workoutExerciseId,
      p_set_index: 1,
      p_metrics: { weight: { number: 100 }, reps: { number: 8 } }
    });
    expect(set).toBeDefined();
    
    // End workout
    const { data: ended } = await supabase.rpc('end_workout', {
      p_workout_id: workout
    });
    expect(ended).toBeDefined();
  });
});
```

## Performance Optimization

### Query Optimization
```javascript
// Use select() to limit columns
const { data } = await supabase
  .from('exercises')
  .select('id, display_name, equipment_id')
  .limit(50);

// Use single() for single record queries
const { data } = await supabase
  .from('exercises')
  .select('*')
  .eq('id', exerciseId)
  .single();

// Use pagination for large datasets
const { data } = await supabase
  .from('exercises')
  .select('*')
  .range(0, 49); // First 50 records
```

### Caching Strategies
```javascript
// React Query with stale-while-revalidate
const { data } = useQuery({
  queryKey: ['exercises'],
  queryFn: fetchExercises,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Browser caching for static data
const { data } = await supabase
  .from('equipment')
  .select('*');
  
// Cache in localStorage for offline access
localStorage.setItem('equipment', JSON.stringify(data));
```

---

*Last Updated: 2025-01-06*
*API Version: v1.0*