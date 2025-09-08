// Helper for creating deep links to dashboard categories and subcategories
export const dashLink = (cat: string, sub?: string) =>
  `/app/dashboard?cat=${encodeURIComponent(cat)}${sub ? `&sub=${encodeURIComponent(sub)}` : ""}`;

// Common dashboard links
export const dashboardLinks = {
  fitness: {
    training: () => dashLink("health.fitness", "training"),
    history: () => dashLink("health.fitness", "history"),
    readiness: () => dashLink("health.fitness", "readiness"),
  },
  nutrition: {
    log: () => dashLink("health.nutrition", "log"),
    stats: () => dashLink("health.nutrition", "stats"),
  },
  relationships: {
    friends: () => dashLink("relationships", "friends"),
    family: () => dashLink("relationships", "family"),
    love: () => dashLink("relationships", "love"),
  },
} as const;