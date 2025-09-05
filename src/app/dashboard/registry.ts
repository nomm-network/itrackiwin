import React from 'react';
import type { DashboardWidget, QuickAction } from './types';
import { Play, Target, Calendar, Settings, Repeat, Users } from 'lucide-react';
// import { useActiveWorkout } from '@/features/health/fitness/workouts/hooks'; // REMOVED

// Fitness widgets - lazy loaded for performance
// const TrainingDashboard = React.lazy(() => import('@/features/health/fitness/ui/widgets/TrainingDashboard')); // REMOVED
const FitnessStats = React.lazy(() => import('@/features/health/fitness/ui/widgets/FitnessStats'));
const FitnessReadiness = React.lazy(() => import('@/features/health/fitness/ui/widgets/FitnessReadiness'));

export const widgets: DashboardWidget[] = [
  {
    id: 'fitness.readiness',
    title: 'Readiness',
    size: 'sm',
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    Component: FitnessReadiness,
    order: 2
  },
  {
    id: 'fitness.stats',
    title: 'Fitness Overview',
    size: 'lg',
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    Component: FitnessStats,
    order: 3
  }
  // Future widgets will be added here as features are developed
  // { id: 'nutrition.calories', title: 'Calories Today', ... }
  // { id: 'sleep.score', title: 'Sleep Score', ... }
  // { id: 'wealth.budget', title: 'Budget Overview', ... }
];

// Dynamic quick actions that depend on data
const DynamicFitnessStartAction = () => {
  // const { data: activeWorkout, isLoading, error } = useActiveWorkout(); // REMOVED
  
  console.log('🔍 [DynamicFitnessStartAction] State: workout feature removed');
  
  const targetPath = '/fitness/templates';
  
  console.log('🎯 [DynamicFitnessStartAction] Target path:', targetPath);
  
  return {
    id: 'fitness.start',
    label: 'Start Workout',
    icon: React.createElement(Play, { className: 'h-4 w-4' }),
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // fitness
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness
    onClickPath: targetPath,
    order: 1
  };
};

export const quickActions: QuickAction[] = [
  {
    id: 'fitness.templates',
    label: 'Templates',
    icon: React.createElement(Target, { className: 'h-4 w-4' }),
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    onClickPath: '/fitness/templates',
    order: 2
  },
  {
    id: 'fitness.history',
    label: 'History',
    icon: React.createElement(Calendar, { className: 'h-4 w-4' }),
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    onClickPath: '/fitness/history',
    order: 3
  },
  {
    id: 'fitness.programs',
    label: 'Programs',
    icon: React.createElement(Repeat, { className: 'h-4 w-4' }),
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    onClickPath: '/app/programs',
    order: 4
  },
  {
    id: 'mentors.browse',
    label: 'Mentors',
    icon: React.createElement(Users, { className: 'h-4 w-4' }),
    category: 'b54c368d-cd4f-4276-aa82-668da614e50d', // health category ID
    subcategory: 'e13d15c9-85a7-41ec-bd4b-232a69fcb247', // fitness subcategory ID
    onClickPath: '/mentors',
    order: 6
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

export const useDynamicQuickActions = (category: string, subcategory?: string): QuickAction[] => {
  return getQuickActionsByCategory(category, subcategory);
};