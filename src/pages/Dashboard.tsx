import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertTriangle } from 'lucide-react';
import { useLifeCategoriesWithSubcategories, getCategoryBySlug } from '@/hooks/useLifeCategories';
import { getWidgetsByCategory, useDynamicQuickActions } from '@/app/dashboard/registry';
import { useUserRole } from '@/hooks/useUserRole';
import WidgetSkeleton from '@/app/dashboard/components/WidgetSkeleton';
import EmptyCategory from '@/app/dashboard/components/EmptyCategory';
// import WorkoutSelectionModal from '@/components/fitness/WorkoutSelectionModal'; // TODO: Migrate this component
import { useFitnessProfileCheck } from '@/features/health/fitness/hooks/useFitnessProfileCheck.hook';
import { StartErrorBanner } from './Dashboard/StartErrorBanner';
import { supabase } from '@/integrations/supabase/client';


const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    readinessScore: number | null;
    multiplier: number | null;
    testWorkoutId: string | null;
    normalWorkoutError: string | null;
    normalWorkoutId: string | null;
    rawData: any;
    userInfo: any;
    error: string | null;
  }>({
    readinessScore: null,
    multiplier: null,
    testWorkoutId: null,
    normalWorkoutError: null,
    normalWorkoutId: null,
    rawData: null,
    userInfo: null,
    error: null
  });
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

  // Debug functions to test the readiness system
  const runDebugTests = async () => {
    try {
      setDebugInfo(prev => ({ 
        ...prev, 
        error: null, 
        normalWorkoutError: null,
        normalWorkoutId: null
      }));
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      
      // Test 1: Check readiness score
      const { data: scoreData, error: scoreError } = await supabase.rpc('compute_readiness_for_user', {
        p_user_id: user.id
      });
      
      if (scoreError) throw new Error(`Score error: ${scoreError.message}`);
      
      // Test 2: Check multiplier
      const { data: multiplierData, error: multiplierError } = await supabase.rpc('readiness_multiplier', {
        p_score: scoreData || 65
      });
      
      if (multiplierError) throw new Error(`Multiplier error: ${multiplierError.message}`);
      
      // Test 3: Try to start a workout with demo template (like the debug test)
      const { data: templateData } = await supabase
        .from('workout_templates')
        .select('id')
        .limit(1)
        .single();
      
      let testWorkoutId = null;
      if (templateData) {
        const { data: workoutData, error: workoutError } = await supabase.rpc('start_workout', {
          p_template_id: templateData.id
        });
        
        if (workoutError) throw new Error(`Test workout creation error: ${workoutError.message}`);
        testWorkoutId = workoutData;
        
        // Clean up test workout
        if (workoutData) {
          await supabase.rpc('end_workout', { p_workout_id: workoutData });
        }
      }
      
      // Test 4: Try the normal workout creation flow (without template like when clicking Start)
      let normalWorkoutId = null;
      let normalWorkoutError = null;
      try {
        const { data: normalWorkoutData, error: normalError } = await supabase.rpc('start_workout', {
          p_template_id: null  // This is what happens when clicking "Start Workout" without template
        });
        
        if (normalError) {
          normalWorkoutError = `Normal workout error: ${normalError.message}`;
        } else {
          normalWorkoutId = normalWorkoutData;
          // Clean up normal test workout
          if (normalWorkoutData) {
            await supabase.rpc('end_workout', { p_workout_id: normalWorkoutData });
          }
        }
      } catch (err) {
        normalWorkoutError = `Normal workout exception: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }
      
      setDebugInfo({
        readinessScore: scoreData,
        multiplier: multiplierData,
        testWorkoutId,
        normalWorkoutError,
        normalWorkoutId,
        rawData: {
          scoreData,
          multiplierData,
          testWorkoutId,
          normalWorkoutId,
          templateData: templateData?.id
        },
        userInfo: {
          userId: user.id,
          email: user.email
        },
        error: templateData ? null : 'No templates found for test'
      });
      
    } catch (err) {
      setDebugInfo(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    }
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
      {/* Error Banner for start workout failures */}
      <StartErrorBanner />
      
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
            {/* Configure button as 6th item */}
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
      
      {/* Debug Box - for troubleshooting workout creation issues */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">Debug Tools</h3>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={runDebugTests}
              variant="outline"
              className="w-full"
            >
              Test Readiness & Workout Creation
            </Button>
            
            {(debugInfo.readinessScore !== null || debugInfo.error) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Readiness Score:</div>
                    <div className="p-2 bg-white rounded border">
                      {debugInfo.readinessScore ?? debugInfo.rawData?.scoreData ?? 'N/A'} / 100
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Multiplier:</div>
                    <div className="p-2 bg-white rounded border">
                      {debugInfo.multiplier ?? debugInfo.rawData?.multiplierData ?? 'N/A'}x
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Test w/ Template:</div>
                    <div className="p-2 bg-white rounded border">
                      {(debugInfo.testWorkoutId || debugInfo.rawData?.testWorkoutId) ? '✅ Created' : '❌ Failed'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Normal Workout (no template):</div>
                    <div className="p-2 bg-white rounded border">
                      {(debugInfo.normalWorkoutId || debugInfo.rawData?.normalWorkoutId) ? '✅ Created' : '❌ Failed'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">Normal Workout ID:</div>
                    <div className="p-2 bg-white rounded border text-xs">
                      {debugInfo.normalWorkoutId || debugInfo.rawData?.normalWorkoutId || 'None'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800 mb-2">SQL Commands to Test:</div>
                  <pre className="text-xs text-yellow-700 overflow-auto whitespace-pre-wrap">{`-- Test readiness score calculation
SELECT compute_readiness_for_user('${debugInfo.userInfo?.userId}', now());

-- Test readiness multiplier
SELECT readiness_multiplier(69);

-- Test workout creation with template
SELECT start_workout('${debugInfo.rawData?.templateData}');

-- Test workout creation without template
SELECT start_workout(null);

-- Check if workouts were created
SELECT id, user_id, template_id, started_at, readiness_score 
FROM workouts 
WHERE user_id = '${debugInfo.userInfo?.userId}' 
ORDER BY started_at DESC 
LIMIT 5;`}</pre>
                </div>
              </div>
            )}
            
            {debugInfo.rawData && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-800 mb-2">Raw Data:</div>
                <pre className="text-xs text-blue-700 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.rawData, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.userInfo && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-800 mb-2">User Info:</div>
                <div className="text-sm text-green-700">
                  <div>User ID: {debugInfo.userInfo.userId}</div>
                  <div>Email: {debugInfo.userInfo.email}</div>
                </div>
              </div>
            )}
            
            {debugInfo.normalWorkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-medium text-red-800 mb-2">Normal Workout Error:</div>
                <div className="text-sm text-red-700 font-mono">{debugInfo.normalWorkoutError}</div>
              </div>
            )}
            
            {debugInfo.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-medium text-red-800 mb-2">General Error:</div>
                <div className="text-sm text-red-700 font-mono">{debugInfo.error}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* <WorkoutSelectionModal 
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      /> */}
    </div>
  );
};

export default Dashboard;