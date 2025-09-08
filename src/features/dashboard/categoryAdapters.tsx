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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Fitness Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-xs"
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
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress across all areas of life.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => {
    const [searchParams] = useSearchParams();
    const { data: categories } = useLifeCategoriesWithSubcategories('en');
    const categorySlug = searchParams.get("cat") ?? "health.fitness";
    const category = getCategoryBySlug(categories || [], categorySlug);
    const subcategories = category?.subcategories || [];

    if (subcategories.length === 0) return null;

    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            {subcategory.name}
          </Button>
        ))}
      </div>
    );
  },

  QuickStartWidget: () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasProfile } = useFitnessProfileCheck();

    if (!hasProfile) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Welcome to Fitness Tracking!</h3>
                <p className="text-sm text-muted-foreground">
                  Let's set up your fitness profile to get started.
                </p>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="w-full">
                Start First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Quick Start</h3>
              <p className="text-sm text-muted-foreground">
                Jump into your workout routine.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="w-full">
              Start Workout
            </Button>
            <WorkoutSelectionModal 
              open={isModalOpen} 
              onOpenChange={setIsModalOpen} 
            />
          </div>
        </CardContent>
      </Card>
    );
  },

  QuickActions: () => {
    const categorySlug = "health.fitness";
    const quickActions = useDynamicQuickActions(categorySlug);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <h4 className="font-medium">{action.label}</h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="w-full"
                >
                  {action.label}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },

  OtherWidgets: () => {
    const categorySlug = "health.fitness";
    const widgets = getWidgetsByCategory(categorySlug);

    if (widgets.length === 0) {
      return <EmptyCategory category={categorySlug} />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <React.Suspense key={widget.id} fallback={<WidgetSkeleton />}>
            <widget.Component />
          </React.Suspense>
        ))}
      </div>
    );
  },

  EmptyState: () => null
};

/** NUTRITION ADAPTER */
const NutritionAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Nutrition Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-xs"
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
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your nutrition and eating habits.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button variant="outline" size="sm" className="whitespace-nowrap">Meal Log</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Macro Stats</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Recipes</Button>
    </div>
  ),

  QuickStartWidget: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Quick Start</h3>
            <p className="text-sm text-muted-foreground">
              Log your first meal to get started.
            </p>
          </div>
          <Button className="w-full">Log Meal</Button>
        </div>
      </CardContent>
    </Card>
  ),

  QuickActions: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">Log Meal</h4>
            <Button variant="outline" size="sm" className="w-full">Add Food</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">View Stats</h4>
            <Button variant="outline" size="sm" className="w-full">Macro Stats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Nutrition · Best practices"
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

/** RELATIONSHIPS ADAPTER */
const RelationshipsAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Relationships Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-xs"
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
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Nurture your relationships and social connections.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button variant="outline" size="sm" className="whitespace-nowrap">Friends</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Family</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Love</Button>
    </div>
  ),

  QuickStartWidget: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Quick Start</h3>
            <p className="text-sm text-muted-foreground">
              Reach out to someone special today.
            </p>
          </div>
          <Button className="w-full">Send Message</Button>
        </div>
      </CardContent>
    </Card>
  ),

  QuickActions: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">Check In</h4>
            <Button variant="outline" size="sm" className="w-full">Message Friend</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">Plan Time</h4>
            <Button variant="outline" size="sm" className="w-full">Schedule Hangout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Relationships · Best practices"
      bullets={[
        "Show up consistently; regular contact predicts friendship strength.",
        "Assume people like you; reduce social anxiety.",
        "Schedule standing rituals; habits beat intentions.",
        "Practice active listening and quick repairs.",
        "Periodically audit your calendar — friendships need time."
      ]}
    />
  ),

  EmptyState: () => null
};

/** SLEEP ADAPTER */
const SleepAdapter: Adapter = {
  Header: () => {
    const { isSuperAdmin } = useUserRole();
    const navigate = useNavigate();

    return (
      <div className="space-y-1 sm:space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Sleep Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-xs"
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
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track and optimize your sleep patterns.
        </p>
      </div>
    );
  },

  SubcategoryNav: () => (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button variant="outline" size="sm" className="whitespace-nowrap">Overview</Button>
      <Button variant="outline" size="sm" className="whitespace-nowrap">Sleep Log</Button>
    </div>
  ),

  QuickStartWidget: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Quick Start</h3>
            <p className="text-sm text-muted-foreground">
              Log your sleep from last night.
            </p>
          </div>
          <Button className="w-full">Log Sleep</Button>
        </div>
      </CardContent>
    </Card>
  ),

  QuickActions: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">Log Sleep</h4>
            <Button variant="outline" size="sm" className="w-full">Add Entry</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium">View Trends</h4>
            <Button variant="outline" size="sm" className="w-full">Sleep Stats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  OtherWidgets: () => (
    <UnderConstructionCard
      title="Sleep · Best practices"
      bullets={[
        "Consistent sleep/wake time; even weekends.",
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