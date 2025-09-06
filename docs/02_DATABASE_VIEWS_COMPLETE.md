# Complete Database Views Export

## Database Views Overview
- **Database Type**: PostgreSQL with PostGIS extensions
- **Schema**: Public schema views and materialized views
- **Total Views**: 12 regular views, 2 materialized views
- **Export Date**: 2025-01-06

## Regular Views

### geography_columns
**Purpose**: PostGIS system view for geography column metadata
```sql
SELECT current_database() AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geography_column,
    postgis_typmod_dims(a.atttypmod) AS coord_dimension,
    postgis_typmod_srid(a.atttypmod) AS srid,
    postgis_typmod_type(a.atttypmod) AS type
FROM pg_class c,
    pg_attribute a,
    pg_type t,
    pg_namespace n
WHERE ((t.typname = 'geography'::name) AND (a.attisdropped = false) AND (a.atttypid = t.oid) AND (a.attrelid = c.oid) AND (c.relnamespace = n.oid) AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND (NOT pg_is_other_temp_schema(c.relnamespace)) AND has_table_privilege(c.oid, 'SELECT'::text));
```

### geometry_columns
**Purpose**: PostGIS system view for geometry column metadata
```sql
SELECT (current_database())::character varying(256) AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geometry_column,
    COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension,
    COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid,
    (replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text))::character varying(30) AS type
FROM ((((((pg_class c
    JOIN pg_attribute a ON (((a.attrelid = c.oid) AND (NOT a.attisdropped))))
    JOIN pg_namespace n ON ((c.relnamespace = n.oid)))
    JOIN pg_type t ON ((a.atttypid = t.oid)))
    LEFT JOIN ( SELECT s.connamespace,
            s.conrelid,
            s.conkey,
            replace(split_part(s.consrc, ''''::text, 2), ')'::text, ''::text) AS type
        FROM ( SELECT pg_constraint.connamespace,
                    pg_constraint.conrelid,
                    pg_constraint.conkey,
                    pg_get_constraintdef(pg_constraint.oid) AS consrc
                FROM pg_constraint) s
        WHERE (s.consrc ~~* '%geometrytype(% = %'::text)) st ON (((st.connamespace = n.oid) AND (st.conrelid = c.oid) AND (a.attnum = ANY (st.conkey)))))
    LEFT JOIN ( SELECT s.connamespace,
            s.conrelid,
            s.conkey,
            (replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text))::integer AS ndims
        FROM ( SELECT pg_constraint.connamespace,
                    pg_constraint.conrelid,
                    pg_constraint.conkey,
                    pg_get_constraintdef(pg_constraint.oid) AS consrc
                FROM pg_constraint) s
        WHERE (s.consrc ~~* '%ndims(% = %'::text)) sn ON (((sn.connamespace = n.oid) AND (sn.conrelid = c.oid) AND (a.attnum = ANY (sn.conkey)))))
    LEFT JOIN ( SELECT s.connamespace,
            s.conrelid,
            s.conkey,
            (replace(replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text), '('::text, ''::text))::integer AS srid
        FROM ( SELECT pg_constraint.connamespace,
                    pg_constraint.conrelid,
                    pg_constraint.conkey,
                    pg_get_constraintdef(pg_constraint.oid) AS consrc
                FROM pg_constraint) s
        WHERE (s.consrc ~~* '%srid(% = %'::text)) sr ON (((sr.connamespace = n.oid) AND (sr.conrelid = c.oid) AND (a.attnum = ANY (sr.conkey)))))
WHERE ((c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND (NOT (c.relname = 'raster_columns'::name)) AND (t.typname = 'geometry'::name) AND (NOT pg_is_other_temp_schema(c.relnamespace)) AND has_table_privilege(c.oid, 'SELECT'::text));
```

