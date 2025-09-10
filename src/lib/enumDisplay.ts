// Enum display mappings for various application enums

export interface EnumDisplayConfig {
  [key: string]: {
    key: string;
    icon?: string;
    color?: string;
    description?: string;
  };
}

// Sex/Gender enum display
export const sexDisplay: EnumDisplayConfig = {
  male: {
    key: 'enum.sex.male',
    icon: '👨',
    color: 'blue'
  },
  female: {
    key: 'enum.sex.female', 
    icon: '👩',
    color: 'pink'
  },
  other: {
    key: 'enum.sex.other',
    icon: '🧑',
    color: 'purple'
  }
};

// Experience level enum display
export const experienceLevelDisplay: EnumDisplayConfig = {
  beginner: {
    key: 'enum.experience.beginner',
    icon: '🌱',
    color: 'green',
    description: 'enum.experience.beginner.description'
  },
  novice: {
    key: 'enum.experience.novice',
    icon: '🔰',
    color: 'blue',
    description: 'enum.experience.novice.description'
  },
  intermediate: {
    key: 'enum.experience.intermediate',
    icon: '💪',
    color: 'orange',
    description: 'enum.experience.intermediate.description'
  },
  advanced: {
    key: 'enum.experience.advanced',
    icon: '🏆',
    color: 'red',
    description: 'enum.experience.advanced.description'
  },
  expert: {
    key: 'enum.experience.expert',
    icon: '👑',
    color: 'purple',
    description: 'enum.experience.expert.description'
  }
};

// Activity level enum display
export const activityLevelDisplay: EnumDisplayConfig = {
  sedentary: {
    key: 'enum.activity.sedentary',
    icon: '🪑',
    color: 'gray',
    description: 'enum.activity.sedentary.description'
  },
  light: {
    key: 'enum.activity.light',
    icon: '🚶',
    color: 'green',
    description: 'enum.activity.light.description'
  },
  moderate: {
    key: 'enum.activity.moderate',
    icon: '🏃',
    color: 'blue',
    description: 'enum.activity.moderate.description'
  },
  active: {
    key: 'enum.activity.active',
    icon: '🏋️',
    color: 'orange',
    description: 'enum.activity.active.description'
  },
  very_active: {
    key: 'enum.activity.very_active',
    icon: '🤸',
    color: 'red',
    description: 'enum.activity.very_active.description'
  }
};

// Primary goal enum display
export const primaryGoalDisplay: EnumDisplayConfig = {
  weight_loss: {
    key: 'enum.goal.weight_loss',
    icon: '📉',
    color: 'red'
  },
  muscle_gain: {
    key: 'enum.goal.muscle_gain',
    icon: '💪',
    color: 'blue'
  },
  strength: {
    key: 'enum.goal.strength',
    icon: '🏋️',
    color: 'orange'
  },
  endurance: {
    key: 'enum.goal.endurance',
    icon: '🏃',
    color: 'green'
  },
  general_fitness: {
    key: 'enum.goal.general_fitness',
    icon: '⚡',
    color: 'purple'
  },
  rehabilitation: {
    key: 'enum.goal.rehabilitation',
    icon: '🩹',
    color: 'teal'
  }
};

// Movement pattern enum display
export const movementPatternDisplay: EnumDisplayConfig = {
  carry: {
    key: 'enum.movement.carry',
    icon: '🏃‍♂️',
    color: 'purple'
  },
  hinge: {
    key: 'enum.movement.hinge',
    icon: '🔄',
    color: 'orange'
  },
  isolation: {
    key: 'enum.movement.isolation',
    icon: '🎯',
    color: 'indigo'
  },
  lunge: {
    key: 'enum.movement.lunge',
    icon: '🦵',
    color: 'teal'
  },
  pull: {
    key: 'enum.movement.pull',
    icon: '🤲',
    color: 'green'
  },
  push: {
    key: 'enum.movement.push',
    icon: '👐',
    color: 'red'
  },
  rotation: {
    key: 'enum.movement.rotation',
    icon: '🌀',
    color: 'amber'
  },
  squat: {
    key: 'enum.movement.squat',
    icon: '⬇️',
    color: 'blue'
  }
};

