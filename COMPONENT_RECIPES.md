# FlutterFlow Component Recipes

## Overview

This document provides detailed FlutterFlow component recipes for integrating with the iTrack.iWin fitness API. Each recipe includes UI setup, API integration, state management, and error handling.

## Table of Contents

1. [Onboarding Components](#onboarding-components)
2. [Workout Session Components](#workout-session-components)
3. [Template Management Components](#template-management-components)
4. [Exercise Browser Components](#exercise-browser-components)
5. [Progress Tracking Components](#progress-tracking-components)

---

## Onboarding Components

### 1. Experience Level Selector

**Component Type**: Custom Widget
**API Endpoint**: `GET /onboarding/experience-levels`

#### FlutterFlow Setup:

1. **Create Custom Widget**: `ExperienceLevelSelector`
2. **Add State Variables**:
   - `experienceLevels` (List<dynamic>)
   - `selectedLevel` (String)
   - `isLoading` (bool)

3. **UI Structure**:
```
Column
├── Text ("Choose Your Experience Level")
├── isLoading ? CircularProgressIndicator : ListView.builder
    └── ExperienceLevelCard (Custom Widget)
        ├── Container (with selection styling)
        ├── Text (level.name)
        ├── Text (level.description)
        └── GestureDetector (onTap: selectLevel)
```

4. **API Integration**:
   - **On Init**: Call API to load experience levels
   - **Action Chain**: API Call → Update State → Rebuild UI

5. **ExperienceLevelCard Styling**:
```dart
Container(
  decoration: BoxDecoration(
    color: isSelected ? Theme.primaryColor : Colors.grey[100],
    borderRadius: BorderRadius.circular(12),
    border: Border.all(
      color: isSelected ? Theme.primaryColor : Colors.grey[300],
      width: 2
    )
  ),
  child: ListTile(...)
)
```

#### Actions:

1. **Load Experience Levels Action**:
   - Type: API Call
   - Method: GET
   - URL: `${baseUrl}/onboarding/experience-levels`
   - On Success: Update `experienceLevels` state
   - On Error: Show error message

2. **Select Level Action**:
   - Update `selectedLevel` state
   - Enable "Continue" button
   - Optional: Haptic feedback

### 2. Fitness Profile Form

**Component Type**: Custom Widget
**API Endpoint**: `POST /onboarding/fitness-profile`

#### FlutterFlow Setup:

1. **Form Fields**:
   - Sex: Radio buttons
   - Age: Number input with validation
   - Height: Slider (150-220 cm)
   - Weight: Slider (40-150 kg)
   - Activity Level: Dropdown
   - Primary Goal: Chip selection
   - Available Days: Number input (1-7)
   - Session Duration: Slider (30-180 min)

2. **State Variables**:
   - `formData` (Map<String, dynamic>)
   - `isSubmitting` (bool)
   - `formErrors` (Map<String, String>)

3. **Validation Rules**:
```dart
Map<String, String> validateForm() {
  Map<String, String> errors = {};
  
  if (formData['age'] < 13 || formData['age'] > 100) {
    errors['age'] = 'Age must be between 13 and 100';
  }
  
  if (formData['availableDaysPerWeek'] < 1) {
    errors['days'] = 'At least 1 day per week required';
  }
  
  return errors;
}
```

#### Actions:

1. **Submit Profile Action**:
   - Validate form data
   - Show loading state
   - Call API
   - Handle success/error
   - Navigate to next step

### 3. Muscle Priority Matrix

**Component Type**: Custom Widget
**API Endpoint**: `POST /onboarding/muscle-priorities`

#### FlutterFlow Setup:

1. **UI Structure**:
```
GridView.builder
└── MuscleGroupCard
    ├── Image (muscle group icon)
    ├── Text (muscle group name)
    ├── PriorityIndicator (dots or stars)
    └── GestureDetector (cycle priority)
```

2. **Priority Levels**:
   - None: Gray
   - Low: Yellow (1 star)
   - Medium: Orange (2 stars)
   - High: Red (3 stars)

3. **State Management**:
```dart
Map<String, String> musclePriorities = {
  'chest': 'none',
  'back': 'high',
  'legs': 'medium',
  // ... etc
};
```

#### Actions:

1. **Cycle Priority Action**:
   - Get current priority for muscle group
   - Cycle to next level (none → low → medium → high → none)
   - Update visual indicator
   - Enable submit when priorities set

---

## Workout Session Components

### 1. Session Controller

**Component Type**: Custom Widget
**API Endpoints**: 
- `POST /session/start`
- `GET /session/current`
- `POST /session/end`

#### FlutterFlow Setup:

1. **State Variables**:
   - `currentSession` (Map<String, dynamic>)
   - `isSessionActive` (bool)
   - `sessionTimer` (String)
   - `currentExerciseIndex` (int)

2. **Session Timer**:
```dart
Timer.periodic(Duration(seconds: 1), (timer) {
  if (currentSession != null) {
    updateSessionTimer();
  }
});
```

3. **UI Components**:
   - Session header with title and timer
   - Exercise navigation (PageView)
   - Progress indicator
   - End session button

#### Actions:

1. **Start Session Action**:
   - Call start session API
   - Initialize session state
   - Start timer
   - Navigate to exercise view

2. **Load Current Session Action**:
   - Check for active session on app start
   - Resume if session exists
   - Handle session recovery

### 2. Exercise Set Logger

**Component Type**: Custom Widget
**API Endpoint**: `POST /session/log-set`

#### FlutterFlow Setup:

1. **Form Fields**:
   - Weight: Number input with +/- buttons
   - Reps: Number input with +/- buttons
   - RPE: Slider (1-10) or number input
   - Notes: Text input (optional)

2. **Quick Entry Buttons**:
   - Previous set values
   - Common weight increments
   - Rest timer integration

3. **Validation**:
```dart
bool validateSet() {
  return weight > 0 && reps > 0 && reps <= 50;
}
```

#### UI Structure:
```
Card
├── ExerciseHeader
├── PreviousSetsDisplay
├── SetInputForm
│   ├── WeightInput (with +/- buttons)
│   ├── RepsInput (with +/- buttons)
│   ├── RPESlider
│   └── NotesField
├── QuickValueButtons
└── SubmitButton
```

#### Actions:

1. **Log Set Action**:
   - Validate input
   - Show loading indicator
   - Call API
   - Update UI with new set
   - Show success feedback
   - Auto-start rest timer

2. **Quick Value Actions**:
   - Fill form with previous set values
   - Add/subtract weight increments
   - Clear form

### 3. Rest Timer

**Component Type**: Custom Widget

#### FlutterFlow Setup:

1. **State Variables**:
   - `restSeconds` (int)
   - `isResting` (bool)
   - `timerDuration` (int)

2. **Timer Logic**:
```dart
Timer.periodic(Duration(seconds: 1), (timer) {
  if (restSeconds > 0) {
    setState(() => restSeconds--);
  } else {
    timer.cancel();
    notifyRestComplete();
  }
});
```

3. **UI Components**:
   - Circular progress indicator
   - Time display (MM:SS)
   - Add/subtract 15s buttons
   - Skip rest button

#### Actions:

1. **Start Rest Timer**:
   - Set duration based on set type/effort
   - Start countdown
   - Show notification when complete
   - Optional: Vibration/sound

---

## Template Management Components

### 1. Template List

**Component Type**: ListView
**API Endpoint**: `GET /templates`

#### FlutterFlow Setup:

1. **List Item Structure**:
```
Card
├── Row
│   ├── Column
│   │   ├── Text (template name)
│   │   ├── Text (description)
│   │   └── Text ("${exerciseCount} exercises")
│   └── IconButton (start workout)
```

2. **Pull-to-Refresh**:
   - RefreshIndicator wrapper
   - Reload templates on pull

3. **Pagination**:
   - Load more on scroll to bottom
   - Show loading indicator

#### Actions:

1. **Load Templates Action**:
   - Call API with pagination
   - Append to existing list
   - Handle empty state

2. **Start Workout Action**:
   - Navigate to session start
   - Pass template ID
   - Show readiness check

### 2. Template Generator

**Component Type**: Custom Widget
**API Endpoint**: `POST /templates/generate`

#### FlutterFlow Setup:

1. **Configuration Form**:
   - Target sessions per week
   - Session duration
   - Available equipment (multi-select)
   - Focus areas (chips)

2. **Equipment Selector**:
```dart
Wrap(
  children: equipmentList.map((equipment) => 
    FilterChip(
      label: Text(equipment.name),
      selected: selectedEquipment.contains(equipment.id),
      onSelected: (selected) => toggleEquipment(equipment.id)
    )
  ).toList()
)
```

#### Actions:

1. **Generate Template Action**:
   - Validate configuration
   - Show generation progress
   - Call API
   - Navigate to generated template
   - Option to customize before saving

---

## Exercise Browser Components

### 1. Exercise Search

**Component Type**: Custom Widget
**API Endpoint**: `GET /exercises/search`

#### FlutterFlow Setup:

1. **Search Interface**:
   - Search bar with real-time filtering
   - Filter chips (muscle group, equipment)
   - Sort options

2. **Search State**:
```dart
class SearchState {
  String query = '';
  String muscleGroup = '';
  String equipment = '';
  List exercises = [];
  bool isLoading = false;
}
```

3. **Debounced Search**:
```dart
Timer? _debounce;

void onSearchChanged(String query) {
  _debounce?.cancel();
  _debounce = Timer(Duration(milliseconds: 500), () {
    performSearch(query);
  });
}
```

#### Actions:

1. **Search Action**:
   - Debounce input
   - Call search API
   - Update results list
   - Handle empty results

### 2. Exercise Alternatives

**Component Type**: Dialog/BottomSheet
**API Endpoint**: `POST /exercises/alternatives`

#### FlutterFlow Setup:

1. **Dialog Structure**:
```
AlertDialog
├── Title ("Alternative Exercises")
├── Content
│   └── ListView
│       └── AlternativeCard
│           ├── Exercise info
│           ├── Similarity score
│           └── Select button
└── Actions (Cancel, Select)
```

2. **Alternative Card**:
   - Exercise name and description
   - Similarity percentage
   - Reason for suggestion
   - Preview image

#### Actions:

1. **Get Alternatives Action**:
   - Call API with current exercise
   - Show alternatives list
   - Handle no alternatives case

2. **Select Alternative Action**:
   - Replace exercise in workout
   - Update session state
   - Close dialog
   - Show confirmation

---

## Progress Tracking Components

### 1. Progress Dashboard

**Component Type**: Custom Widget
**API Endpoint**: `GET /progress/summary`

#### FlutterFlow Setup:

1. **Dashboard Cards**:
```
GridView
├── WorkoutCountCard
├── WeeklyProgressCard
├── RecentPRsCard
└── StreakCard
```

2. **Stats Visualization**:
   - Number counters with animation
   - Progress bars
   - Trend indicators (up/down arrows)

#### Actions:

1. **Load Dashboard Action**:
   - Call progress summary API
   - Update all cards
   - Show refresh timestamp

### 2. Exercise History Chart

**Component Type**: Custom Widget
**API Endpoint**: `GET /progress/exercise-history`

#### FlutterFlow Setup:

1. **Chart Implementation**:
   - Use fl_chart package
   - Line chart for weight progression
   - Scatter plot for volume
   - Date range selector

2. **Data Processing**:
```dart
List<FlSpot> getWeightData(List exerciseHistory) {
  return exerciseHistory.asMap().entries.map((entry) =>
    FlSpot(entry.key.toDouble(), entry.value['weight'].toDouble())
  ).toList();
}
```

#### Actions:

1. **Load History Action**:
   - Call exercise history API
   - Process data for charts
   - Update chart display

---

## Common Patterns

### Error Handling

```dart
void handleApiError(dynamic error) {
  String message = 'An error occurred';
  
  if (error is Map && error.containsKey('error')) {
    message = error['error'];
  }
  
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message))
  );
}
```

### Loading States

```dart
Widget buildWithLoading({
  required bool isLoading,
  required Widget child,
}) {
  return Stack(
    children: [
      child,
      if (isLoading)
        Container(
          color: Colors.black26,
          child: Center(child: CircularProgressIndicator()),
        ),
    ],
  );
}
```

### Pagination

```dart
void loadMore() {
  if (!isLoading && hasMore) {
    currentPage++;
    callApiWithPagination(page: currentPage);
  }
}

// In ListView.builder
itemCount: items.length + (hasMore ? 1 : 0),
itemBuilder: (context, index) {
  if (index == items.length) {
    loadMore();
    return Center(child: CircularProgressIndicator());
  }
  return ItemWidget(items[index]);
}
```

### State Persistence

```dart
// Save important state to shared preferences
void saveWorkoutState() {
  SharedPreferences.getInstance().then((prefs) {
    prefs.setString('current_workout', jsonEncode(currentSession));
  });
}

// Restore state on app start
void restoreWorkoutState() {
  SharedPreferences.getInstance().then((prefs) {
    String? workoutData = prefs.getString('current_workout');
    if (workoutData != null) {
      currentSession = jsonDecode(workoutData);
    }
  });
}
```

## Testing Checklist

- [ ] All API calls handle success/error cases
- [ ] Loading states are shown during API calls
- [ ] Form validation works correctly
- [ ] Offline behavior is handled gracefully
- [ ] State is persisted across app restarts
- [ ] Deep links work for important flows
- [ ] Accessibility labels are set
- [ ] Performance is acceptable on low-end devices
- [ ] Memory usage is optimized
- [ ] Battery usage is minimized