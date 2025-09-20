export const Paths = {
  root: '/',
  auth: '/auth',
  dashboard: '/dashboard',
  health: {
    // Fitness paths removed
  },
  social: '/social',
  
  progress: '/progress',
  journal: '/journal',
  insights: '/insights',
  achievements: '/achievements',
  analytics: '/analytics',
  profile: '/profile',
  area: (slug = ':slug') => `/area/${slug}`,
  admin: {
    root: '/admin',
    exercises: '/admin/exercises',
    muscles: '/admin/muscles',
    equipment: '/admin/others/equipment',
    grips: '/admin/others/grips',
    translations: '/admin/translations',
    category: (categoryId = ':categoryId') => `/admin/category/${categoryId}`,
    subcategory: (categoryId = ':categoryId', subcategoryId = ':subcategoryId') =>
      `/admin/category/${categoryId}/sub/${subcategoryId}`,
  },
} as const;