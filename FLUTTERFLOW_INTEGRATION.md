# FlutterFlow Integration Guide

## Overview

This guide provides FlutterFlow developers with everything needed to integrate with the iTrack.iWin fitness backend API. All endpoints return simple, flat data structures optimized for FlutterFlow's data binding.

## Base Configuration

**API Base URL**: `https://fsayiuhncisevhipbrak.supabase.co/functions/v1/flutterflow-api`

**Authentication**: Include the user's JWT token in the Authorization header:
```
Authorization: Bearer <user_jwt_token>
```

## Standard Response Format

All endpoints return a consistent response structure:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (if success=false),
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "hasMore": boolean
  }
}
```

## Pagination Parameters

Most list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## Component Recipes

### 1. User Onboarding Flow

#### Step 1: Experience Level Selection

**Page**: ExperienceLevelPage
**API Call**: `GET /onboarding/experience-levels`

```dart
// FlutterFlow Action: API Call
// Method: GET
// URL: ${baseUrl}/onboarding/experience-levels
// Response Schema:
{
  "success": true,
  "data": [
    {
      "id": "beginner",
      "name": "Beginner",
      "description": "0-6 months training",
      "minTrainingMonths": 0
    }
  ]
}

// UI Binding:
// ListView -> data
// ListTile.title -> data[index].name
// ListTile.subtitle -> data[index].description
```

#### Step 2: Fitness Profile Setup

**Page**: FitnessProfilePage
**API Call**: `POST /onboarding/fitness-profile`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/onboarding/fitness-profile
// Body Schema:
{
  "sex": "male", // "male" | "female"
  "age": 25,
  "heightCm": 175,
  "weightKg": 70,
  "activityLevel": "moderate",
  "experienceLevel": "beginner",
  "primaryGoal": "strength",
  "availableDaysPerWeek": 3,
  "sessionDurationMinutes": 60,
  "injuries": ["lower_back", "knee"]
}

// Form Binding:
// DropdownButton -> sex
// Slider -> age, heightCm, weightKg
// Radio/Checkbox -> activityLevel, primaryGoal
// NumberField -> availableDaysPerWeek, sessionDurationMinutes
```

#### Step 3: Muscle Priority Selection

**Page**: MusclePriorityPage
**API Call**: `POST /onboarding/muscle-priorities`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/onboarding/muscle-priorities
// Body Schema:
{
  "priorities": [
    {
      "muscleGroupId": "chest",
      "priorityLevel": "high"
    },
    {
      "muscleGroupId": "legs",
      "priorityLevel": "medium"
    }
  ]
}

// UI Implementation:
// Use GridView with selectable cards
// Each card represents a muscle group
// Tap to cycle: none -> low -> medium -> high
```

### 2. Workout Templates List

**Page**: TemplatesListPage
**API Call**: `GET /templates?page=1&limit=20`

```dart
// FlutterFlow Action: API Call
// Method: GET
// URL: ${baseUrl}/templates
// Query Parameters: page, limit

