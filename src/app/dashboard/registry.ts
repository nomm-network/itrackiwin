import React from 'react';
import type { DashboardWidget as Widget, QuickAction } from './types';

// All fitness/workout widgets and actions have been removed
export const widgets: Widget[] = [];
export const quickActions: QuickAction[] = [];

// Return empty arrays since all workout/fitness functionality was removed
export const useDynamicQuickActions = (category?: string, subcategory?: string): QuickAction[] => {
  return [];
};

export const getWidgetsByCategory = (categoryId: string, subcategoryId?: string): Widget[] => {
  return [];
};

export const getQuickActionsByCategory = (categoryId: string, subcategoryId?: string): QuickAction[] => {
  return [];
};