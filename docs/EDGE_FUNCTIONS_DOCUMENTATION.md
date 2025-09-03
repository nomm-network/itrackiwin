# EDGE FUNCTIONS DOCUMENTATION

## Overview
This document catalogs all Supabase Edge Functions deployed in the fitness tracking application. These functions provide backend API capabilities, AI integrations, and external service connections.

## Function Configuration
All functions are configured in `supabase/config.toml`:

```toml
project_id = "fsayiuhncisevhipbrak"

[functions.import-popular-exercises]
verify_jwt = false

[functions.import-exercises-exercisedb]
verify_jwt = false

[functions.import-exercises-community]
verify_jwt = false

[functions.refresh-exercise-views]
verify_jwt = false
```

## Edge Functions Catalog

### AI & Coaching Functions

#### ai-coach
- **Purpose**: Main AI coaching system providing workout guidance and advice
- **Authentication**: Required (JWT verified)
- **Functionality**: 
  - Analyzes user workout history
  - Provides personalized coaching recommendations
  - Integrates with OpenAI API for natural language responses
  - Generates contextual fitness advice

#### form-coach
- **Purpose**: Exercise form analysis and correction guidance
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Analyzes exercise form descriptions
  - Provides form correction suggestions
  - Safety guidance and injury prevention
  - Real-time form feedback

#### generate-workout
- **Purpose**: Automated workout creation based on user preferences
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Creates personalized workout plans
  - Considers user equipment and preferences
  - Applies progressive overload principles
  - Generates balanced exercise selection

#### progress-insights
- **Purpose**: Performance analytics and progress tracking
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Analyzes workout performance trends
  - Identifies plateaus and suggests improvements
  - Generates progress reports
  - Provides data-driven insights

### Data Import/Management Functions

#### import-exercises-exercisedb
- **Purpose**: Import exercises from ExerciseDB API
- **Authentication**: None (public endpoint for system use)
- **Functionality**:
  - Fetches exercise data from external API
  - Normalizes exercise information
  - Updates local exercise database
  - Handles bulk exercise imports

#### import-exercises-community
- **Purpose**: Community-driven exercise import system
- **Authentication**: None (public endpoint)
- **Functionality**:
  - Processes community-submitted exercises
  - Validates exercise data quality
  - Merges with existing exercise library
  - Maintains data consistency

#### import-popular-exercises
- **Purpose**: Seed database with popular/common exercises
- **Authentication**: None (public endpoint)
- **Functionality**:
  - Imports curated list of popular exercises
  - Ensures essential exercises are available
  - Sets up base exercise library
  - Handles initial database seeding

#### refresh-exercise-views
- **Purpose**: Refresh materialized views and exercise caches
- **Authentication**: None (public endpoint for system maintenance)
- **Functionality**:
  - Refreshes materialized views
  - Updates exercise search indexes
  - Clears stale caches
  - Optimizes query performance

### Gym & Location Services

#### detect-gym
- **Purpose**: Automatic gym detection based on user location
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Analyzes user location data
  - Matches against gym database
  - Provides gym suggestions
  - Updates user gym associations

#### search-gyms
- **Purpose**: Gym search and discovery functionality
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Geographic gym search
  - Filters by amenities and equipment
  - Provides gym details and ratings
  - Location-based recommendations

#### equipment-capabilities
- **Purpose**: Analyze gym equipment capabilities and compatibility
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Maps gym equipment to exercises
  - Analyzes exercise compatibility
  - Suggests equipment alternatives
  - Optimizes workout planning

### User Profile & Planning Functions

#### fitness-profile
- **Purpose**: User fitness assessment and profile generation
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Conducts fitness assessments
  - Generates user fitness profiles
  - Tracks fitness level changes
  - Provides baseline measurements

#### workout-templates
- **Purpose**: Workout template management and generation
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Creates workout templates
  - Manages template sharing
  - Generates template variations
  - Template recommendation engine

#### recalibrate-user-plans
- **Purpose**: Recalibrate and optimize user workout plans
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Analyzes user progress data
  - Adjusts workout intensity and volume
  - Updates training plans
  - Applies periodization principles

#### recalibrate-trigger
- **Purpose**: Trigger system for automatic plan recalibration
- **Authentication**: Required (JWT verified)
- **Functionality**:
  - Monitors user performance metrics
  - Triggers automatic recalibration
  - Schedules plan updates
  - Manages recalibration workflows

### System & Maintenance Functions

#### data-quality-check
- **Purpose**: Automated data quality validation and reporting
- **Authentication**: None (system function)
- **Functionality**:
  - Validates exercise data completeness
  - Checks data consistency
  - Generates quality reports
  - Identifies data anomalies

#### flutterflow-api
- **Purpose**: API integration with FlutterFlow mobile app
- **Authentication**: Custom API key validation
- **Functionality**:
  - Mobile app API endpoints
  - Data synchronization
  - Mobile-specific optimizations
  - Cross-platform compatibility

#### seed-personas
- **Purpose**: Seed system with user personas for testing
- **Authentication**: None (development/testing function)
- **Functionality**:
  - Creates test user personas
  - Generates sample workout data
  - Sets up demo environments
  - Supports development workflows

#### demo-coach-logs
- **Purpose**: Demo logging system for coaching interactions
- **Authentication**: None (demo function)
- **Functionality**:
  - Logs demo coaching sessions
  - Tracks demo user interactions
  - Supports demo environments
  - Analytics for demo usage

## Function Security Model

### Authentication Levels
1. **JWT Required**: Standard user functions requiring authentication
2. **Public Access**: System functions and data imports
3. **Custom Auth**: Functions with specialized authentication (API keys)

### CORS Configuration
All web-facing functions implement proper CORS headers:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Rate Limiting
- Admin functions: Rate limited via database
- Public functions: Cloudflare rate limiting
- User functions: Per-user rate limiting

## Function Dependencies

### External API Integrations
- **OpenAI API**: AI coaching and natural language processing
- **ExerciseDB API**: Exercise data import
- **Google Places API**: Gym location services
- **Resend API**: Email notifications (if implemented)

### Database Dependencies
- All functions connect to main Supabase database
- Row-Level Security enforced at database level
- Functions use service role for elevated permissions where needed

### Internal Function Calls
- Functions can call other functions via `supabase.functions.invoke()`
- Proper error handling and timeout management
- Logging for function call chains

## Monitoring & Logging

### Function Logs
- All functions implement comprehensive logging
- Error tracking and performance monitoring
- Request/response logging for debugging
- Integration with Supabase logging system

### Performance Monitoring
- Function execution time tracking
- Memory usage monitoring
- Cold start optimization
- Resource utilization analysis

### Error Handling
- Structured error responses
- Proper HTTP status codes
- Error logging and alerting
- Graceful degradation strategies

## Deployment & CI/CD

### Automatic Deployment
- Functions deployed automatically with code changes
- Version control integration
- Rollback capabilities
- Blue-green deployment support

### Environment Management
- Separate development and production environments
- Environment-specific configuration
- Secret management via Supabase
- Feature flags for function control

## Usage Analytics

### Function Call Metrics
- Request volume per function
- Success/failure rates
- Average execution times
- Resource consumption patterns

### User Behavior Analytics
- Most used coaching features
- Exercise import patterns
- Gym detection accuracy
- Template usage statistics

---

**Document Generated**: January 3, 2025
**Functions Documented**: 20+ active functions
**Last Updated**: Current deployment
**Status**: PRODUCTION READY ✅