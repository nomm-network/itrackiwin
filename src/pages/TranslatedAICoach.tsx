import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  MessageCircle,
  Lightbulb,
  Activity
} from 'lucide-react';
import { useAppTranslation, useEnumDisplay } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';

interface CoachInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'achievement' | 'analysis';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
}

interface ProgressMetrics {
  totalWorkouts: number;
  weeklyStreak: number;
  strongestLift: { exercise: string; weight: number; unit: string };
  volumeProgression: number;
  consistencyScore: number;
}

interface FormCoachData {
  exerciseId: string;
  exerciseName: string;
  commonMistakes: string[];
  suggestions: string[];
  difficulty: string;
  safetyTips: string[];
}

const TranslatedAICoachPage: React.FC = () => {
  const { t, tSync, batchTranslate, currentLanguage } = useAppTranslation();
  const { enumDisplaySync } = useEnumDisplay();
  
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [formCoachData, setFormCoachData] = useState<FormCoachData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load translations for AI Coach page
  useEffect(() => {
    const loadTranslations = async () => {
      const keys = [
        // Page structure
        'ai_coach.title',
        'ai_coach.subtitle',
        'ai_coach.tabs.insights',
        'ai_coach.tabs.progress',
        'ai_coach.tabs.form_coach',
        'ai_coach.tabs.recommendations',
        
        // Insights section
        'ai_coach.insights.title',
        'ai_coach.insights.no_insights',
        'ai_coach.insights.generate_new',
        'ai_coach.insights.priority.high',
        'ai_coach.insights.priority.medium',
        'ai_coach.insights.priority.low',
        'ai_coach.insights.type.suggestion',
        'ai_coach.insights.type.warning',
        'ai_coach.insights.type.achievement',
        'ai_coach.insights.type.analysis',
        
        // Progress section
        'ai_coach.progress.title',
        'ai_coach.progress.total_workouts',
        'ai_coach.progress.weekly_streak',
        'ai_coach.progress.strongest_lift',
        'ai_coach.progress.volume_progression',
        'ai_coach.progress.consistency_score',
        'ai_coach.progress.last_7_days',
        'ai_coach.progress.improvement',
        'ai_coach.progress.decline',
        
        // Form coach section
        'ai_coach.form.title',
        'ai_coach.form.exercise_analysis',
        'ai_coach.form.common_mistakes',
        'ai_coach.form.suggestions',
        'ai_coach.form.safety_tips',
        'ai_coach.form.difficulty',
        'ai_coach.form.no_data',
        'ai_coach.form.analyze_workout',
        
        // Recommendations section
        'ai_coach.recommendations.title',
        'ai_coach.recommendations.workout_plan',
        'ai_coach.recommendations.exercise_swaps',
        'ai_coach.recommendations.recovery',
        'ai_coach.recommendations.nutrition',
        'ai_coach.recommendations.load_more',
        
        // Common UI elements
        'common.loading',
        'common.error',
        'common.retry',
        'common.view_details',
        'common.dismiss',
        'common.mark_as_read',
        'common.export',
        'common.share',
        
        // Status and metrics
        'status.excellent',
        'status.good',
        'status.fair',
        'status.needs_improvement',
        'metrics.percentage',
        'metrics.days',
        'metrics.workouts',
        'metrics.kg',
        'metrics.lb',
        
        // Time periods
        'time.today',
        'time.yesterday',
        'time.this_week',
        'time.last_week',
        'time.this_month',
        'time.last_month',
        
        // Messages
        'messages.insights_loaded',
        'messages.progress_updated',
        'messages.form_analysis_complete',
        'messages.error_loading_insights',
        'messages.error_generating_insights'
      ];
      
      const loadedTranslations = await batchTranslate(keys);
      setTranslations(loadedTranslations);
    };

    loadTranslations();
  }, [batchTranslate, currentLanguage]);

  // Load AI coach data
  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadInsights(),
        loadProgressMetrics(),
        loadFormCoachData()
      ]);
    } catch (error) {
      console.error('Error loading coach data:', error);
      toast.error(translations['messages.error_loading_insights'] || 'Error loading AI coach data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'get_insights' }
      });

      if (error) throw error;

      // Transform API response to match our interface
      const transformedInsights: CoachInsight[] = data?.insights?.map((insight: any) => ({
        id: insight.id || Math.random().toString(),
        type: insight.type || 'suggestion',
        title: insight.title || '',
        message: insight.message || '',
        priority: insight.priority || 'medium',
        category: insight.category || 'general',
        created_at: insight.created_at || new Date().toISOString()
      })) || [];

      setInsights(transformedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights([]);
    }
  };

  const loadProgressMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('progress-insights', {
        body: { action: 'get_metrics' }
      });

      if (error) throw error;

      setProgressMetrics(data?.metrics || null);
    } catch (error) {
      console.error('Error loading progress metrics:', error);
      setProgressMetrics(null);
    }
  };

  const loadFormCoachData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('form-coach', {
        body: { action: 'get_recent_analysis' }
      });

      if (error) throw error;

      setFormCoachData(data?.analyses || []);
    } catch (error) {
      console.error('Error loading form coach data:', error);
      setFormCoachData([]);
    }
  };

  const generateNewInsights = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'generate_insights' }
      });

      if (error) throw error;

      await loadInsights();
      toast.success(translations['messages.insights_loaded'] || 'New insights generated');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error(translations['messages.error_generating_insights'] || 'Error generating insights');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return 'destructive';
    if (type === 'achievement') return 'default';
    if (type === 'warning') return 'secondary';
    return 'outline';
  };

  const getPriorityDisplay = (priority: string) => {
    const priorityMap = {
      high: { label: translations['ai_coach.insights.priority.high'] || 'High', color: 'text-red-600' },
      medium: { label: translations['ai_coach.insights.priority.medium'] || 'Medium', color: 'text-yellow-600' },
      low: { label: translations['ai_coach.insights.priority.low'] || 'Low', color: 'text-green-600' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return translations['status.excellent'] || 'Excellent';
    if (score >= 75) return translations['status.good'] || 'Good';
    if (score >= 60) return translations['status.fair'] || 'Fair';
    return translations['status.needs_improvement'] || 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-fluid-s">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">
              {translations['common.loading'] || 'Loading AI Coach...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-fluid-s space-y-fluid-s pb-20">{/* Note: pb-safe-area-bottom was changed to pb-20 for consistent mobile spacing */}
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-fluid-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          {translations['ai_coach.title'] || 'AI Coach'}
        </h1>
        <p className="text-fluid-base text-muted-foreground">
          {translations['ai_coach.subtitle'] || 'Your personal AI fitness coach providing insights, analysis, and recommendations'}
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="text-fluid-sm">
            {translations['ai_coach.tabs.insights'] || 'Insights'}
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-fluid-sm">
            {translations['ai_coach.tabs.progress'] || 'Progress'}
          </TabsTrigger>
          <TabsTrigger value="form" className="text-fluid-sm">
            {translations['ai_coach.tabs.form_coach'] || 'Form'}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-fluid-sm">
            {translations['ai_coach.tabs.recommendations'] || 'Tips'}
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-fluid-s">
          <div className="flex items-center justify-between">
            <h2 className="text-fluid-xl font-semibold">
              {translations['ai_coach.insights.title'] || 'AI Insights'}
            </h2>
            <Button onClick={generateNewInsights} size="sm">
              <Zap className="h-4 w-4 mr-2" />
              {translations['ai_coach.insights.generate_new'] || 'Generate New'}
            </Button>
          </div>

          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">
                  {translations['ai_coach.insights.no_insights'] || 'No insights available'}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Complete some workouts to get personalized AI insights
                </p>
                <Button onClick={generateNewInsights}>
                  {translations['ai_coach.insights.generate_new'] || 'Generate Insights'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => {
                const priorityDisplay = getPriorityDisplay(insight.priority);
                return (
                  <Card key={insight.id}>
                    <CardContent className="p-fluid-s">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{insight.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={getInsightColor(insight.type, insight.priority)}>
                                {translations[`ai_coach.insights.type.${insight.type}`] || insight.type}
                              </Badge>
                              <span className={`text-xs font-medium ${priorityDisplay.color}`}>
                                {priorityDisplay.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{insight.category}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Progress Analysis Tab */}
        <TabsContent value="progress" className="space-y-fluid-s">
          <h2 className="text-fluid-xl font-semibold">
            {translations['ai_coach.progress.title'] || 'Progress Analysis'}
          </h2>

          {progressMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-s">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-fluid-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {translations['ai_coach.progress.total_workouts'] || 'Total Workouts'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-fluid-2xl font-bold">{progressMetrics.totalWorkouts}</div>
                  <p className="text-xs text-muted-foreground">
                    {translations['ai_coach.progress.last_7_days'] || 'Last 7 days'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-fluid-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {translations['ai_coach.progress.weekly_streak'] || 'Weekly Streak'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-fluid-2xl font-bold">{progressMetrics.weeklyStreak}</div>
                  <p className="text-xs text-muted-foreground">
                    {translations['metrics.days'] || 'days'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-fluid-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {translations['ai_coach.progress.strongest_lift'] || 'Strongest Lift'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-fluid-lg font-bold">
                    {progressMetrics.strongestLift.weight}{progressMetrics.strongestLift.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progressMetrics.strongestLift.exercise}
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-fluid-base">
                    {translations['ai_coach.progress.consistency_score'] || 'Consistency Score'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-fluid-2xl font-bold">{progressMetrics.consistencyScore}%</span>
                    <span className="text-sm text-muted-foreground">
                      {getScoreStatus(progressMetrics.consistencyScore)}
                    </span>
                  </div>
                  <Progress value={progressMetrics.consistencyScore} className="h-2" />
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>
                      {progressMetrics.volumeProgression > 0 
                        ? translations['ai_coach.progress.improvement'] || 'Improvement'
                        : translations['ai_coach.progress.decline'] || 'Needs attention'
                      }: {Math.abs(progressMetrics.volumeProgression)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete some workouts to see your progress analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Form Coach Tab */}
        <TabsContent value="form" className="space-y-fluid-s">
          <h2 className="text-fluid-xl font-semibold">
            {translations['ai_coach.form.title'] || 'Form Coach'}
          </h2>

          {formCoachData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">
                  {translations['ai_coach.form.no_data'] || 'No form analysis available'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete exercises to get form feedback and safety tips
                </p>
                <Button>
                  {translations['ai_coach.form.analyze_workout'] || 'Analyze Current Workout'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {formCoachData.map((analysis, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-fluid-base flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {analysis.exerciseName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {translations['ai_coach.form.difficulty'] || 'Difficulty'}: {enumDisplaySync('exercise_skill_level', analysis.difficulty).label}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium text-fluid-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        {translations['ai_coach.form.common_mistakes'] || 'Common Mistakes'}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.commonMistakes.map((mistake, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-fluid-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        {translations['ai_coach.form.suggestions'] || 'Suggestions'}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-fluid-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {translations['ai_coach.form.safety_tips'] || 'Safety Tips'}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.safetyTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-fluid-s">
          <h2 className="text-fluid-xl font-semibold">
            {translations['ai_coach.recommendations.title'] || 'Recommendations'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-s">
            <Card>
              <CardHeader>
                <CardTitle className="text-fluid-base">
                  {translations['ai_coach.recommendations.workout_plan'] || 'Workout Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Based on your progress, consider adjusting your training frequency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-fluid-base">
                  {translations['ai_coach.recommendations.recovery'] || 'Recovery'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your consistency is excellent. Focus on recovery between sessions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslatedAICoachPage;