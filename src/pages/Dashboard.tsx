import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { categories, getCategoryBySlug } from '@/app/dashboard/config';
import { getWidgetsByCategory, getQuickActionsByCategory } from '@/app/dashboard/registry';
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';
import EmptyCategory from '@/app/dashboard/components/EmptyCategory';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentCategory = searchParams.get('cat') || 'health';
  const currentSubcategory = searchParams.get('sub') || 'fitness';
  
  const category = getCategoryBySlug(currentCategory);
  const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
  const actions = getQuickActionsByCategory(currentCategory, currentSubcategory);

  const handleCategoryChange = (newCategory: string) => {
    const cat = getCategoryBySlug(newCategory);
    const defaultSub = cat?.subcategories?.[0]?.id || '';
    setSearchParams({ cat: newCategory, sub: defaultSub });
  };

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSearchParams({ cat: currentCategory, sub: newSubcategory });
  };

  const handleActionClick = (action: any) => {
    if (action.onClickPath) {
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
                      className="cursor-pointer whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm"
                      onClick={() => handleSubcategoryChange(sub.id)}
                    >
                      <span className="mr-1">{sub.icon}</span>
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
                    ? getCategoryBySlug(currentCategory)?.subcategories?.find(s => s.id === currentSubcategory)?.name
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
    </div>
  );
};

export default Dashboard;