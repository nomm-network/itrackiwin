# Body Metrics Tracking System Implementation

## Overview
This system implements comprehensive body metrics tracking for users, allowing them to record weight, height, and notes over time. It replaces the old single-value bodyweight tracking with a full historical tracking system.

## Database Schema

### user_body_metrics Table
```sql
CREATE TABLE IF NOT EXISTS public.user_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight_kg NUMERIC,
  height_cm NUMERIC,
  source TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Database Indexes
```sql
-- Primary lookup index for user data by timestamp
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_ts
  ON public.user_body_metrics (user_id, recorded_at DESC);

-- Optimized index for weight data queries
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_weight_ts
  ON public.user_body_metrics (user_id, recorded_at DESC)
  WHERE weight_kg IS NOT NULL;

-- Optimized index for height data queries  
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_height_ts
  ON public.user_body_metrics (user_id, recorded_at DESC)
  WHERE height_cm IS NOT NULL;
```

### Row Level Security Policies
```sql
ALTER TABLE public.user_body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their body metrics"
  ON public.user_body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their body metrics"
  ON public.user_body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their body metrics"
  ON public.user_body_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their body metrics"
  ON public.user_body_metrics FOR DELETE
  USING (auth.uid() = user_id);
```

## File Implementation

### 1. Main Component: `src/components/health/BodyMetricsForm.tsx`
**Purpose**: Complete UI for recording and viewing body metrics

**Key Features**:
- Form for recording new weight/height measurements
- Display of current/latest metrics
- Historical view of recent entries (last 10)
- Optional notes field for context
- Real-time form validation

**Component Structure**:
```typescript
interface BodyMetrics {
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
}

interface HistoricalMetric {
  id: string;
  recorded_at: string;
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
}
```

**Data Queries**:
```sql
-- Latest metrics query
SELECT * FROM user_body_metrics 
WHERE user_id = ? 
ORDER BY recorded_at DESC 
LIMIT 1;

-- Recent history query
SELECT * FROM user_body_metrics 
WHERE user_id = ? 
ORDER BY recorded_at DESC 
LIMIT 10;
```

**Insert Operation**:
```sql
INSERT INTO user_body_metrics (
  user_id, 
  weight_kg, 
  height_cm, 
  notes, 
  source, 
  recorded_at
) VALUES (?, ?, ?, ?, 'manual', now());
```

### 2. React Query Integration
**Query Keys**:
- `['latest-body-metrics']` - For current metrics display
- `['recent-body-metrics']` - For historical data

**Cache Invalidation**:
- Both queries invalidated on successful metric recording
- Ensures UI updates immediately after new entries

**Error Handling**:
- Toast notifications for success/failure
- Form validation before submission
- Graceful handling of missing authentication

### 3. Form Validation & UX
**Validation Rules**:
- At least one metric (weight or height) must be provided
- Numeric validation for weight/height fields
- Weight supports decimal places (0.1 kg precision)
- Height as integer (cm)

**User Experience**:
- Real-time form state updates
- Loading states during submission
- Success feedback with toast
- Form reset after successful submission
- Responsive grid layout for mobile/desktop

### 4. Data Migration Impact
**Removed from user_profile_fitness**:
```sql
ALTER TABLE public.user_profile_fitness 
DROP COLUMN IF EXISTS bodyweight,
DROP COLUMN IF EXISTS height_cm;
```

**Migration Strategy**:
- Old bodyweight/height data should be migrated to user_body_metrics
- Create initial records with recorded_at = created_at from profiles
- Set source = 'migration' for imported data

## Integration Points

### Health Dashboard Integration
The body metrics component should be included in:
- Health category dashboard as primary tracking widget
- User profile health section
- Health coach interfaces for progress monitoring

### Potential Extensions
1. **Weight Goals**: Goal setting and progress tracking
2. **BMI Calculation**: Automatic BMI calculation when both weight/height available
3. **Charts/Graphs**: Visual progress tracking over time
4. **Import/Export**: Integration with fitness apps, scales, etc.
5. **Reminders**: Periodic recording reminders

## Database Design Decisions

### Flexible Metrics Storage
- Separate columns for weight_kg and height_cm
- Both nullable to allow recording just one metric
- Consistent metric units (kg, cm) for global compatibility

### Historical Tracking
- `recorded_at` vs `created_at` separation
- Allows backfilling historical data
- Supports future batch imports from devices

### Source Tracking
- `source` field for data provenance
- Enables filtering by manual vs automated entries
- Supports future integrations (scales, apps, etc.)

### Performance Optimization
- Compound indexes for efficient user + timestamp queries
- Partial indexes for weight/height specific queries
- Proper foreign key relationships with cascade delete

## Error Handling & Edge Cases

### Form Validation
- Prevents submission with no data
- Handles empty/invalid numeric inputs
- Graceful handling of authentication failures

### Data Integrity
- User ID validation through auth.uid()
- Proper typing for numeric fields
- Optional fields handled correctly (notes)

### UI States
- Loading indicators during submission
- Error messaging for failed operations
- Empty state handling for new users
- Responsive design for various screen sizes

## Security Considerations

### Row Level Security
- Complete isolation of user data
- All operations restricted to authenticated user's own records
- No cross-user data access possible

### Input Validation
- Server-side numeric validation
- Reasonable bounds checking (weight/height ranges)
- SQL injection protection through parameterized queries

### Privacy
- No sharing of body metrics between users
- Optional notes field (no required personal information)
- User control over all data (full CRUD permissions)