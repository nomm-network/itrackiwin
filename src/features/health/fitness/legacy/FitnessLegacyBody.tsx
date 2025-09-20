import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWidgetsByCategory, useDynamicQuickActions } from '@/app/dashboard/registry';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';
// Legacy modal removed - using new flow
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';

/**
 * This component is a verbatim copy of the v64 Dashboard body:
 * - Training Center card (Quick Start widget)
 * - Quick Actions grid (Templates, History, Programs, Mentors)
 * Keep all classNames, icons, spacing as-is.
 */
export default function FitnessLegacyBody() {
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { checkAndRedirect } = useFitnessProfileCheck();
  
  // Fixed to Health category with fitness subcategory
  const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d'; // health category ID
  const currentSubcategory = 'e13d15c9-85a7-41ec-bd4b-232a69fcb247'; // fitness subcategory ID
  
  const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
  const actions = useDynamicQuickActions(currentCategory, currentSubcategory);

  const handleActionClick = (action: any) => {
    // Check fitness profile for fitness-related actions
    if (action.id.startsWith('fitness.')) {
      if (!checkAndRedirect('access this feature')) return;
    }
    
    // Special handling for fitness start workout action
    if (action.id === 'fitness.start') {
      navigate('/app/workouts/start/default'); // Will show classic readiness
    } else if (action.onClickPath) {
      navigate(action.onClickPath);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const getWidgetGridClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'col-span-2';
      case 'md': return 'col-span-3';
      case 'lg': return 'col-span-4';
      case 'xl': return 'col-span-6';
      default: return 'col-span-2';
    }
  };

  return (
    <>
      {/* Widgets Grid - separate Quick Start from other widgets */}
      <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4">
        {visibleWidgets
          .filter(widget => widget.id === 'fitness.quickstart')
          .map((widget) => (
          <div key={widget.id} className={getWidgetGridClasses(widget.size)}>
            <React.Suspense
              fallback={
                widget.loadingFallback || 
                <WidgetSkeleton className="h-full" />
              }
            >
              <widget.Component />
            </React.Suspense>
          </div>
        ))}
      </div>

      {/* Quick Actions - immediately after Quick Start */}
      {actions.length > 0 && (
        <Card>
          <CardContent className="pt-3 sm:pt-6">
            <h3 className="text-lg font-semibold mb-2 sm:mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  onClick={() => handleActionClick(action)}
                  className="h-12 flex items-center gap-2"
                >
                  {action.icon}
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Widgets - Readiness and stats */}
      <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4">
        {visibleWidgets
          .filter(widget => widget.id !== 'fitness.quickstart')
          .map((widget) => (
          <div key={widget.id} className={getWidgetGridClasses(widget.size)}>
            <React.Suspense
              fallback={
                widget.loadingFallback || 
                <WidgetSkeleton className="h-full" />
              }
            >
              <widget.Component />
            </React.Suspense>
          </div>
        ))}
      </div>
    </>
  );
}