// Exercise skill level enum display
export const exerciseSkillLevelDisplay: EnumDisplayConfig = {
  easy: {
    key: 'enum.skill.easy',
    icon: '🟢',
    color: 'green'
  },
  medium: {
    key: 'enum.skill.medium',
    icon: '🟡',
    color: 'yellow'
  },
  hard: {
    key: 'enum.skill.hard',
    icon: '🔴',
    color: 'red'
  }
};

// Set type enum display
export const setTypeDisplay: EnumDisplayConfig = {
  warmup: {
    key: 'enum.set_type.warmup',
    icon: '🔥',
    color: 'orange'
  },
  normal: {
    key: 'enum.set_type.normal',
    icon: '💪',
    color: 'blue'
  },
  drop: {
    key: 'enum.set_type.drop',
    icon: '📉',
    color: 'red'
  },
  top_set: {
    key: 'enum.set_type.top_set',
    icon: '⭐',
    color: 'gold'
  },
  backoff: {
    key: 'enum.set_type.backoff',
    icon: '⬇️',
    color: 'gray'
  },
  amrap: {
    key: 'enum.set_type.amrap',
    icon: '🔥',
    color: 'red'
  }
};

// Weight unit enum display
export const weightUnitDisplay: EnumDisplayConfig = {
  kg: {
    key: 'enum.weight_unit.kg',
    icon: '⚖️',
    color: 'blue'
  },
  lb: {
    key: 'enum.weight_unit.lb',
    icon: '⚖️',
    color: 'orange'
  }
};

// Body side enum display
export const bodySideDisplay: EnumDisplayConfig = {
  left: {
    key: 'enum.body_side.left',
    icon: '⬅️',
    color: 'blue'
  },
  right: {
    key: 'enum.body_side.right',
    icon: '➡️',
    color: 'green'
  },
  bilateral: {
    key: 'enum.body_side.bilateral',
    icon: '↔️',
    color: 'purple'
  },
  unspecified: {
    key: 'enum.body_side.unspecified',
    icon: '❓',
    color: 'gray'
  }
};

// Injury severity enum display  
export const injurySeverityDisplay: EnumDisplayConfig = {
  minor: {
    key: 'enum.injury_severity.minor',
    icon: '🟢',
    color: 'green'
  },
  moderate: {
    key: 'enum.injury_severity.moderate',
    icon: '🟡',
    color: 'yellow'
  },
  severe: {
    key: 'enum.injury_severity.severe',
    icon: '🔴',
    color: 'red'
  }
};

// App role enum display
export const appRoleDisplay: EnumDisplayConfig = {
  user: {
    key: 'enum.role.user',
    icon: '👤',
    color: 'blue'
  },
  admin: {
    key: 'enum.role.admin',
    icon: '⚙️',
    color: 'orange'
  },
  superadmin: {
    key: 'enum.role.superadmin',
    icon: '👑',
    color: 'purple'
  }
};

// Health subcategory enum display
export const healthSubcategoryDisplay: EnumDisplayConfig = {
  fitness: {
    key: 'enum.health.fitness',
    icon: '🏋️',
    color: 'green'
  },
  nutrition: {
    key: 'enum.health.nutrition',
    icon: '🍎',
    color: 'orange'
  },
  sleep: {
    key: 'enum.health.sleep',
    icon: '🛏️',
    color: 'purple'
  },
  medical: {
    key: 'enum.health.medical',
    icon: '💎',
    color: 'blue'
  },
  energy: {
    key: 'enum.health.energy',
    icon: '⚡',
    color: 'yellow'
  },
  configure: {
    key: 'enum.health.configure',
    icon: '⚙️',
    color: 'gray'
  }
};

// Map of all enum displays for easy access
export const enumDisplayMaps = {
  sex: sexDisplay,
  experience_level: experienceLevelDisplay,
  activity_level: activityLevelDisplay,
  primary_goal: primaryGoalDisplay,
  movement_pattern: movementPatternDisplay,
  exercise_skill_level: exerciseSkillLevelDisplay,
  set_type: setTypeDisplay,
  weight_unit: weightUnitDisplay,
  body_side: bodySideDisplay,
  injury_severity: injurySeverityDisplay,
  app_role: appRoleDisplay,
  health_subcategory: healthSubcategoryDisplay
} as const;

export type EnumDisplayMapKeys = keyof typeof enumDisplayMaps;