// Utility functions for parsing voice input in fitness context

export interface ParsedVoiceInput {
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  exercise?: string;
  unit?: 'kg' | 'lbs' | 'seconds' | 'minutes';
}

export function parseVoiceInput(text: string): ParsedVoiceInput {
  const input = text.toLowerCase();
  const result: ParsedVoiceInput = {};

  // Weight patterns
  const weightPatterns = [
    /(\d+\.?\d*)\s*(?:kg|kilos?|kilograms?)/i,
    /(\d+\.?\d*)\s*(?:lbs?|pounds?)/i,
    /(\d+\.?\d*)\s*(?:weight)/i
  ];

  // Reps patterns
  const repsPatterns = [
    /(\d+)\s*(?:reps?|repetitions?)/i,
    /do\s*(\d+)/i,
    /(\d+)\s*times/i
  ];

  // Sets patterns
  const setsPatterns = [
    /(\d+)\s*(?:sets?)/i,
    /(\d+)\s*rounds?/i
  ];

  // Duration patterns
  const durationPatterns = [
    /(\d+\.?\d*)\s*(?:seconds?|secs?)/i,
    /(\d+\.?\d*)\s*(?:minutes?|mins?)/i,
    /(\d+\.?\d*)\s*(?:hours?|hrs?)/i
  ];

  // Exercise patterns
  const exercisePatterns = [
    /(?:bench|press)/i,
    /(?:squat)/i,
    /(?:deadlift)/i,
    /(?:curl)/i,
    /(?:pull|pullup)/i,
    /(?:push|pushup)/i,
    /(?:row)/i
  ];

  // Parse weight
  for (const pattern of weightPatterns) {
    const match = input.match(pattern);
    if (match) {
      result.weight = parseFloat(match[1]);
      if (pattern.source.includes('lbs|pounds')) {
        result.unit = 'lbs';
      } else {
        result.unit = 'kg';
      }
      break;
    }
  }

  // Parse reps
  for (const pattern of repsPatterns) {
    const match = input.match(pattern);
    if (match) {
      result.reps = parseInt(match[1]);
      break;
    }
  }

  // Parse sets
  for (const pattern of setsPatterns) {
    const match = input.match(pattern);
    if (match) {
      result.sets = parseInt(match[1]);
      break;
    }
  }

  // Parse duration
  for (const pattern of durationPatterns) {
    const match = input.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (pattern.source.includes('minutes|mins')) {
        result.duration = value * 60; // Convert to seconds
      } else if (pattern.source.includes('hours|hrs')) {
        result.duration = value * 3600; // Convert to seconds
      } else {
        result.duration = value; // Already in seconds
      }
      break;
    }
  }

  // Parse exercise
  for (const pattern of exercisePatterns) {
    const match = input.match(pattern);
    if (match) {
      result.exercise = match[0];
      break;
    }
  }

  // Handle common phrase patterns
  const phrasePatterns = [
    {
      pattern: /(\d+)\s*(?:reps?)?\s*(?:at|with|of)\s*(\d+\.?\d*)\s*(?:kg|kilos?)/i,
      handler: (match: RegExpMatchArray) => {
        result.reps = parseInt(match[1]);
        result.weight = parseFloat(match[2]);
        result.unit = 'kg';
      }
    },
    {
      pattern: /(\d+\.?\d*)\s*(?:kg|kilos?)\s*(?:for|x)\s*(\d+)\s*(?:reps?)?/i,
      handler: (match: RegExpMatchArray) => {
        result.weight = parseFloat(match[1]);
        result.reps = parseInt(match[2]);
        result.unit = 'kg';
      }
    },
    {
      pattern: /(\d+)\s*sets?\s*(?:of|x)\s*(\d+)\s*(?:reps?)?/i,
      handler: (match: RegExpMatchArray) => {
        result.sets = parseInt(match[1]);
        result.reps = parseInt(match[2]);
      }
    }
  ];

  for (const { pattern, handler } of phrasePatterns) {
    const match = input.match(pattern);
    if (match) {
      handler(match);
      break;
    }
  }

  return result;
}

// Generate helpful voice command suggestions
export const voiceCommandSuggestions = [
  "10 reps at 50 kilos",
  "3 sets of 8 reps",
  "50 kg for 10 reps",
  "bench press 80 kilos",
  "hold for 30 seconds",
  "5 minutes cardio",
  "increase weight by 5 kg",
  "same as last time"
];

// Convert parsed input to readable text
export function formatParsedInput(parsed: ParsedVoiceInput): string {
  const parts: string[] = [];
  
  if (parsed.sets) {
    parts.push(`${parsed.sets} set${parsed.sets > 1 ? 's' : ''}`);
  }
  
  if (parsed.reps) {
    parts.push(`${parsed.reps} rep${parsed.reps > 1 ? 's' : ''}`);
  }
  
  if (parsed.weight) {
    parts.push(`${parsed.weight} ${parsed.unit || 'kg'}`);
  }
  
  if (parsed.duration) {
    const minutes = Math.floor(parsed.duration / 60);
    const seconds = parsed.duration % 60;
    if (minutes > 0) {
      parts.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      parts.push(`${seconds} seconds`);
    }
  }
  
  if (parsed.exercise) {
    parts.unshift(parsed.exercise);
  }
  
  return parts.join(' • ') || 'No data recognized';
}