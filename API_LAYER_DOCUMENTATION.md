# API Layer Documentation

## Overview

The fitness application API layer provides a comprehensive, type-safe interface for all backend operations. Built with Supabase Edge Functions and fully documented with OpenAPI 3.0.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web App       │    │   Edge Functions │    │   Database      │
│   (React)       │    │   (Deno)         │    │   (PostgreSQL)  │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ FitnessApiClient│────│ /fitness-profile │────│ user_profile_*  │
│                 │    │ /workout-*       │    │ workout_*       │
│ Type Safety     │    │ /exercise-*      │    │ exercises       │
│ Error Handling  │    │ /equipment-*     │    │ equipment       │
│ Retry Logic     │    │ /recalibrate-*   │    │ admin_*         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Endpoints

### 🏃‍♂️ Fitness Profile
- `GET /fitness-profile` - Get user fitness profile
- `PUT /fitness-profile` - Update user fitness profile

### 💪 Workout Templates  
- `GET /workout-templates` - List user templates (paginated)
- `GET /workout-templates/{id}` - Get specific template
- `POST /workout-templates` - Create custom template
- `POST /workout-templates` (with `generate: true`) - AI-generate template

### 🔄 Exercise Alternatives
- `POST /exercise-alternatives` - Suggest alternatives based on criteria

### ⚙️ Equipment Capabilities
- `GET /equipment-capabilities` - List all equipment capabilities
- `GET /equipment-capabilities?equipment_id={id}` - Get specific equipment

### 🔧 Admin Recalibration
- `POST /recalibrate-trigger` - Trigger user plan recalibration (admin only)

## Usage Examples

### TypeScript Client
```typescript
import { fitnessApi } from '@core/api';

// Get fitness profile
const { data: profile } = await fitnessApi.getFitnessProfile();

// Update profile
const updatedProfile = await fitnessApi.updateFitnessProfile({
  experience_level: 'intermediate',
  training_frequency: 4
});

// Generate workout template
const template = await fitnessApi.generateWorkoutTemplate({
  user_id: userId,
  session_duration: 60,
  target_muscle_groups: [chestId, shouldersId]
});

// Get exercise alternatives
const alternatives = await fitnessApi.suggestExerciseAlternatives({
  exercise_id: benchPressId,
  reason: 'equipment_unavailable',
  limit: 5
});
```

### React Hooks Integration
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { fitnessApi } from '@core/api';

function FitnessProfileForm() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['fitness-profile'],
    queryFn: () => fitnessApi.getFitnessProfile()
  });

  const updateMutation = useMutation({
    mutationFn: fitnessApi.updateFitnessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['fitness-profile']);
    }
  });

  // Component implementation...
}
```

## Type Safety

All endpoints are fully typed with Zod schemas:

```typescript
// Request validation
const updateData = UpdateFitnessProfileSchema.parse(requestBody);

// Response typing
const profile: FitnessProfile = await fitnessApi.getFitnessProfile();

// Error handling with types
try {
  await fitnessApi.updateFitnessProfile(data);
} catch (error: ApiError) {
  console.error(error.message, error.code);
}
```

## Error Handling

The API client includes comprehensive error handling:

```typescript
// Automatic retry with exponential backoff
const result = await fitnessApi.retryOperation(
  () => fitnessApi.generateWorkoutTemplate(request),
  3, // max retries
  1000 // initial delay
);

// Graceful fallbacks
const profile = await fitnessApi.withErrorHandling(
  () => fitnessApi.getFitnessProfile(),
  null // fallback value
);
```

## Features

### ✅ Type Safety
- Zod schema validation on all endpoints
- Full TypeScript support
- Runtime type checking

### ✅ Error Resilience  
- Automatic retry logic
- Graceful fallback handling
- Comprehensive error types

### ✅ Authentication
- Automatic Supabase token handling
- Row-level security enforcement
- Admin role checking

### ✅ Performance
- Request caching with React Query
- Pagination support
- Optimistic updates

### ✅ Developer Experience
- OpenAPI 3.0 documentation
- Auto-generated types
- Consistent response format

## FlutterFlow Integration

The API is designed for seamless FlutterFlow integration:

```dart
// FlutterFlow HTTP calls will work directly
final response = await http.get(
  'https://fsayiuhncisevhipbrak.supabase.co/functions/v1/fitness-profile',
  headers: {'Authorization': 'Bearer $token'}
);

// Type-safe deserialization available via OpenAPI codegen
final profile = FitnessProfile.fromJson(response.data);
```

## Security

- **Authentication**: All endpoints require Bearer token
- **Authorization**: Admin endpoints check user roles
- **Validation**: Input validation with Zod schemas
- **Audit**: Admin actions logged to audit table
- **CORS**: Proper CORS headers for web/mobile access

## Monitoring

Each edge function includes comprehensive logging:

```typescript
console.log(`${req.method} /endpoint-name`);
console.error('Operation failed:', error);
```

Logs are available in the Supabase dashboard for debugging and monitoring.

## OpenAPI Documentation

Full interactive API documentation is available in `openapi.yaml` and can be viewed with tools like Swagger UI or Redoc for complete endpoint reference, request/response examples, and schema definitions.