# API Documentation

## Overview
This document covers all API endpoints, authentication, and integration patterns for the fitness platform.

## Authentication

### Supabase JWT
All API requests require a valid Supabase JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### API Keys
Edge functions use service role keys for internal operations:
```
apikey: <supabase_anon_key>
```

## Core API Endpoints

### Exercises API

#### Get Exercises
```http
GET /rest/v1/exercises
```

**Query Parameters**:
- `select`: Fields to return (default: `*`)
- `equipment_id`: Filter by equipment
- `body_part_id`: Filter by body part
- `primary_muscle_id`: Filter by primary muscle
- `is_public`: Filter public exercises (default: `true`)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Barbell Bench Press",
    "description": "Compound chest exercise",
    "equipment_id": "uuid",
    "body_part_id": "uuid",
    "primary_muscle_id": "uuid",
    "movement_pattern": "push",
    "complexity_score": 6,
    "is_public": true
  }
]
```

#### Search Exercises
```http
GET /rest/v1/rpc/search_exercises
```

**Parameters**:
```json
{
  "search_query": "bench press",
  "equipment_ids": ["uuid1", "uuid2"],
  "muscle_group_ids": ["uuid1"],
  "limit_count": 10
}
```

### Workouts API

#### Start Workout
```http
POST /rest/v1/rpc/start_workout
```

**Parameters**:
```json
{
  "template_id": "uuid" // Optional
}
```

**Response**:
```json
{
  "workout_id": "uuid",
  "started_at": "2024-01-15T10:30:00Z"
}
```

#### Log Set
```http
POST /rest/v1/rpc/set_log
```

**Parameters**:
```json
{
  "workout_exercise_id": "uuid",
  "weight": 100.0,
  "reps": 8,
  "rpe": 8.5,
  "weight_unit": "kg",
  "notes": "Felt strong today",
  "grip_ids": ["uuid1", "uuid2"],
  "metrics": [
    {
      "metric_def_id": "uuid",
      "value": {
        "number": 45.5
      }
    }
  ]
}
```

#### End Workout
```http
POST /rest/v1/rpc/end_workout
```

**Parameters**:
```json
{
  "workout_id": "uuid"
}
```

### User Data API

#### Get User Profile
```http
GET /rest/v1/profiles?user_id=eq.<user_id>
```

#### Update Fitness Profile
```http
POST /rest/v1/user_profile_fitness
```

**Parameters**:
```json
{
  "experience_level_id": "uuid",
  "sex": "male",
  "primary_goals": ["strength", "muscle"],
  "training_frequency": 4,
  "session_duration": 90
}
```

## Edge Functions

### AI Coach
```http
POST /functions/v1/ai-coach
```

**Request Body**:
```json
{
  "message": "How should I progress my bench press?",
  "context": {
    "recent_workouts": [],
    "fitness_profile": {},
    "current_exercise": "uuid"
  }
}
```

**Response**:
```json
{
  "response": "Based on your recent progress...",
  "suggestions": ["Increase weight by 2.5kg", "Focus on pause reps"],
  "confidence": 0.85
}
```

### Generate Workout
```http
POST /functions/v1/generate-workout
```

**Request Body**:
```json
{
  "user_id": "uuid",
  "workout_type": "push",
  "duration_minutes": 60,
  "equipment_available": ["barbell", "dumbbell"],
  "focus_areas": ["chest", "shoulders"]
}
```

**Response**:
```json
{
  "template_id": "uuid",
  "exercises": [
    {
      "exercise_id": "uuid",
      "order": 1,
      "sets": 3,
      "reps": 8,
      "intensity": 0.80
    }
  ],
  "estimated_duration": 65
}
```

### Form Coach
```http
POST /functions/v1/form-coach
```

**Request Body**:
```json
{
  "exercise_id": "uuid",
  "feedback": "Lower back feels tight",
  "video_data": "base64_encoded_video", // Optional
  "current_weight": 80.0
}
```

### Progress Insights
```http
POST /functions/v1/progress-insights
```

**Request Body**:
```json
{
  "user_id": "uuid",
  "timeframe": "30_days",
  "exercise_ids": ["uuid1", "uuid2"] // Optional
}
```

### Data Quality Check
```http
POST /functions/v1/data-quality-check
```

**Request Body**:
```json
{
  "action": "run_check" | "get_latest_report" | "get_trend"
}
```

## RPC Functions

### Workout Management
- `start_workout(template_id?)` - Start new workout session
- `end_workout(workout_id)` - Complete workout session
- `set_log(payload)` - Log exercise set with metrics
- `workout_open(workout_id)` - Get complete workout data

### Exercise Discovery
- `search_exercises(query, filters)` - Full-text exercise search
- `get_exercise_alternatives(exercise_id)` - Find similar exercises
- `get_user_last_set(exercise_id)` - Last set for progression
- `get_user_pr(exercise_id)` - Personal record for exercise

### Data Analysis
- `run_data_quality_check()` - Validate exercise data integrity
- `fn_detect_stagnation(exercise_id)` - Identify training plateaus
- `fn_suggest_sets(exercise_id)` - Generate set recommendations

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Weight must be a positive number",
    "details": {
      "field": "weight",
      "provided_value": -10
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Rate Limiting Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1704726000
```