// Response Schema:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Push Day",
      "description": "Chest, shoulders, triceps",
      "exerciseCount": 6,
      "isPublic": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "exercises": [
        {
          "id": "exercise-uuid",
          "name": "Bench Press",
          "defaultSets": 3,
          "targetReps": 8
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}

// UI Binding:
// ListView -> data
// Card.title -> data[index].name
// Card.subtitle -> "${data[index].exerciseCount} exercises"
// Card.trailing -> IconButton for starting workout
```

#### Generate New Template

**Page**: TemplateGeneratorPage
**API Call**: `POST /templates/generate`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/templates/generate
// Body Schema:
{
  "targetSessions": 3,
  "sessionDuration": 60,
  "equipmentAvailable": ["barbell", "dumbbells", "machine"],
  "focusAreas": ["strength", "hypertrophy"]
}

// Response Schema:
{
  "success": true,
  "data": {
    "templateId": "new-template-uuid",
    "name": "Generated Template",
    "exerciseCount": 8,
    "estimatedDuration": 60
  }
}
```

### 3. Active Workout Session

#### Start Workout Session

**Page**: StartWorkoutPage
**API Call**: `POST /session/start`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/session/start
// Body Schema:
{
  "templateId": "template-uuid", // optional
  "readinessData": {
    "energy": 7,
    "sleepQuality": 8,
    "sleepHours": 7.5,
    "soreness": 3,
    "stress": 4,
    "illness": false,
    "alcohol": false
  }
}

// Response Schema:
{
  "success": true,
  "data": {
    "workoutId": "workout-uuid",
    "estimatedDuration": 3600,
    "exerciseCount": 6,
    "startedAt": "2024-01-15T14:30:00Z"
  }
}

// Page Navigation:
// On success -> Navigate to WorkoutSessionPage
// Pass workoutId as parameter
```

#### Active Session Display

**Page**: WorkoutSessionPage
**API Call**: `GET /session/current`

```dart
// FlutterFlow Action: API Call (on page load)
// Method: GET
// URL: ${baseUrl}/session/current

// Response Schema:
{
  "success": true,
  "data": {
    "id": "workout-uuid",
    "title": "Push Day",
    "startedAt": "2024-01-15T14:30:00Z",
    "exercises": [
      {
        "id": "we-uuid",
        "exerciseId": "exercise-uuid",
        "exerciseName": "Bench Press",
        "orderIndex": 1,
        "completedSets": 2,
        "totalSets": 3,
        "lastSet": {
          "weight": 80,
          "reps": 8
        }
      }
    ]
  }
}

// UI Implementation:
// PageView -> exercises (swipe between exercises)
// LinearProgressIndicator -> completedSets/totalSets
// Text -> exerciseName
// If lastSet exists: "Last: ${lastSet.weight}kg × ${lastSet.reps}"
```

#### Log Set

**Component**: SetInputForm
**API Call**: `POST /session/log-set`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/session/log-set
// Body Schema:
{
  "workoutExerciseId": "we-uuid",
  "weight": 80.0,
  "reps": 8,
  "rpe": 7.5, // optional
  "notes": "Felt strong today", // optional
  "weightUnit": "kg"
}

// Response Schema:
{
  "success": true,
  "data": {
    "setId": "set-uuid",
    "isNewPR": true,
    "lastSet": {
      "weight": 80,
      "reps": 8,
      "completedAt": "2024-01-15T15:00:00Z"
    }
  }
}

// UI Form:
// TextFormField -> weight (number input)
// TextFormField -> reps (number input)
// Slider -> rpe (1-10)
// TextFormField -> notes (optional)
// ElevatedButton -> "Log Set" (triggers API call)

// Post-Submit Actions:
// 1. Show success message
// 2. If isNewPR: Show celebration dialog
// 3. Update UI with new set data
// 4. Clear form fields
```

#### End Session

**API Call**: `POST /session/end`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/session/end
// Body Schema:
{
  "workoutId": "workout-uuid"
}

// Response Schema:
{
  "success": true,
  "data": {
    "workoutId": "workout-uuid",
    "endedAt": "2024-01-15T16:00:00Z"
  }
}

// Page Navigation:
// On success -> Navigate to WorkoutSummaryPage
// Pass workoutId as parameter
```

### 4. Exercise Swapping/Alternatives

#### Search Exercises

**Page**: ExerciseSearchPage
**API Call**: `GET /exercises/search?q=bench&muscle_group=chest&page=1`

```dart
// FlutterFlow Action: API Call
// Method: GET
// URL: ${baseUrl}/exercises/search
// Query Parameters:
// - q: search term
// - muscle_group: filter by muscle group
// - equipment: filter by equipment
// - page, limit: pagination

// Response Schema:
{
  "success": true,
  "data": [
    {
      "id": "exercise-uuid",
      "name": "Dumbbell Bench Press",
      "description": "Press dumbbells while lying on bench",
      "imageUrl": "https://...",
      "bodyPart": "upper_body",
      "muscleGroup": "Chest",
      "equipment": "Dumbbells"
    }
  ],
  "pagination": {...}
}

// UI Implementation:
// SearchBar -> q parameter
// FilterChips -> muscle_group, equipment
// ListView.builder -> data with pagination
// ListTile with image, title, subtitle
```

#### Get Exercise Alternatives

**Component**: ExerciseAlternativesDialog
**API Call**: `POST /exercises/alternatives`

```dart
// FlutterFlow Action: API Call
// Method: POST
// URL: ${baseUrl}/exercises/alternatives
// Body Schema:
{
  "exerciseId": "current-exercise-uuid",
  "reason": "equipment_unavailable", // or "injury", "preference"
  "availableEquipment": ["dumbbells", "cables"]
}

// Response Schema:
{
  "success": true,
  "data": [
    {
      "id": "alt-exercise-uuid",
      "name": "Dumbbell Press",
      "similarity": 0.95,
      "reason": "Same movement pattern, different equipment"
    }
  ]
}

// UI Implementation:
// ShowDialog with ListView of alternatives
// Each ListTile shows name, similarity score
// Tap to select alternative
// Replace current exercise in workout
```

### 5. Progress Tracking

#### Progress Summary

**Page**: ProgressDashboardPage
**API Call**: `GET /progress/summary`

```dart
// FlutterFlow Action: API Call
// Method: GET
// URL: ${baseUrl}/progress/summary

// Response Schema:
{
  "success": true,
  "data": {
    "totalWorkouts": 45,
    "thisWeekWorkouts": 3,
    "recentPRs": [
      {
        "exerciseName": "Bench Press",
        "type": "1RM",
        "value": 100,
        "achievedAt": "2024-01-15T16:00:00Z"
      }
    ]
  }
}

// UI Binding:
// Card -> totalWorkouts
// Card -> thisWeekWorkouts
// ListView -> recentPRs
```

#### Exercise History

**Page**: ExerciseHistoryPage
**API Call**: `GET /progress/exercise-history?exercise_id=uuid&page=1`

```dart
// FlutterFlow Action: API Call
// Method: GET
// URL: ${baseUrl}/progress/exercise-history
// Query Parameters: exercise_id (required), page, limit

// Response Schema:
{
  "success": true,
  "data": [
    {
      "weight": 80,
      "reps": 8,
      "rpe": 7,
      "completedAt": "2024-01-15T15:00:00Z",
      "workoutDate": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {...}
}

// UI Implementation:
// LineChart for weight progression over time
// ListView for detailed set history
// Filter by date range
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

**FlutterFlow Error Handling**:
1. Check `success` field in response
2. If `false`, display `error` message to user
3. Handle network errors with try-catch
4. Show appropriate loading states

## Authentication Setup

1. **Login/Signup**: Use Supabase Auth directly in FlutterFlow
2. **Token Management**: Store JWT token in FlutterFlow's app state
3. **Token Refresh**: Handle automatic token refresh
4. **Logout**: Clear stored token and navigate to login

## Best Practices

### 1. State Management
- Store current workout session in app state
- Cache user profile data
- Implement proper loading states
- Handle offline scenarios

### 2. Performance
- Use pagination for large lists
- Implement pull-to-refresh
- Cache frequently accessed data
- Optimize image loading

### 3. User Experience
- Show progress indicators during API calls
- Provide clear error messages
- Implement optimistic updates where possible
- Add haptic feedback for important actions

### 4. Data Validation
- Validate input before API calls
- Handle edge cases (empty lists, null values)
- Implement proper form validation
- Check for required fields

## Testing Checklist

- [ ] Onboarding flow completion
- [ ] Template generation and selection
- [ ] Workout session start/end
- [ ] Set logging with various inputs
- [ ] Exercise search and filtering
- [ ] Exercise swapping functionality
- [ ] Progress data display
- [ ] Error handling scenarios
- [ ] Offline behavior
- [ ] Authentication flow

## Support

For technical issues or questions about the API:
1. Check this documentation first
2. Review the Postman collection for examples
3. Test endpoints using the provided curl commands
4. Contact the backend team with specific error messages

## Rate Limits

- **Standard endpoints**: 100 requests per minute
- **Search endpoints**: 60 requests per minute
- **Heavy computation** (template generation): 10 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when rate limit resets