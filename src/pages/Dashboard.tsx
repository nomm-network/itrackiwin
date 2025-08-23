import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLifeCategoriesWithSubcategories, getCategoryBySlug } from '@/hooks/useLifeCategories';
import { getWidgetsByCategory, useDynamicQuickActions } from '@/app/dashboard/registry';
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';
import EmptyCategory from '@/app/dashboard/components/EmptyCategory';
import TemplateSelectionDialog from '@/components/fitness/TemplateSelectionDialog';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { checkAndRedirect } = useFitnessProfileCheck();
  
  // Use real database data instead of static config
  const { data: categories, isLoading } = useLifeCategoriesWithSubcategories('en');
  
  const currentCategory = searchParams.get('cat') || 'b54c368d-cd4f-4276-aa82-668da614e50d'; // health category ID
  const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247'; // fitness subcategory ID
  
  const category = getCategoryBySlug(categories || [], currentCategory);
  const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
  const actions = useDynamicQuickActions(currentCategory, currentSubcategory);

  const handleCategoryChange = (newCategory: string) => {
    const cat = getCategoryBySlug(categories || [], newCategory);
    const defaultSub = cat?.subcategories?.[0]?.id || '';
    setSearchParams({ cat: newCategory, sub: defaultSub });
  };

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSearchParams({ cat: currentCategory, sub: newSubcategory });
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
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your personal command center for tracking progress across all areas of life.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/explore')}
            className="self-start sm:self-auto text-sm"
          >
            Explore by Planets
          </Button>
        </div>
      </div>

      {/* Category Navigation */}
      <Tabs value={currentCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs p-2 sm:p-3 h-auto"
            >
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs sm:text-sm leading-tight">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4 sm:space-y-6">
            {/* Subcategory Navigation */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max px-1">
                  {cat.subcategories.map((sub) => (
                    <Badge
                      key={sub.id}
                      variant={currentSubcategory === sub.id ? "default" : "outline"}
                      className={`cursor-pointer whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm ${
                        (sub as any).isPlaceholder 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                      onClick={() => {
                        if (!(sub as any).isPlaceholder) {
                          handleSubcategoryChange(sub.id);
                        }
                      }}
                    >
                      <span className="mr-1">{sub.icon || '📋'}</span>
                      {sub.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {actions.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            {/* Widgets Grid */}
            <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 md:grid-cols-6 gap-4">
              {visibleWidgets.map((widget) => (
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
            {visibleWidgets.length === 0 && (
              <EmptyCategory
                category={cat.name}
                subcategory={
                  currentSubcategory 
                    ? getCategoryBySlug(categories, currentCategory)?.subcategories?.find(s => s.id === currentSubcategory)?.name
                    : undefined
                }
                icon={cat.icon}
                onGetStarted={
                  cat.id === 'health' && currentSubcategory === 'fitness' 
                    ? () => navigate('/fitness')
                    : undefined
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <TemplateSelectionDialog 
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      />
    </div>
  );
};

export default Dashboard;