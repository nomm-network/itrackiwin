# AI Coach System Documentation

## Overview
The AI Coach system provides intelligent workout guidance, exercise selection, and form coaching through multiple edge functions and a sophisticated prompt engineering approach.

## Coach Functions

### 1. AI Coach (`/supabase/functions/ai-coach/`)
**Purpose**: General fitness coaching and workout guidance

**Inputs**:
- `user_message`: User's question or request
- `fitness_profile`: User's fitness background and preferences
- `recent_workouts`: Last 5 workout sessions for context
- `available_equipment`: Equipment accessible to the user
- `goals`: User's fitness objectives

**Outputs**:
```json
{
  "response": "Coaching advice text",
  "suggestions": ["Exercise recommendations"],
  "adjustments": {
    "intensity": "increase|decrease|maintain",
    "volume": "increase|decrease|maintain",
    "focus": "strength|endurance|mobility"
  }
}
```

**Key Features**:
- Contextual advice based on workout history
- Equipment-aware exercise suggestions
- Progressive overload recommendations
- Injury prevention guidance

### 2. Form Coach (`/supabase/functions/form-coach/`)
**Purpose**: Exercise technique analysis and correction

**Inputs**:
- `exercise_id`: UUID of the exercise being performed
- `user_feedback`: Subjective feedback about the movement
- `video_analysis`: Optional video analysis data
- `pain_reports`: Any discomfort or pain during exercise

**Outputs**:
```json
{
  "form_analysis": "Detailed technique feedback",
  "corrections": ["Specific form improvements"],
  "safety_alerts": ["Warning if technique is unsafe"],
  "alternative_exercises": ["Exercise UUIDs for safer alternatives"]
}
```

### 3. Progress Insights (`/supabase/functions/progress-insights/`)
**Purpose**: Performance analysis and progress tracking

**Inputs**:
- `user_id`: User UUID
- `time_period`: Analysis timeframe (e.g., "30_days")
- `exercise_filters`: Optional exercise type filters
- `metrics`: Specific metrics to analyze

**Outputs**:
```json
{
  "progress_summary": "Overall progress assessment",
  "strength_gains": {
    "percentage": 15.5,
    "exercises": ["Exercise names with biggest gains"]
  },
  "volume_trends": "Weekly volume progression",
  "recommendations": ["Next steps for continued progress"]
}
```

## Coaching Algorithms

### Progressive Overload Formula
```typescript
const calculateProgression = (lastWeight: number, lastReps: number, targetReps: number) => {
  // Linear progression for beginners
  if (experienceLevel === 'beginner') {
    return lastWeight + 2.5; // Add 2.5kg each session
  }
  
  // Percentage-based progression for intermediate/advanced
  const intensityFactor = targetReps <= 5 ? 0.025 : 0.0125;
  return Math.round(lastWeight * (1 + intensityFactor) * 2) / 2;
};
```

### RPE-Based Intensity
```typescript
const calculateIntensity = (rpe: number, targetReps: number) => {
  // RPE to percentage mapping
  const rpeToPercent = {
    6: 0.65, 7: 0.70, 8: 0.75, 9: 0.85, 10: 0.95
  };
  
  // Adjust for rep range
  const repAdjustment = targetReps > 8 ? -0.05 : targetReps < 5 ? 0.05 : 0;
  return (rpeToPercent[rpe] || 0.75) + repAdjustment;
};
```

### Fatigue Management
```typescript
const assessRecovery = (readinessScore: number, lastWorkoutIntensity: number) => {
  if (readinessScore < 6 || lastWorkoutIntensity > 8.5) {
    return {
      recommendation: 'deload',
      intensityReduction: 0.15,
      volumeReduction: 0.20
    };
  }
  return { recommendation: 'proceed', adjustments: null };
};
```

## Prompt Engineering

### System Prompts
Each coach function uses specialized system prompts:

**AI Coach System Prompt**:
```
You are an expert fitness coach with 15+ years of experience. You provide personalized, 
evidence-based advice while prioritizing safety. Always consider:
- User's experience level and limitations
- Available equipment and time constraints  
- Progressive overload principles
- Injury prevention and recovery
- Individual goals and preferences
```

**Form Coach System Prompt**:
```
You are a movement specialist focused on exercise technique and safety. Analyze form 
with extreme attention to:
- Joint alignment and movement patterns
- Common form errors and corrections
- Safety red flags requiring immediate attention
- Progressive cues for skill development
- Alternative exercises for limitations
```

### Context Management
- **Conversation History**: Last 5 exchanges maintained
- **Workout Context**: Current session progress included
- **Profile Integration**: User preferences and limitations
- **Equipment Awareness**: Available gym equipment considered

## Integration Points

### Database Triggers
- **Coach Logging**: All interactions logged to `coach_logs` table
- **Performance Tracking**: Recommendations tracked for effectiveness
- **Error Handling**: Failed requests logged for analysis

### Real-time Features
- **Live Form Feedback**: Integration with camera/sensor data
- **Session Adaptation**: Real-time workout adjustments
- **Progress Notifications**: Achievement and milestone alerts

## Performance Considerations

### Response Time Targets
- **AI Coach**: < 3 seconds for general advice
- **Form Coach**: < 2 seconds for technique feedback  
- **Progress Insights**: < 5 seconds for complex analysis

### Rate Limiting
- **General Users**: 50 requests/hour
- **Premium Users**: 200 requests/hour
- **Burst Allowance**: 10 requests/minute

### Caching Strategy
- **Exercise Data**: 24-hour cache for exercise information
- **User Profiles**: 1-hour cache for fitness profiles
- **Workout History**: 30-minute cache for recent sessions

## Error Handling

### Common Error Patterns
1. **Insufficient Context**: Request missing required user data
2. **Rate Limiting**: User exceeding request limits
3. **Model Timeout**: AI service unavailable
4. **Invalid Input**: Malformed request data

### Fallback Strategies
- **Static Recommendations**: Pre-defined advice for common scenarios
- **Historical Suggestions**: Previous successful recommendations
- **Safety-First Defaults**: Conservative guidance when uncertain

## Monitoring & Analytics

### Key Metrics
- **Response Accuracy**: User satisfaction ratings
- **Adoption Rates**: Feature usage statistics
- **Performance Impact**: Workout outcome correlation
- **Error Rates**: Failed request percentage

### Logging
All coach interactions include:
```json
{
  "user_id": "UUID",
  "function_name": "ai-coach|form-coach|progress-insights",
  "inputs": "Sanitized input data",
  "outputs": "Response summary",
  "execution_time_ms": 1250,
  "success": true,
  "metadata": {
    "model_version": "gpt-4",
    "tokens_used": 450
  }
}
```

## Security & Privacy

### Data Protection
- **Input Sanitization**: All user inputs validated and cleaned
- **Output Filtering**: Responses checked for inappropriate content
- **Personal Data**: No PII stored in coach logs
- **Encryption**: All data encrypted in transit and at rest

### Access Control
- **Authentication**: Valid Supabase JWT required
- **Rate Limiting**: Per-user request throttling
- **Audit Logging**: All coach interactions logged
- **Data Retention**: Coach logs purged after 90 days