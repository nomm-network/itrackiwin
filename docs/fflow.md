# FlutterFlow Integration Guide

## Overview
This guide covers the complete integration between our fitness platform backend and FlutterFlow mobile applications, including authentication, API integration, and real-time features.

## Authentication Setup

### Supabase Authentication in FlutterFlow

1. **Configure Supabase in FlutterFlow**:
   - Go to App Settings > Integrations > Supabase
   - Add Project URL: `https://fsayiuhncisevhipbrak.supabase.co`
   - Add Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Authentication Actions**:
   ```dart
   // Sign Up
   await SupaFlow.client.auth.signUp(
     email: emailController.text,
     password: passwordController.text,
   );
   
   // Sign In
   await SupaFlow.client.auth.signInWithPassword(
     email: emailController.text,
     password: passwordController.text,
   );
   
   // Sign Out
   await SupaFlow.client.auth.signOut();
   ```

3. **Auth State Management**:
   - Use FlutterFlow's built-in auth state
   - Listen to `SupaFlow.client.auth.onAuthStateChange`
   - Redirect users based on authentication status

## API Integration

### Custom API Calls

#### Direct Supabase Queries
```dart
// Get user profile
final response = await SupaFlow.client
  .from('profiles')
  .select()
  .eq('user_id', currentUserUid)
  .single();

// Get exercises
final exercises = await SupaFlow.client
  .from('exercises')
  .select('id, name, description, equipment_id')
  .eq('is_public', true)
  .limit(20);
```

#### RPC Function Calls
```dart
// Start workout
final workoutResponse = await SupaFlow.client.rpc('start_workout', 
  params: {'template_id': templateId}
);

// Log exercise set
final setResponse = await SupaFlow.client.rpc('set_log', 
  params: {
    'workout_exercise_id': workoutExerciseId,
    'weight': weightValue,
    'reps': repsValue,
    'rpe': rpeValue,
    'weight_unit': 'kg'
  }
);
```

#### Edge Function Integration
```dart
// AI Coach consultation
final coachResponse = await SupaFlow.client.functions.invoke('ai-coach',
  body: {
    'message': userQuestion,
    'context': {
      'recent_workouts': recentWorkouts,
      'fitness_profile': fitnessProfile
    }
  }
);

// Generate workout
final workoutGeneration = await SupaFlow.client.functions.invoke('generate-workout',
  body: {
    'user_id': currentUserUid,
    'workout_type': 'push',
    'duration_minutes': 60
  }
);
```

## Data Models

### User Profile Model
```dart
class UserProfile {
  final String id;
  final String userId;
  final String? displayName;
  final String? avatarUrl;
  final bool isPublic;
  
  UserProfile({
    required this.id,
    required this.userId,
    this.displayName,
    this.avatarUrl,
    this.isPublic = true,
  });
  
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      userId: json['user_id'],
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      isPublic: json['is_public'] ?? true,
    );
  }
}
```

### Exercise Model
```dart
class Exercise {
  final String id;
  final String name;
  final String? description;
  final String? equipmentId;
  final String? bodyPartId;
  final String? primaryMuscleId;
  final String? movementPattern;
  final int complexityScore;
  
  Exercise({
    required this.id,
    required this.name,
    this.description,
    this.equipmentId,
    this.bodyPartId,
    this.primaryMuscleId,
    this.movementPattern,
    this.complexityScore = 5,
  });
  
  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      equipmentId: json['equipment_id'],
      bodyPartId: json['body_part_id'],
      primaryMuscleId: json['primary_muscle_id'],
      movementPattern: json['movement_pattern'],
      complexityScore: json['complexity_score'] ?? 5,
    );
  }
}
```

### Workout Models
```dart
class Workout {
  final String id;
  final String userId;
  final String? title;
  final DateTime startedAt;
  final DateTime? endedAt;
  final List<WorkoutExercise>? exercises;
  
  Workout({
    required this.id,
    required this.userId,
    this.title,
    required this.startedAt,
    this.endedAt,
    this.exercises,
  });
}

class WorkoutSet {
  final String id;
  final String workoutExerciseId;
  final int setIndex;
  final double? weight;
  final int? reps;
  final double? rpe;
  final String weightUnit;
  final bool isCompleted;
  
  WorkoutSet({
    required this.id,
    required this.workoutExerciseId,
    required this.setIndex,
    this.weight,
    this.reps,
    this.rpe,
    this.weightUnit = 'kg',
    this.isCompleted = false,
  });
}
```

## Custom Actions

### Workout Flow Actions

#### Start Workout Action
```dart
Future<String?> startWorkoutAction({
  String? templateId,
}) async {
  try {
    final response = await SupaFlow.client.rpc('start_workout', 
      params: templateId != null ? {'template_id': templateId} : {}
    );
    
    if (response != null) {
      // Store workout ID in app state
      FFAppState().currentWorkoutId = response.toString();
      return response.toString();
    }
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to start workout: $e'))
    );
  }
  return null;
}
```

#### Log Set Action
```dart
Future<bool> logSetAction({
  required String workoutExerciseId,
  required double weight,
  required int reps,
  double? rpe,
  String weightUnit = 'kg',
  String? notes,
}) async {
  try {
    final response = await SupaFlow.client.rpc('set_log', params: {
      'workout_exercise_id': workoutExerciseId,
      'weight': weight,
      'reps': reps,
      'rpe': rpe,
      'weight_unit': weightUnit,
      'notes': notes,
    });
    
    // Show success feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Set logged: ${weight}${weightUnit} x ${reps} reps'))
    );
    
    return true;
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to log set: $e'))
    );
    return false;
  }
}
```

### AI Coach Integration

#### Get AI Advice Action
```dart
Future<String?> getAIAdviceAction({
  required String message,
  Map<String, dynamic>? context,
}) async {
  try {
    final response = await SupaFlow.client.functions.invoke('ai-coach',
      body: {
        'message': message,
        'context': context ?? {},
      }
    );
    
    if (response.data != null && response.data['response'] != null) {
      return response.data['response'];
    }
  } catch (e) {
    print('AI Coach error: $e');
  }
  return null;
}
```

## Real-time Features

### Workout Progress Subscription
```dart
class WorkoutProgressListener {
  StreamSubscription? _subscription;
  
  void startListening(String workoutId) {
    _subscription = SupaFlow.client
      .channel('workout-progress')
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'workout_sets',
        callback: (payload) {
          // Update UI with new set data
          updateWorkoutUI(payload.newRecord);
        },
      )
      .subscribe();
  }
  
  void stopListening() {
    _subscription?.cancel();
  }
}
```

### Personal Records Notifications
```dart
void subscribeToPersonalRecords() {
  SupaFlow.client
    .channel('personal-records')
    .onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'personal_records',
      filter: 'user_id=eq.${currentUserUid}',
      callback: (payload) {
        // Show PR celebration
        showPRNotification(payload.newRecord);
      },
    )
    .subscribe();
}
```

## Page Components

### Exercise List Page
```dart
// Data source configuration
DataSource: Supabase Query
Table: exercises  
Query: 
  SELECT id, name, description, equipment_id
  FROM exercises 
  WHERE is_public = true
  ORDER BY name

// Filter widgets
- Equipment filter (dropdown)
- Body part filter (checkbox list)
- Search bar (text input)
```

### Workout Session Page
```dart
// Current workout state
FFAppState().currentWorkoutId
FFAppState().currentExercises (List<WorkoutExercise>)
FFAppState().currentSets (List<WorkoutSet>)

// UI Components
- Exercise list (ListView)
- Set logging form (Custom widget)
- Rest timer (Timer widget)
- Progress indicators (Progress bars)
```

### Profile Page
```dart
// User data binding
DataSource: Supabase Query
Table: profiles
Filter: user_id = currentUserUid

// Editable fields
- Display name (TextFormField)
- Bio (TextFormField, multiline)
- Avatar (Image picker)
- Privacy settings (Switch)
```

## Custom Widgets

### Exercise Card Widget
```dart
Widget buildExerciseCard(Exercise exercise) {
  return Card(
    child: ListTile(
      leading: exercise.imageUrl != null 
        ? Image.network(exercise.imageUrl!)
        : Icon(Icons.fitness_center),
      title: Text(exercise.name),
      subtitle: Text(exercise.description ?? ''),
      trailing: IconButton(
        icon: Icon(Icons.add),
        onPressed: () => addExerciseToWorkout(exercise.id),
      ),
    ),
  );
}
```

### Set Logging Widget
```dart
class SetLoggingWidget extends StatefulWidget {
  final String workoutExerciseId;
  final WorkoutSet? lastSet;
  
  @override
  _SetLoggingWidgetState createState() => _SetLoggingWidgetState();
}

class _SetLoggingWidgetState extends State<SetLoggingWidget> {
  final _weightController = TextEditingController();
  final _repsController = TextEditingController();
  double _rpe = 7.0;
  
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _weightController,
                    decoration: InputDecoration(labelText: 'Weight (kg)'),
                    keyboardType: TextInputType.number,
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _repsController,
                    decoration: InputDecoration(labelText: 'Reps'),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Text('RPE: ${_rpe.toStringAsFixed(1)}'),
            Slider(
              value: _rpe,
              min: 1.0,
              max: 10.0,
              divisions: 18,
              onChanged: (value) => setState(() => _rpe = value),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _logSet,
              child: Text('Log Set'),
            ),
          ],
        ),
      ),
    );
  }
  
  void _logSet() async {
    final success = await logSetAction(
      workoutExerciseId: widget.workoutExerciseId,
      weight: double.parse(_weightController.text),
      reps: int.parse(_repsController.text),
      rpe: _rpe,
    );
    
    if (success) {
      _weightController.clear();
      _repsController.clear();
      setState(() => _rpe = 7.0);
    }
  }
}
```

## Error Handling

### Network Error Handling
```dart
Future<T?> safeApiCall<T>(Future<T> Function() apiCall) async {
  try {
    return await apiCall();
  } on SocketException {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('No internet connection'))
    );
  } on TimeoutException {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Request timed out'))
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Something went wrong: $e'))
    );
  }
  return null;
}
```

### Supabase Error Handling
```dart
void handleSupabaseError(dynamic error) {
  if (error.toString().contains('JWT')) {
    // Redirect to login
    context.pushNamed('login');
  } else if (error.toString().contains('Row Level Security')) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Access denied'))
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Database error: $error'))
    );
  }
}
```

## Performance Optimization

### Pagination Implementation
```dart
class PaginatedExerciseList extends StatefulWidget {
  @override
  _PaginatedExerciseListState createState() => _PaginatedExerciseListState();
}

class _PaginatedExerciseListState extends State<PaginatedExerciseList> {
  List<Exercise> exercises = [];
  int _page = 0;
  final int _pageSize = 20;
  bool _loading = false;
  bool _hasMore = true;
  
  @override
  void initState() {
    super.initState();
    _loadExercises();
  }
  
  Future<void> _loadExercises() async {
    if (_loading || !_hasMore) return;
    
    setState(() => _loading = true);
    
    final response = await SupaFlow.client
      .from('exercises')
      .select()
      .eq('is_public', true)
      .range(_page * _pageSize, (_page + 1) * _pageSize - 1);
    
    if (response.length < _pageSize) {
      _hasMore = false;
    }
    
    setState(() {
      exercises.addAll(response.map((e) => Exercise.fromJson(e)).toList());
      _page++;
      _loading = false;
    });
  }
}
```

### Caching Strategy
```dart
class CacheManager {
  static final Map<String, dynamic> _cache = {};
  static final Map<String, DateTime> _cacheTimestamps = {};
  
  static Future<T?> getCachedData<T>(
    String key,
    Future<T> Function() dataFetcher, {
    Duration cacheDuration = const Duration(minutes: 30),
  }) async {
    final now = DateTime.now();
    final cachedTime = _cacheTimestamps[key];
    
    if (cachedTime != null && 
        now.difference(cachedTime) < cacheDuration &&
        _cache.containsKey(key)) {
      return _cache[key] as T;
    }
    
    final data = await dataFetcher();
    _cache[key] = data;
    _cacheTimestamps[key] = now;
    
    return data;
  }
}
```

## Testing

### Widget Testing
```dart
testWidgets('Exercise card displays correctly', (WidgetTester tester) async {
  final exercise = Exercise(
    id: 'test-id',
    name: 'Test Exercise',
    description: 'Test description',
  );
  
  await tester.pumpWidget(
    MaterialApp(home: ExerciseCard(exercise: exercise))
  );
  
  expect(find.text('Test Exercise'), findsOneWidget);
  expect(find.text('Test description'), findsOneWidget);
});
```

### Integration Testing
```dart
group('Workout flow integration tests', () {
  testWidgets('Complete workout flow', (WidgetTester tester) async {
    // Navigate to workout page
    await tester.pumpWidget(MyApp());
    await tester.tap(find.text('Start Workout'));
    await tester.pumpAndSettle();
    
    // Add exercise
    await tester.tap(find.text('Add Exercise'));
    await tester.pumpAndSettle();
    
    // Log set
    await tester.enterText(find.byKey(Key('weight-input')), '100');
    await tester.enterText(find.byKey(Key('reps-input')), '8');
    await tester.tap(find.text('Log Set'));
    await tester.pumpAndSettle();
    
    // Verify set was logged
    expect(find.text('100kg x 8 reps'), findsOneWidget);
  });
});
```

## Deployment

### Build Configuration
```yaml
# pubspec.yaml dependencies
dependencies:
  supabase_flutter: ^2.0.0
  flutter_dotenv: ^5.0.2
  image_picker: ^1.0.0
  shared_preferences: ^2.0.15
```

### Environment Variables
```dart
// .env file
SUPABASE_URL=https://fsayiuhncisevhipbrak.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Load in main.dart
await dotenv.load(fileName: ".env");
```

### Release Preparation
1. **Test authentication flows**
2. **Verify API integrations**
3. **Test offline capabilities**
4. **Performance testing**
5. **Security review**
6. **Store submission**