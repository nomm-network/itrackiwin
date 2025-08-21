import React from 'react';
import type { DashboardWidget, QuickAction } from './types';
import { Play, Target, Calendar, Settings } from 'lucide-react';

// Fitness widgets - lazy loaded for performance
const FitnessQuickStart = React.lazy(() => import('@/features/health/fitness/ui/widgets/FitnessQuickStart'));
const FitnessStats = React.lazy(() => import('@/features/health/fitness/ui/widgets/FitnessStats'));
const FitnessReadiness = React.lazy(() => import('@/features/health/fitness/ui/widgets/FitnessReadiness'));

export const widgets: DashboardWidget[] = [
  {
    id: 'fitness.quickstart',
    title: 'Quick Start',
    size: 'md',
    category: 'health',
    subcategory: 'fitness',
    Component: FitnessQuickStart,
    order: 1
  },
  {
    id: 'fitness.stats',
    title: 'Fitness Overview',
    size: 'lg',
    category: 'health',
    subcategory: 'fitness',
    Component: FitnessStats,
    order: 2
  },
  {
    id: 'fitness.readiness',
    title: 'Readiness',
    size: 'sm',
    category: 'health',
    subcategory: 'fitness',
    Component: FitnessReadiness,
    order: 3
  }
  // Future widgets will be added here as features are developed
  // { id: 'nutrition.calories', title: 'Calories Today', ... }
  // { id: 'sleep.score', title: 'Sleep Score', ... }
  // { id: 'wealth.budget', title: 'Budget Overview', ... }
];

export const quickActions: QuickAction[] = [
  {
    id: 'fitness.start',
    label: 'Start Workout',
    icon: React.createElement(Play, { className: 'h-4 w-4' }),
    category: 'health',
    subcategory: 'fitness',
    onClickPath: '/fitness',
    order: 1
  },
  {
    id: 'fitness.templates',
    label: 'Templates',
    icon: React.createElement(Target, { className: 'h-4 w-4' }),
    category: 'health',
    subcategory: 'fitness',
    onClickPath: '/fitness/templates',
    order: 2
  },
  {
    id: 'fitness.history',
    label: 'History',
    icon: React.createElement(Calendar, { className: 'h-4 w-4' }),
    category: 'health',
    subcategory: 'fitness',
    onClickPath: '/fitness/history',
    order: 3
  }
  // Future quick actions for other categories/subcategories
];

// Helper functions for the registry
export const getWidgetsByCategory = (category: string, subcategory?: string) => {
  return widgets
    .filter(w => w.category === category && (!subcategory || w.subcategory === subcategory))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getQuickActionsByCategory = (category: string, subcategory?: string) => {
  return quickActions
    .filter(a => a.category === category && (!subcategory || a.subcategory === subcategory))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};