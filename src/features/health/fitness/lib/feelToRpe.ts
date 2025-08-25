// Feel is the user-facing UI: simplified effort rating
// We map to typical training RPEs so Bro can calculate progression
export type Feel = "--" | "-" | "=" | "+" | "++";

export const FEEL_TO_RPE: Record<Feel, number> = {
  "--": 10,  // Very Hard - maximal effort/failed
  "-": 9,    // Hard - near limit  
  "=": 8,    // Just Right - target effort
  "+": 7,    // Easy - a bit too easy
  "++": 6,   // Very Easy - much too easy
};

export const FEEL_OPTIONS = [
  { value: '--' as Feel, label: 'Very Hard', color: 'bg-red-500 hover:bg-red-600', emoji: '😵' },
  { value: '-' as Feel, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', emoji: '😣' },
  { value: '=' as Feel, label: 'Just Right', color: 'bg-yellow-500 hover:bg-yellow-600', emoji: '🙂' },
  { value: '+' as Feel, label: 'Easy', color: 'bg-green-500 hover:bg-green-600', emoji: '😄' },
  { value: '++' as Feel, label: 'Very Easy', color: 'bg-blue-500 hover:bg-blue-600', emoji: '😎' },
];

// Helper to convert RPE back to Feel (for display purposes)
export const rpeToFeel = (rpe?: number | null): Feel => {
  if (!rpe) return '=';
  if (rpe >= 9.5) return '--';
  if (rpe >= 8.5) return '-';
  if (rpe >= 7.5) return '=';
  if (rpe >= 6.5) return '+';
  return '++';
};