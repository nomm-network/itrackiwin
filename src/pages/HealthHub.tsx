import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLifeCategoriesWithSubcategories } from '@/hooks/useLifeCategories';
import { useActiveWorkout } from '@/features/workouts/hooks/useActiveWorkout';
import { Dumbbell, Apple, Moon, Stethoscope, Zap, Settings } from 'lucide-react';

const HealthHub: React.FC = () => {
  const { data: categories, isLoading } = useLifeCategoriesWithSubcategories('en');
  const { data: activeWorkout } = useActiveWorkout();

  // Health category icons
  const categoryIcons: Record<string, React.ComponentType<any>> = {
    'fitness': Dumbbell,
    'nutrition': Apple, 
    'sleep': Moon,
    'medical': Stethoscope,
    'energy': Zap,
    'configure': Settings
  };

  // Health categories to display
  const healthCategories = [
    { id: 'fitness', name: 'Fitness', path: '/app/dashboard?cat=health.fitness', color: 'bg-green-500' },
    { id: 'nutrition', name: 'Nutrition', path: '/nutrition', color: 'bg-orange-500' },
    { id: 'sleep', name: 'Sleep', path: '/sleep', color: 'bg-purple-500' },
    { id: 'medical', name: 'Medical', path: '/medical', color: 'bg-red-500' },
    { id: 'energy', name: 'Energy', path: '/energy', color: 'bg-yellow-500' },
    { id: 'configure', name: 'Configure', path: '/configure', color: 'bg-gray-500' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="text-center">Loading Health Hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Hub</h1>
          <p className="text-gray-400 text-sm">Track your progress across all areas of life.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Admin</Button>
          <Button variant="outline" size="sm">Explore All</Button>
        </div>
      </div>

      {/* Health Categories Grid */}
      <div className="grid grid-cols-3 gap-4">
        {healthCategories.map((category) => {
          const Icon = categoryIcons[category.id] || Settings;
          const isActive = category.id === 'fitness'; // Highlight fitness as active
          
          return (
            <Card key={category.id} className={`${isActive ? 'bg-green-500' : 'bg-card'} border-border`}>
              <CardContent className="p-4 text-center">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-auto p-0 flex flex-col items-center gap-2"
                >
                  <Link to={category.path}>
                    <Icon className={`h-8 w-8 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-foreground'}`}>
                      {category.name}
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Training Center */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-green-400 mb-4">Training Center</h2>
          
          {activeWorkout ? (
            <div className="space-y-4">
              <div className="text-gray-300">
                <span className="text-sm">Active workout • </span>
                <span className="text-sm">{activeWorkout.title || 'Quads, Back & Biceps'}</span>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  asChild
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Link to={`/app/workouts/${activeWorkout.id}`}>
                    Continue Workout
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  End
                </Button>
              </div>
              
              <div className="text-xs text-green-400">Debug: OK</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-300 text-sm">
                No active workout
              </div>
              
              <Button 
                asChild
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Link to="/app/workouts/start-quick">
                  Start Workout
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 flex items-center gap-2"
            >
              <Link to="/fitness/templates">
                <Dumbbell className="h-4 w-4" />
                <span>Templates</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="h-12 flex items-center gap-2"
            >
              <Link to="/fitness/history">
                <Zap className="h-4 w-4" />
                <span>History</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="h-12 flex items-center gap-2"
            >
              <Link to="/app/programs">
                <Settings className="h-4 w-4" />
                <span>Programs</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="h-12 flex items-center gap-2"
            >
              <Link to="/mentors">
                <Apple className="h-4 w-4" />
                <span>Mentors</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthHub;