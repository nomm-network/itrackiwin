// Centralized React Query cache keys for shared usage
export const sharedQueryKeys = {
  // Auth & Users
  auth: ['auth'] as const,
  user: (id: string) => ['user', id] as const,
  profile: (id: string) => ['profile', id] as const,
  
  // System-wide data
  categories: ['categories'] as const,
  subcategories: ['subcategories'] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  insights: (userId: string) => ['insights', userId] as const,
  
  // Social
  social: ['social'] as const,
  friends: (userId: string) => ['friends', userId] as const,
  
  // Gamification
  achievements: (userId: string) => ['achievements', userId] as const,
  xp: (userId: string) => ['xp', userId] as const,
} as const;

// Fitness query keys
export const fitnessKeys = {
  all: ['fitness'] as const,
  workouts: () => [...fitnessKeys.all, 'workouts'] as const,
  workout: (id: string) => [...fitnessKeys.workouts(), id] as const,
  exercises: () => [...fitnessKeys.all, 'exercises'] as const,
  exercise: (id: string) => [...fitnessKeys.exercises(), id] as const,
  metrics: () => [...fitnessKeys.all, 'metrics'] as const,
  metric: (id: string) => [...fitnessKeys.metrics(), id] as const,
  templates: () => [...fitnessKeys.all, 'templates'] as const,
  template: (id: string) => [...fitnessKeys.templates(), id] as const,
  gym: {
    default: () => [...fitnessKeys.all, 'gym', 'default'] as const,
    inventory: (gymId?: string) => [...fitnessKeys.all, 'gym', 'inventory', gymId] as const,
    rotation: () => [...fitnessKeys.templates(), 'rotation'] as const,
  },
} as const;