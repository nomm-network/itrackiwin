import React, { ReactNode, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useLifeCategoriesWithSubcategories, getCategoryBySlug } from '@/hooks/useLifeCategories';
import { getWidgetsByCategory, useDynamicQuickActions } from '@/app/dashboard/registry';
import { useUserRole } from '@/hooks/useUserRole';
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';
import EmptyCategory from '@/app/dashboard/components/EmptyCategory';
import WorkoutSelectionModal from '@/components/fitness/WorkoutSelectionModal';
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';

/** Contract for the dashboard content areas */
type Adapter = {
  Header: () => ReactNode;
  SubcategoryNav: () => ReactNode;
  QuickStartWidget: () => ReactNode;
  QuickActions: () => ReactNode;
  OtherWidgets: () => ReactNode;
  EmptyState: () => ReactNode;
};

/** Under construction placeholder for non-fitness categories */
function UnderConstructionCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-amber-800">This page is under construction, but here are some general best practices:</p>
        </div>
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <ol className="list-decimal list-inside space-y-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="text-sm text-muted-foreground">{bullet}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

/** FITNESS ADAPTER - Uses existing components and logic */
const FitnessAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
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
    );
  },

  SubcategoryNav: () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { data: categories } = useLifeCategoriesWithSubcategories('en');
    
    const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d'; // health category ID
    const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247'; // fitness subcategory ID
    
    const handleSubcategoryChange = (newSubcategory: string) => {
      setSearchParams({ sub: newSubcategory });
    };

    const healthCategory = getCategoryBySlug(categories || [], currentCategory);
    const subcategories = healthCategory?.subcategories || [];
    
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {subcategories.slice(0, 5).map((sub) => (
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
        <Button
          variant="outline"
          onClick={() => navigate('/fitness/configure')}
          className="h-16 flex flex-col items-center gap-1 p-2"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-xs leading-tight text-center">
            Configure
          </span>
        </Button>
      </div>
    );
  },

  QuickStartWidget: () => {
    const [searchParams] = useSearchParams();
    const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d';
    const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247';
    
    const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
    
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
    );
  },

  QuickActions: () => {
    const [searchParams] = useSearchParams();
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const navigate = useNavigate();
    const { checkAndRedirect } = useFitnessProfileCheck();
    
    const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d';
    const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247';
    
    const actions = useDynamicQuickActions(currentCategory, currentSubcategory);

    const handleActionClick = (action: any) => {
      if (action.id.startsWith('fitness.')) {
        if (!checkAndRedirect('access this feature')) return;
      }
      
      if (action.id === 'fitness.start') {
        setShowTemplateDialog(true);
      } else if (action.onClickPath) {
        navigate(action.onClickPath);
      } else if (action.onClick) {
        action.onClick();
      }
    };

    if (actions.length === 0) return null;

    return (
      <>
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
        
        <WorkoutSelectionModal 
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
        />
      </>
    );
  },

  OtherWidgets: () => {
    const [searchParams] = useSearchParams();
    const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d';
    const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247';
    
    const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
    
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
    );
  },

  EmptyState: () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { data: categories } = useLifeCategoriesWithSubcategories('en');
    
    const currentCategory = 'b54c368d-cd4f-4276-aa82-668da614e50d';
    const currentSubcategory = searchParams.get('sub') || 'e13d15c9-85a7-41ec-bd4b-232a69fcb247';
    
    const visibleWidgets = getWidgetsByCategory(currentCategory, currentSubcategory);
    
    const healthCategory = getCategoryBySlug(categories || [], currentCategory);
    const currentSub = healthCategory?.subcategories?.find(s => s.id === currentSubcategory);
    
    if (visibleWidgets.length > 0) return null;
    
    return (
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
  }
};

/** NUTRITION ADAPTER - Coming soon placeholder */
const NutritionAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Nutrition Dashboard</h1>
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
          Track your nutrition and eating habits.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button variant="default" className="h-16 flex flex-col items-center gap-1 p-2">
        <span className="text-lg">🍽️</span>
        <span className="text-xs leading-tight text-center">Meal Log</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">📊</span>
        <span className="text-xs leading-tight text-center">Stats</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">📖</span>
        <span className="text-xs leading-tight text-center">Recipes</span>
      </Button>
    </div>
  ),

  QuickStartWidget: () => <div></div>,

  QuickActions: () => <div></div>,

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Nutrition Best Practices"
      bullets={[
        "Log meals as you go; photos help accuracy.",
        "Center whole foods; limit ultra-processed items.",
        "Protein at each meal supports satiety.",
        "Favor high-fiber carbs and healthy fats.",
        "Review weekly averages; adjust one lever at a time."
      ]}
    />
  ),

  EmptyState: () => null
};

/** RELATIONSHIPS ADAPTER - Coming soon placeholder */
const RelationshipsAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Relationships Dashboard</h1>
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
          Nurture your relationships and social connections.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button variant="default" className="h-16 flex flex-col items-center gap-1 p-2">
        <span className="text-lg">👥</span>
        <span className="text-xs leading-tight text-center">Friends</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">👨‍👩‍👧‍👦</span>
        <span className="text-xs leading-tight text-center">Family</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">💕</span>
        <span className="text-xs leading-tight text-center">Love</span>
      </Button>
    </div>
  ),

  QuickStartWidget: () => <div></div>,

  QuickActions: () => <div></div>,

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Relationships Best Practices"
      bullets={[
        "Show up consistently; schedule small rituals.",
        "Active listening and quick repairs after missteps.",
        "Celebrate wins; support during setbacks.",
        "Assume people like you; reduce social anxiety.",
        "Time budget: friendships need calendar time."
      ]}
    />
  ),

  EmptyState: () => null
};

/** Sleep adapter - Coming soon placeholder */
const SleepAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Sleep Dashboard</h1>
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
          Track and optimize your sleep patterns.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Button variant="default" className="h-16 flex flex-col items-center gap-1 p-2">
        <span className="text-lg">🌙</span>
        <span className="text-xs leading-tight text-center">Overview</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">📊</span>
        <span className="text-xs leading-tight text-center">Log</span>
      </Button>
      <Button variant="outline" className="h-16 flex flex-col items-center gap-1 p-2 opacity-50 cursor-not-allowed" disabled>
        <span className="text-lg">⚙️</span>
        <span className="text-xs leading-tight text-center">Settings</span>
      </Button>
    </div>
  ),

  QuickStartWidget: () => <div></div>,

  QuickActions: () => <div></div>,

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Sleep Best Practices"
      bullets={[
        "Consistent sleep/wake time (even weekends).",
        "Wind-down routine; dim lights; no late screens.",
        "Cool, dark, quiet room; comfy bedding.",
        "Limit caffeine after mid-afternoon; alcohol near bed.",
        "Morning light & daily movement help rhythm."
      ]}
    />
  ),

  EmptyState: () => null
};

/** Map category keys to adapters */
export const adapters: Record<string, Adapter> = {
  "health.fitness": FitnessAdapter,
  "health.nutrition": NutritionAdapter,
  "health.sleep": SleepAdapter,
  "relationships": RelationshipsAdapter,
};