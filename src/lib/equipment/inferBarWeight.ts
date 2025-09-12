interface Exercise {
  bar_type?: 'olympic' | 'ezbar' | 'none';
  is_machine?: boolean;
  equipment?: string;
  load_type?: string;
}

export function inferBarWeight(exercise: Exercise): number {
  // Machine exercises have no bar weight
  if (exercise?.is_machine || exercise?.equipment?.toLowerCase().includes('machine')) {
    return 0;
  }
  
  // Stack/cable exercises have no bar weight
  if (exercise?.load_type === 'stack') {
    return 0;
  }
  
  // Bar type specific weights
  if (exercise?.bar_type === 'ezbar') {
    return 7.5;
  }
  
  if (exercise?.bar_type === 'olympic' || exercise?.bar_type === undefined) {
    return 20; // Standard Olympic barbell
  }
  
  if (exercise?.bar_type === 'none') {
    return 0;
  }
  
  // Default to Olympic barbell for unknown cases
  return 20;
}