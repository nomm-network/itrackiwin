import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { useLifeCategoriesWithSubcategories, getCategoryBySlug } from '@/hooks/useLifeCategories';
import { getWidgetsByCategory, useDynamicQuickActions } from '@/app/dashboard/registry';
import { useUserRole } from '@/hooks/useUserRole';
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';
import EmptyCategory from '@/app/dashboard/components/EmptyCategory';
import WorkoutSelectionModal from '@/components/fitness/WorkoutSelectionModal';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';


const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { checkAndRedirect } = useFitnessProfileCheck();
  const { isSuperAdmin } = useUserRole();
  
  // Use real database data for Health subcategories
  const { data: categories, isLoading } = useLifeCategoriesWithSubcategories('en');
  
  // Fixed to Health category with subcategory navigation
  const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d'; // health category ID
  const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247'; // fitness subcategory ID
  
  const category = getCategoryBySlug(categories || [], currentCategory);
  const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
  const actions = useDynamicQuickActions(currentCategory, currentSubcategory);

  // Handle subcategory changes in the Health context
  const handleSubcategoryChange = (newSubcategory: string) => {
    setSearchParams({ sub: newSubcategory });
  };


  const handleActionClick = (action: any) => {
    // Check fitness profile for fitness-related actions
    if (action.id.startsWith('fitness.')) {
      if (!checkAndRedirect('access this feature')) return;
    }
    
    // Special handling for fitness start workout action
    if (action.id === 'fitness.start') {
      setShowTemplateDialog(true);
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

  if (isLoading || !categories) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button 
                variant="default" 
                onClick={() => navigate('/admin')}
                className="text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/explore')}
              className="text-sm"
            >
              Explore by Planets
            </Button>
          </div>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress across all areas of life.
        </p>
      </div>

      {/* Health Subcategories Navigation - 3 Column Grid */}
      {(() => {
        const healthCategory = getCategoryBySlug(categories || [], currentCategory);
        const subcategories = healthCategory?.subcategories || [];
        
        return (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {subcategories.filter(sub => sub.name.toLowerCase() !== 'configure').map((sub) => (
              <Button
                key={sub.id}
                variant={currentSubcategory === sub.id ? "default" : "outline"}
                onClick={() => handleSubcategoryChange(sub.id)}
                className={`h-16 flex flex-col items-center gap-1 p-2 ${
                  (sub as any).isPlaceholder 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                disabled={(sub as any).isPlaceholder}
              >
                <span className="text-lg">{sub.icon || '📋'}</span>
                <span className="text-xs leading-tight text-center">
                  {sub.name.split(' ')[0]}
                </span>
              </Button>
            ))}
            {/* Configure button as 6th item */}
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard?cat=health&sub=configure')}
              className="h-16 flex flex-col items-center gap-1 p-2"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-xs leading-tight text-center">
                Configure
              </span>
            </Button>
          </div>
        );
      })()}

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

      {/* Empty State */}
      {(() => {
        const healthCategory = getCategoryBySlug(categories || [], currentCategory);
        const currentSub = healthCategory?.subcategories?.find(s => s.id === currentSubcategory);
        
        return visibleWidgets.length === 0 && (
          <EmptyCategory
            category={healthCategory?.name || 'Health'}
            subcategory={currentSub?.name}
            icon={healthCategory?.icon || '🏥'}
            onGetStarted={
              currentSubcategory === 'e13d15c9-85a7-41ec-bd4b-232a69fcb247' // fitness subcategory
                ? () => navigate('/fitness')
                : undefined
            }
          />
        );
      })()}
      
      <WorkoutSelectionModal 
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      />
    </div>
  );
};

export default Dashboard;