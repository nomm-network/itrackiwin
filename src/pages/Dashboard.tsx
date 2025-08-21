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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal command center for tracking progress across all areas of life.
        </p>
      </div>

      {/* Category Navigation */}
      <Tabs value={currentCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex items-center gap-2 text-xs"
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-6">
            {/* Subcategory Navigation */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cat.subcategories.map((sub) => (
                  <Badge
                    key={sub.id}
                    variant={currentSubcategory === sub.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleSubcategoryChange(sub.id)}
                  >
                    <span className="mr-1">{sub.icon}</span>
                    {sub.name}
                  </Badge>
                ))}
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