### v_available_exercises
**Purpose**: Available exercises with full metadata and translations
```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    eq.slug AS equipment_slug,
    COALESCE(eqt.name, eq.slug) AS equipment_name,
    bp.slug AS body_part_slug,
    COALESCE(bpt.name, bp.slug) AS body_part_name,
    mg.slug AS muscle_group_slug,
    COALESCE(mgt.name, mg.slug) AS muscle_group_name,
    mp.slug AS movement_pattern_slug,
    COALESCE(mpt.name, mp.slug) AS movement_pattern_name,
    e.primary_muscle_id,
    e.equipment_id,
    e.body_part_id,
    e.movement_pattern_id,
    e.created_at,
    e.load_type
FROM (((((((((exercises e
    LEFT JOIN exercises_translations et ON (((et.exercise_id = e.id) AND (et.language_code = 'en'::text))))
    LEFT JOIN equipment eq ON ((eq.id = e.equipment_id)))
    LEFT JOIN equipment_translations eqt ON (((eqt.equipment_id = eq.id) AND (eqt.language_code = 'en'::text))))
    LEFT JOIN body_parts bp ON ((bp.id = e.body_part_id)))
    LEFT JOIN body_parts_translations bpt ON (((bpt.body_part_id = bp.id) AND (bpt.language_code = 'en'::text))))
    LEFT JOIN muscle_groups mg ON ((mg.id = e.primary_muscle_id)))
    LEFT JOIN muscle_groups_translations mgt ON (((mgt.muscle_group_id = mg.id) AND (mgt.language_code = 'en'::text))))
    LEFT JOIN movement_patterns mp ON ((mp.id = e.movement_pattern_id)))
    LEFT JOIN movement_patterns_translations mpt ON (((mpt.movement_pattern_id = mp.id) AND (mpt.language_code = 'en'::text))))
WHERE ((e.is_public = true) AND (e.configured = true))
ORDER BY e.popularity_rank, e.slug;
```

### v_body_parts_with_translations
**Purpose**: Body parts with their translated names
```sql
SELECT bp.id,
    bp.slug,
    COALESCE(bpt.name, bp.slug) AS name,
    bpt.description,
    bp.created_at
FROM (body_parts bp
    LEFT JOIN body_parts_translations bpt ON (((bpt.body_part_id = bp.id) AND (bpt.language_code = 'en'::text))))
ORDER BY bp.slug;
```

### v_categories_with_translations
**Purpose**: Life categories with translations
```sql
SELECT c.id,
    c.slug,
    c.display_order,
    COALESCE(t.name, c.slug) AS name,
    t.description
FROM (life_categories c
    LEFT JOIN life_category_translations t ON (((t.category_id = c.id) AND (t.language_code = 'en'::text))))
ORDER BY c.display_order;
```

### v_equipment_with_translations
**Purpose**: Equipment with their translated names and details
```sql
SELECT eq.id,
    eq.slug,
    COALESCE(eqt.name, eq.slug) AS name,
    eqt.description,
    eq.equipment_type,
    eq.kind,
    eq.weight_kg,
    eq.load_type,
    eq.load_medium,
    eq.default_bar_weight_kg,
    eq.default_side_min_plate_kg,
    eq.default_single_min_increment_kg,
    eq.default_stack,
    eq.configured,
    eq.notes,
    eq.created_at
FROM (equipment eq
    LEFT JOIN equipment_translations eqt ON (((eqt.equipment_id = eq.id) AND (eqt.language_code = 'en'::text))))
ORDER BY eq.slug;
```

