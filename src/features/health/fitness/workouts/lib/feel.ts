// Feel utility functions - stub for migration
export type Feel = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard' | '--' | '-' | '++' | '+' | '=';

export const feelEmoji = (feel?: Feel): string => {
  if (!feel) return '';
  
  const emojiMap: Record<Feel, string> = {
    'very_easy': '😴',
    'easy': '😌', 
    'moderate': '😐',
    'hard': '😤',
    'very_hard': '🥵',
    '--': '',
    '-': '',
    '++': '🔥',
    '+': '😊',
    '=': '😐'
  };
  
  return emojiMap[feel] || '';
};

// Parse feel from notes - stub function
export const parseFeelFromNotes = (notes?: string): Feel | null => {
  if (!notes) return null;
  // Simple stub implementation
  return null;
};