export type Feel = '--' | '-' | '=' | '+' | '++';

export function feelToRpe(feel?: Feel | null): number | null {
  if (!feel) return null;
  switch (feel) {
    case '++': return 6;  // very easy (lots in reserve)
    case '+':  return 7;  // easy
    case '=':  return 8;  // just right / 1–2 reps in reserve
    case '-':  return 9;  // hard
    case '--': return 10; // maximal
  }
}

export function feelEmoji(feel?: Feel | null): string {
  switch (feel) {
    case '++': return '😎';  // Very Easy - consistent with FEEL_OPTIONS
    case '+':  return '😄';  // Easy - consistent with FEEL_OPTIONS  
    case '=':  return '🙂';  // Just Right - consistent with FEEL_OPTIONS
    case '-':  return '😣';  // Hard - consistent with FEEL_OPTIONS
    case '--': return '😵'; // Very Hard - consistent with FEEL_OPTIONS
    default:   return '';
  }
}

export function feelToText(feel?: Feel | null): string {
  switch (feel) {
    case '++': return 'Very Easy';
    case '+':  return 'Easy';
    case '=':  return 'Just Right';
    case '-':  return 'Hard';
    case '--': return 'Maximal';
    default:   return '';
  }
}

// Extract feel from notes string (for parsing Feel: XX format)
export function parseFeelFromNotes(notes?: string | null): Feel | null {
  if (!notes) return null;
  
  const feelMatch = notes.match(/Feel:\s*(--|-|=|\+|\+\+)/);
  return feelMatch ? (feelMatch[1] as Feel) : null;
}