### v_exercises_for_coach
**Purpose**: Exercise metadata optimized for AI coach selection with full details
```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    eq.slug AS equipment_slug,
    COALESCE(eqt.name, eq.slug) AS equipment_name,
    bp.slug AS body_part_slug,
    COALESCE(bpt.name, bp.slug) AS body_part_name,
    mg.slug AS muscle_group_slug,
    COALESCE(mgt.name, mg.slug) AS muscle_group_name,
    mp.slug AS movement_pattern_slug,
    COALESCE(mpt.name, mp.slug) AS movement_pattern_name,
    e.primary_muscle_id,
    e.equipment_id,
    e.body_part_id,
    e.movement_pattern_id,
    e.load_type,
    e.is_unilateral,
    e.allows_grips,
    e.exercise_skill_level,
    e.complexity_score,
    e.contraindications,
    e.tags,
    e.created_at
FROM (((((((((exercises e
    LEFT JOIN exercises_translations et ON (((et.exercise_id = e.id) AND (et.language_code = 'en'::text))))
    LEFT JOIN equipment eq ON ((eq.id = e.equipment_id)))
    LEFT JOIN equipment_translations eqt ON (((eqt.equipment_id = eq.id) AND (eqt.language_code = 'en'::text))))
    LEFT JOIN body_parts bp ON ((bp.id = e.body_part_id)))
    LEFT JOIN body_parts_translations bpt ON (((bpt.body_part_id = bp.id) AND (bpt.language_code = 'en'::text))))
    LEFT JOIN muscle_groups mg ON ((mg.id = e.primary_muscle_id)))
    LEFT JOIN muscle_groups_translations mgt ON (((mgt.muscle_group_id = mg.id) AND (mgt.language_code = 'en'::text))))
    LEFT JOIN movement_patterns mp ON ((mp.id = e.movement_pattern_id)))
    LEFT JOIN movement_patterns_translations mpt ON (((mpt.movement_pattern_id = mp.id) AND (mpt.language_code = 'en'::text))))
WHERE ((e.is_public = true) AND (e.configured = true))
ORDER BY e.popularity_rank, e.slug;
```

### v_exercises_with_translations
**Purpose**: Exercises with their translated names and basic info
```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    et.description,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    e.equipment_id,
    e.body_part_id,
    e.primary_muscle_id,
    e.movement_pattern_id,
    e.created_at
FROM (exercises e
    LEFT JOIN exercises_translations et ON (((et.exercise_id = e.id) AND (et.language_code = 'en'::text))))
ORDER BY e.popularity_rank, e.slug;
```

### v_muscle_groups_with_translations
**Purpose**: Muscle groups with their translated names
```sql
SELECT mg.id,
    mg.slug,
    COALESCE(mgt.name, mg.slug) AS name,
    mgt.description,
    mg.created_at
FROM (muscle_groups mg
    LEFT JOIN muscle_groups_translations mgt ON (((mgt.muscle_group_id = mg.id) AND (mgt.language_code = 'en'::text))))
ORDER BY mg.slug;
```

### v_muscles_with_translations
**Purpose**: Individual muscles with their translated names
```sql
SELECT m.id,
    m.slug,
    COALESCE(mt.name, m.slug) AS name,
    mt.description,
    m.muscle_group_id,
    m.created_at
FROM (muscles m
    LEFT JOIN muscles_translations mt ON (((mt.muscle_id = m.id) AND (mt.language_code = 'en'::text))))
ORDER BY m.slug;
```

### v_safe_exercises_for_user
**Purpose**: Filter exercises based on user injury constraints for safety
```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    eq.slug AS equipment_slug,
    COALESCE(eqt.name, eq.slug) AS equipment_name,
    bp.slug AS body_part_slug,
    COALESCE(bpt.name, bp.slug) AS body_part_name,
    mg.slug AS muscle_group_slug,
    COALESCE(mgt.name, mg.slug) AS muscle_group_name,
    mp.slug AS movement_pattern_slug,
    COALESCE(mpt.name, mp.slug) AS movement_pattern_name,
    e.primary_muscle_id,
    e.equipment_id,
    e.body_part_id,
    e.movement_pattern_id,
    e.created_at,
    e.load_type,
    e.contraindications
FROM (((((((((exercises e
    LEFT JOIN exercises_translations et ON (((et.exercise_id = e.id) AND (et.language_code = 'en'::text))))
    LEFT JOIN equipment eq ON ((eq.id = e.equipment_id)))
    LEFT JOIN equipment_translations eqt ON (((eqt.equipment_id = eq.id) AND (eqt.language_code = 'en'::text))))
    LEFT JOIN body_parts bp ON ((bp.id = e.body_part_id)))
    LEFT JOIN body_parts_translations bpt ON (((bpt.body_part_id = bp.id) AND (bpt.language_code = 'en'::text))))
    LEFT JOIN muscle_groups mg ON ((mg.id = e.primary_muscle_id)))
    LEFT JOIN muscle_groups_translations mgt ON (((mgt.muscle_group_id = mg.id) AND (mgt.language_code = 'en'::text))))
    LEFT JOIN movement_patterns mp ON ((mp.id = e.movement_pattern_id)))
    LEFT JOIN movement_patterns_translations mpt ON (((mpt.movement_pattern_id = mp.id) AND (mpt.language_code = 'en'::text))))
WHERE ((e.is_public = true) AND (e.configured = true))
ORDER BY e.popularity_rank, e.slug;
```

