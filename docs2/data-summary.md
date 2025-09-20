# Database Data Summary

## Record Counts by Table

| Table | Record Count | Description |
|-------|--------------|-------------|
| achievements | 7 | Achievement definitions for user gamification |
| body_parts | 5 | Main body part categories (arms, back, chest, core, legs) |
| grips | 4 | Hand position grip types (overhand, underhand, neutral, mixed) |
| users | 4 | User accounts |
| movement_patterns | 8 | Exercise movement patterns |
| muscle_groups | 15 | Muscle group classifications |
| muscles | 30+ | Individual muscle definitions |
| equipment | 40+ | Gym equipment definitions |
| exercises | 30+ | Exercise library |

## Key Data Highlights

### Achievements System
- 7 achievements covering workout milestones, streaks, social features, and leveling
- Points range from 50-1000 per achievement
- Categories: workout, streak, social, milestone

### Body Parts Structure
- 5 main body parts: arms, back, chest, core, legs
- Each body part has associated muscles and exercises

### Equipment System
- Comprehensive equipment catalog with load types, weights, and configurations
- Support for barbells, dumbbells, machines, bodyweight, cardio equipment
- Default weight and increment configurations

### Exercise Library
- 30+ exercises with full metadata
- Linked to body parts, muscles, equipment, and movement patterns
- Popularity rankings and skill levels
- Multi-language support through translations

### User System
- 4 active users in the system
- Support for pro users, roles, and authentication
- Comprehensive audit logging and rate limiting

### Internationalization
- Multiple translation tables for exercises, equipment, body parts
- Primary language: English (en)
- Extensible for additional languages

### Muscle System
- 15 muscle groups covering all major body areas
- 30+ individual muscles with detailed anatomical mapping
- Support for primary/secondary muscle relationships in exercises

## Data Quality
- All core tables properly seeded with realistic data
- Foreign key relationships maintained through application logic
- Comprehensive enum types for data consistency
- Proper indexing and constraints for performance

## Security
- Row Level Security (RLS) enabled on most tables
- Admin and user role separation
- Rate limiting on sensitive operations
- Audit logging for administrative actions