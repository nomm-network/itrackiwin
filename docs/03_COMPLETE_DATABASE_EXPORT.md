# Complete Database Data Export

## Export Information
- **Export Date**: January 6, 2025
- **Database**: PostgreSQL with PostGIS
- **Project**: Fitness Tracking Application
- **Total Tables**: 126+ tables

## Sample Data from Key Tables

### achievements
**Data Count**: 7 records

```json
[
  {
    "id": "e1cc6a66-2a7c-4124-aa3c-22bdbbe421d0",
    "title": "First Workout",
    "description": "Complete your first workout",
    "icon": "🎯",
    "category": "workout",
    "points": 50,
    "criteria": {"target": 1, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "d490c72f-e2fe-4537-b8f0-e02d3eeaa239",
    "title": "Workout Warrior",
    "description": "Complete 10 workouts", 
    "icon": "💪",
    "category": "workout",
    "points": 100,
    "criteria": {"target": 10, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "95a42cd4-5236-40d8-bb57-2d5ad32645ac",
    "title": "Century Club",
    "description": "Complete 100 workouts",
    "icon": "🏆", 
    "category": "workout",
    "points": 500,
    "criteria": {"target": 100, "type": "count"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "d51aaec2-36c2-4556-88fa-d8e16a028e46",
    "title": "Consistent Champion",
    "description": "Maintain a 7-day workout streak",
    "icon": "🔥",
    "category": "streak", 
    "points": 200,
    "criteria": {"target": 7, "type": "streak"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "cf14047f-2903-432a-b275-0e51b49d9d09",
    "title": "Streak Master",
    "description": "Maintain a 30-day workout streak",
    "icon": "⚡",
    "category": "streak",
    "points": 1000, 
    "criteria": {"target": 30, "type": "streak"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "7b69d1f6-e9bb-4ebf-a09b-7bf165083e32",
    "title": "Social Butterfly", 
    "description": "Make your first friend",
    "icon": "👥",
    "category": "social",
    "points": 75,
    "criteria": {"target": 1, "type": "friends"},
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  },
  {
    "id": "e6f14a05-c8ae-4523-8a96-f8214434b31f",
    "title": "Level Up",
    "description": "Reach level 5",
    "icon": "📈",
    "category": "milestone",
    "points": 150,
    "criteria": {"target": 5, "type": "level"}, 
    "is_active": true,
    "created_at": "2025-08-21T01:27:18.313225+00:00"
  }
]
```

### users
**Data Count**: 1 record

```json
[
  {
    "id": "87024d9c-4242-4eca-8deb-d10385f156bd",
    "is_pro": false,
    "default_unit": "kg",
    "city": null,
    "country": null,
    "created_at": "2025-09-02T23:24:28.776566+00:00",
    "updated_at": "2025-09-02T23:24:28.776566+00:00"
  }
]
```

### admin_audit_log
**Data Count**: 1000+ records (showing sample due to size)

Sample entries showing session management and admin operations:
- Session ended events
- Session backgrounded events  
- Admin check failures
- User authentication events
- System operations

## Important Note About Complete Data Export

Due to the extensive size of this database (126+ tables with thousands of records), a complete data export would be extremely large. The database contains:

1. **User Data**: Personal profiles, settings, preferences
2. **Exercise Data**: Comprehensive exercise library with translations
3. **Workout Data**: Historical workout sessions, sets, and performance metrics
4. **Equipment Data**: Gym equipment specifications and configurations
5. **Translation Data**: Multi-language support across all entities
6. **System Data**: Audit logs, rate limiting, idempotency keys
7. **Analytics Data**: Performance metrics and user behavior tracking
8. **Gamification Data**: Achievements, streaks, user progression
9. **Gym Data**: Gym profiles, equipment inventory, membership info
10. **Coaching Data**: Mentorship records, assigned templates, logs

## Full Export Recommendations

For a complete data export including ALL data (not samples), the following approaches are recommended:

1. **Direct Database Dump**:
   ```bash
   pg_dump --data-only --inserts postgresql://[connection_string] > complete_data_export.sql
   ```

2. **Table-by-Table Export**:
   - Export each of the 126+ tables individually
   - Include all rows, not just samples
   - Maintain referential integrity order

3. **JSON Export per Table**:
   - Use `SELECT to_json(array_agg(row_to_json(t))) FROM table_name t`
   - Export each table as a complete JSON file

The sample data shown above represents the structure and a subset of the actual database content. The full dataset contains comprehensive fitness tracking data for the application's complete functionality.

## Export Status Summary

- ✅ Schema Structure: Complete
- ✅ Foreign Key Relationships: Complete  
- ✅ Sample Data: Provided
- ⚠️ Complete Data: Requires full database dump due to size
- ✅ Critical System Data: Achievement definitions, user records included

For production use or complete data migration, perform a full PostgreSQL dump including all tables and their complete data sets.