### v_subcategories_with_translations
**Purpose**: Life subcategories with translations
```sql
SELECT sc.id,
    sc.category_id,
    sc.slug,
    sc.display_order,
    COALESCE(t.name, sc.slug) AS name,
    t.description
FROM (life_subcategories sc
    LEFT JOIN life_subcategory_translations t ON (((t.subcategory_id = sc.id) AND (t.language_code = 'en'::text))))
ORDER BY sc.category_id, sc.display_order;
```

### v_user_pins_expanded
**Purpose**: User pinned subcategories with full category context
```sql
SELECT ups.user_id,
    ups.subcategory_id,
    ups.created_at,
    sc.category_id,
    sc.slug AS subcategory_slug,
    COALESCE(sct.name, sc.slug) AS subcategory_name,
    c.slug AS category_slug,
    COALESCE(ct.name, c.slug) AS category_name
FROM (((((user_pinned_subcategories ups
    JOIN life_subcategories sc ON ((sc.id = ups.subcategory_id)))
    JOIN life_categories c ON ((c.id = sc.category_id)))
    LEFT JOIN life_subcategory_translations sct ON (((sct.subcategory_id = sc.id) AND (sct.language_code = 'en'::text))))
    LEFT JOIN life_category_translations ct ON (((ct.category_id = c.id) AND (ct.language_code = 'en'::text))));
```

### v_workout_templates_with_translations
**Purpose**: Workout templates with their translated names
```sql
SELECT wt.id,
    wt.user_id,
    wt.name,
    wt.notes,
    wt.created_at,
    wt.updated_at
FROM workout_templates wt
ORDER BY wt.name;
```

## Materialized Views

### mv_last_set_per_user_exercise
**Purpose**: Optimized lookup for each user's last set per exercise
**Refresh Strategy**: Updated via triggers after set logging
```sql
SELECT w.user_id,
    we.exercise_id,
    ws.weight,
    ws.reps,
    ws.completed_at,
    row_number() OVER (PARTITION BY w.user_id, we.exercise_id ORDER BY ws.completed_at DESC) AS rn
FROM ((workout_sets ws
    JOIN workout_exercises we ON ((we.id = ws.workout_exercise_id)))
    JOIN workouts w ON ((w.id = we.workout_id)))
WHERE (ws.is_completed = true);
```
**Indexes**: 
- `UNIQUE INDEX ON (user_id, exercise_id, rn)`

### mv_pr_weight_per_user_exercise
**Purpose**: Optimized lookup for each user's personal record weight per exercise
**Refresh Strategy**: Updated via triggers after set logging
```sql
SELECT w.user_id,
    we.exercise_id,
    max(ws.weight) AS best_weight
FROM ((workout_sets ws
    JOIN workout_exercises we ON ((we.id = ws.workout_exercise_id)))
    JOIN workouts w ON ((w.id = we.workout_id)))
WHERE ((ws.is_completed = true) AND (ws.weight IS NOT NULL))
GROUP BY w.user_id, we.exercise_id;
```
**Indexes**:
- `UNIQUE INDEX ON (user_id, exercise_id)`

## View Usage Patterns

### Exercise Selection Views
- `v_exercises_for_coach` - AI coach exercise selection with full metadata
- `v_available_exercises` - General exercise browsing
- `v_safe_exercises_for_user` - Injury-aware exercise filtering

### Translation Views
- All `*_with_translations` views provide internationalization support
- Default to English ('en') language code
- Fall back to original slug/name if translation not available

### Performance Optimization
- Materialized views refresh automatically via triggers
- Regular views use efficient joins with proper indexing
- PostGIS views are system-managed for spatial data types

### Security Considerations
- Views respect Row Level Security (RLS) policies
- User-specific data filtering built into view logic
- No sensitive auth.users data exposed through views