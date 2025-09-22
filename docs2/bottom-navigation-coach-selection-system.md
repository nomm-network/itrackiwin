# Bottom Navigation & Coach Selection System Implementation

## Overview
This system implements a dynamic bottom navigation bar that allows users to pin their preferred life categories and select coaches for each category. The navigation displays fixed items (Atlas, Social, Planets) plus up to 3 user-customizable category slots.

## Database Tables Used

### Core Tables
- `user_category_prefs` - Stores user preferences for categories (pinning, coach selection, display order)
- `life_categories` - Master list of available life categories
- `coaches` - Available coaches with their details
- `coach_subscriptions` - User subscriptions to premium coaches

### Key Database Functions
- `coaches_for_category(u uuid, cat_slug text)` - RPC function that returns available coaches for a category with user access status

## File Structure and Implementation

### 1. Core Hook: `src/hooks/useBottomNav.ts`
**Purpose**: Fetches and constructs the bottom navigation items based on user preferences

**Key Features**:
- Queries `user_category_prefs` joined with `life_categories`
- Returns fixed navigation items: Atlas (slot 1), Social (slot 2), Planets (slot 5)
- Fills slots 3-4 with user's top 2 enabled categories
- Uses display_order for priority sorting
- Includes fallback category icons

**Query Structure**:
```sql
SELECT life_categories.slug, life_categories.name, life_categories.icon
FROM user_category_prefs 
INNER JOIN life_categories ON user_category_prefs.category_id = life_categories.id
WHERE user_id = ? AND is_enabled = true
ORDER BY display_order
LIMIT 2
```

**Interface**:
```typescript
interface NavItem {
  slot: number;
  item_type: 'fixed' | 'category';
  label: string;
  slug: string;
  icon: string;
}
```

### 2. User Category Settings Hook: `src/hooks/useUserCategorySettings.ts`
**Purpose**: Manages user category preferences (pinning, enabling, coach selection)

**Key Operations**:
- `toggleNavPin`: Updates nav_pinned and is_enabled status
- `updateCategorySetting`: Generic update function for category preferences
- Invalidates related React Query caches on updates

**Database Operations**:
```sql
-- Upsert user category preference
INSERT INTO user_category_prefs (user_id, category_id, nav_pinned, is_enabled, selected_coach_id)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (user_id, category_id) 
DO UPDATE SET nav_pinned = ?, is_enabled = ?, selected_coach_id = ?
```

### 3. Coach Selection Hook: `src/hooks/useCoachSelection.ts`
**Purpose**: Handles coach selection and availability for categories

**Key Functions**:
- `useCoachesForCategory(categorySlug)`: Fetches available coaches for a category
- `useSelectCoach()`: Updates user's selected coach for a category

**RPC Call**:
```sql
SELECT * FROM coaches_for_category(user_id, category_slug)
```

**Returns**:
```typescript
interface CoachForCategory {
  coach_id: string;
  display_name: string;
  type: 'ai' | 'human';
  is_default: boolean;
  selected: boolean;
  has_access: boolean;
  price_cents: number;
  avatar_url?: string;
}
```

### 4. Navigation Settings Component: `src/components/settings/NavigationSettingsWithCoaches.tsx`
**Purpose**: Complete UI for managing bottom navigation and coach selection

**Key Features**:
- Lists all available life categories
- Toggle switches for pinning categories (max 3)
- Coach selection dropdowns for pinned categories
- Visual indicators for coach types (AI/Human) and subscription status
- Subscription access checking and upsell prompts

**Component Structure**:
- Main `NavigationSettings` component handles overall state
- `CategoryRow` sub-component handles individual category management
- Integrates with Radix UI components (Switch, Select, Avatar, Badge)

**Business Rules**:
- Maximum 3 categories can be pinned
- Coach selection only available for pinned categories
- Premium coaches require subscription access
- Default coach fallback when no specific coach selected

### 5. Life Categories Hook: `src/hooks/useLifeCategoriesSimple.ts`
**Purpose**: Fetches all available life categories for settings UI

**Query**:
```sql
SELECT id, slug, name, icon, display_order 
FROM life_categories 
ORDER BY display_order
```

## Database Schema Requirements

### user_category_prefs Table
```sql
CREATE TABLE user_category_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category_id UUID NOT NULL REFERENCES life_categories(id),
  display_order INTEGER DEFAULT 0,
  selected_coach_id UUID REFERENCES coaches(id),
  is_enabled BOOLEAN DEFAULT true,
  nav_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id)
);
```

### Required RLS Policies
```sql
-- Users can manage their own category preferences
CREATE POLICY "Users can manage own category prefs" 
ON user_category_prefs FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

### coaches_for_category RPC Function
This function should return coaches available for a category, including:
- Coach basic info (id, name, type, avatar)
- User's current selection status
- Access permissions based on subscriptions
- Pricing information

## Integration Points

### Bottom Navigation Display
The navigation component should:
1. Call `useBottomNav()` to get nav items
2. Render fixed items (Atlas, Social, Planets) 
3. Render dynamic category slots (3-4) based on user preferences
4. Handle routing to category-specific pages

### Settings Integration
The settings page should:
1. Include `NavigationSettingsWithCoaches` component
2. Allow users to pin/unpin categories
3. Show coach selection for pinned categories
4. Handle subscription upsell for premium coaches

## Key Design Decisions

1. **Fixed Navigation Structure**: Atlas, Social always shown; Planets always in slot 5
2. **Limited Slots**: Only 2 dynamic category slots to prevent navigation overcrowding  
3. **Coach Selection Coupling**: Coach selection only available for pinned categories
4. **Subscription Integration**: Premium coaches require active subscriptions
5. **Fallback Handling**: Default coaches and icons when user hasn't made selections

## Error Handling

- Graceful fallback when `coaches_for_category` RPC fails
- Default category icons when none specified
- Subscription access checks with user-friendly error messages
- Loading states for all async operations

## Performance Considerations

- React Query caching with 5-minute stale time for bottom nav
- 30-second stale time for coach data
- Proper cache invalidation on user actions
- Indexed database queries for user preferences