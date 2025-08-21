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