## Webhooks

### Workout Events
Subscribe to workout events for real-time updates:

```http
POST /webhooks/workout-events
```

**Event Types**:
- `workout.started`
- `workout.completed`
- `set.logged`
- `pr.achieved`

**Payload Example**:
```json
{
  "event": "pr.achieved",
  "data": {
    "user_id": "uuid",
    "exercise_id": "uuid",
    "pr_type": "heaviest",
    "value": 120.0,
    "achieved_at": "2024-01-15T14:30:00Z"
  }
}
```

## Real-time Subscriptions

### Workout Progress
```javascript
const subscription = supabase
  .channel('workout-progress')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'workout_sets',
    filter: `workout_exercise_id=in.(${workoutExerciseIds.join(',')})`
  }, (payload) => {
    // Handle real-time set logging
  })
  .subscribe();
```

### Personal Records
```javascript
const prSubscription = supabase
  .channel('personal-records')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'personal_records',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle new PR notifications
  })
  .subscribe();
```

## Performance Guidelines

### Pagination
Always use pagination for large datasets:
```http
GET /rest/v1/workouts?limit=20&offset=40&order=started_at.desc
```

### Selective Queries
Use the `select` parameter to fetch only needed fields:
```http
GET /rest/v1/exercises?select=id,name,equipment_id
```

### Batch Operations
Use RPC functions for complex operations instead of multiple API calls:
```javascript
// Instead of multiple API calls
const { data } = await supabase.rpc('batch_exercise_search', {
  queries: ['bench press', 'squat', 'deadlift']
});
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Log a set
const { data, error } = await supabase.rpc('set_log', {
  workout_exercise_id: 'uuid',
  weight: 100,
  reps: 8,
  rpe: 8.5
});

// Get AI coaching
const { data: advice } = await supabase.functions.invoke('ai-coach', {
  body: { message: 'How can I improve my squat?' }
});
```

### cURL Examples
```bash
# Start workout
curl -X POST "https://your-project.supabase.co/rest/v1/rpc/start_workout" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"template_id": "uuid"}'

# Log set
curl -X POST "https://your-project.supabase.co/rest/v1/rpc/set_log" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "workout_exercise_id": "uuid",
    "weight": 100,
    "reps": 8,
    "rpe": 8.5
  }'
```

## Testing

### API Testing with Postman
Import our Postman collection for comprehensive API testing:
```json
{
  "collection_name": "Fitness Platform API",
  "endpoints": [
    "Authentication",
    "Exercises",
    "Workouts", 
    "AI Coach",
    "Progress Tracking"
  ]
}
```

### Integration Testing
```typescript
describe('Workout API Integration', () => {
  it('should complete full workout flow', async () => {
    // Start workout
    const workout = await startWorkout();
    
    // Add exercises
    await addExerciseToWorkout(workout.id, exerciseId);
    
    // Log sets
    await logSet(workoutExerciseId, { weight: 100, reps: 8 });
    
    // End workout
    await endWorkout(workout.id);
    
    expect(workout.ended_at).toBeTruthy();
  });
});
```