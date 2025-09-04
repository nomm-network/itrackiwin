# Sample Data Documentation

This document provides sample data from key tables to understand the data structure and relationships.

## Achievements Table
Sample achievements in the system:

| ID | Title | Category | Points | Criteria | Description |
|----|-------|----------|--------|----------|-------------|
| e1cc6a66-2a7c-4124-aa3c-22bdbbe421d0 | First Workout | workout | 50 | {"target":1,"type":"count"} | Complete your first workout |
| d490c72f-e2fe-4537-b8f0-e02d3eeaa239 | Workout Warrior | workout | 100 | {"target":10,"type":"count"} | Complete 10 workouts |
| 95a42cd4-5236-40d8-bb57-2d5ad32645ac | Century Club | workout | 500 | {"target":100,"type":"count"} | Complete 100 workouts |
| d51aaec2-36c2-4556-88fa-d8e16a028e46 | Consistent Champion | streak | 200 | {"target":7,"type":"streak"} | Maintain a 7-day workout streak |
| cf14047f-2903-432a-b275-0e51b49d9d09 | Streak Master | streak | 1000 | {"target":30,"type":"streak"} | Maintain a 30-day workout streak |

## Exercises Table
Sample exercises showing the complexity of the exercise system:

### Barbell Deadlift
```json
{
  "id": "7dc0ef00-cdf2-491c-a58b-4745620492d0",
  "display_name": "Barbell Deadlift",
  "slug": "barbell-deadlift",
  "equipment_id": "33a8bf6b-5832-442e-964d-3f32070ea029",
  "primary_muscle_id": "8bd4d1cf-c9c3-44d7-940a-20a24ca721ba",
  "secondary_muscle_group_ids": [
    "8a6067ac-7ca0-442b-b5ef-5f4cd9a7c947",
    "4c6de44b-f9c1-4b5d-ae27-d9ab941f3ba3",
    "993e0496-a986-4007-a299-4cf08ac8e1be",
    "f02ad962-748e-4c28-82f2-3fffe0e0f68e"
  ],
  "movement_pattern_id": "5f6e3748-14e6-4537-b76b-4081e7c995f1",
  "load_type": "dual_load",
  "is_bar_loaded": true,
  "default_bar_weight": 20,
  "complexity_score": 7,
  "exercise_skill_level": "high",
  "popularity_rank": 98,
  "tags": ["compound", "strength", "hinge"]
}
```

### Upper Chest Press (Machine)
```json
{
  "id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
  "display_name": "Upper Chest Press (Machine)",
  "slug": "upper-chest-press-machine",
  "equipment_id": "5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0",
  "primary_muscle_id": "1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e",
  "load_type": "dual_load",
  "is_bar_loaded": false,
  "complexity_score": 3,
  "exercise_skill_level": "low",
  "popularity_rank": 85,
  "tags": ["machine", "press", "chest"]
}
```

## Equipment Table
Sample equipment configurations:

| ID | Slug | Type | Load Type | Default Bar Weight | Load Medium |
|----|------|------|-----------|-------------------|-------------|
| 33a8bf6b-5832-442e-964d-3f32070ea029 | olympic-barbell | free_weight | dual_load | 20kg | bar |
| 0f22cd80-59f1-4e12-9cf2-cf725f3e4a02 | ez-curl-bar | free_weight | dual_load | 10kg | bar |
| 679e01ac-e6d6-4581-bb91-bffc082bc125 | fixed-barbell | free_weight | single_load | 10kg | bar |
| 1328932a-54fe-42fc-8846-6ead942c2b98 | dumbbell | free_weight | single_load | - | plates |
| 2674cc60-432e-4a3e-b06d-a73ab1914e11 | kettlebell | free_weight | single_load | - | other |

## Muscle Groups Table
Sample muscle group organization:

| ID | Slug | Body Part ID |
|----|------|-------------|
| d49325b3-9d8a-4833-9b8f-12bd1fc54a9f | shoulders | 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5 |
| edf20338-2d7e-4e77-be74-052e6fe45cd7 | biceps | 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5 |
| 77919287-d5dd-454f-8760-c9c9322c4533 | triceps | 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5 |
| 8a6067ac-7ca0-442b-b5ef-5f4cd9a7c947 | forearms | 0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5 |
| 0e5b1021-6c13-4a52-94b2-d8a3e1ba43a6 | back | 7828c330-5c72-46e3-b6b8-c897e4568ac1 |

## Workouts Table
Sample workout sessions:

### Active Workout
```json
{
  "id": "6c0a9a49-38ab-4aa4-925f-515b10930646",
  "user_id": "f3024241-c467-4d6a-8315-44928316cfa9",
  "template_id": "4c3df220-64d3-43c2-8345-00a087ec3af4",
  "started_at": "2025-09-04T11:40:18.756663+00:00",
  "ended_at": null,
  "readiness_score": 72,
  "session_unit": "kg"
}
```

### Completed Workouts
```json
[
  {
    "id": "396c96b9-6865-4252-b884-85bb02683614",
    "user_id": "f3024241-c467-4d6a-8315-44928316cfa9",
    "template_id": "4c3df220-64d3-43c2-8345-00a087ec3af4",
    "started_at": "2025-09-02T02:31:31.996969+00:00",
    "ended_at": "2025-09-02T02:46:38.769+00:00",
    "readiness_score": 69
  },
  {
    "id": "73a6f445-72d8-4817-bd06-e1ec8927c931",
    "user_id": "f3024241-c467-4d6a-8315-44928316cfa9",
    "template_id": "4c3df220-64d3-43c2-8345-00a087ec3af4",
    "started_at": "2025-09-02T12:02:47.477879+00:00",
    "ended_at": "2025-09-02T13:11:37.163+00:00",
    "readiness_score": 69
  }
]
```

## Data Patterns & Insights

### Exercise Complexity
- **Complexity Score Range**: 2-7 (where 7 = high complexity like Deadlifts)
- **Skill Levels**: low, medium, high
- **Popularity Ranking**: Used for exercise recommendations

### Load Types
- `dual_load`: Weight loaded on both sides (barbells, some machines)
- `single_load`: Single weight selection (dumbbells, kettlebells)
- `stack`: Weight stack machines

### Equipment Categories
- `free_weight`: Barbells, dumbbells, kettlebells
- `machine`: Weight stack machines, plate-loaded machines
- `cable`: Cable systems and attachments

### User Data Structure
- All user data properly isolated by `user_id`
- Workout sessions track readiness scores (0-100)
- Session units stored for weight display preferences

### Achievement System
- Point-based scoring system
- Category-based organization (workout, streak, etc.)
- JSON criteria for flexible achievement rules

### Exercise Categorization
- Primary muscle targeting
- Secondary muscle involvement
- Movement pattern classification
- Tag-based filtering system

This data structure supports a comprehensive fitness tracking system with proper user isolation, detailed exercise categorization, and flexible achievement/gamification systems.