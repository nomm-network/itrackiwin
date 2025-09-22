import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormCoachingResponse {
  exerciseName: string;
  formCoaching: string;
  quickTips: string[];
  userLevel: string;
}

const FormCoach: React.FC = () => {
  const { toast } = useToast();
  const [exerciseName, setExerciseName] = useState("");
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [specificConcerns, setSpecificConcerns] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formCoaching, setFormCoaching] = useState<FormCoachingResponse | null>(null);

  const popularExercises = [
    "Squat", "Deadlift", "Bench Press", "Pull-up", "Push-up", "Overhead Press",
    "Barbell Row", "Plank", "Lunge", "Hip Thrust", "Bicep Curl", "Tricep Dip"
  ];

  const getFormCoaching = async () => {
    if (!exerciseName.trim()) {
      toast({
        title: "Exercise required",
        description: "Please select or enter an exercise name",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('form-coach', {
        body: {
          exerciseName: exerciseName.trim(),
          userLevel,
          specificConcerns: specificConcerns.trim() || undefined
        }
      });

      if (error) throw error;

      setFormCoaching(data);
      toast({
        title: "Form coaching ready!",
        description: `Detailed guidance for ${exerciseName}`,
      });
    } catch (error) {
      console.error('Form coaching error:', error);
      toast({
        title: "Unable to provide coaching",
        description: "Please try again or consult with a qualified trainer",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold">Form Coach</h1>
        </div>
        <p className="text-muted-foreground">
          Get expert form guidance for perfect exercise technique
        </p>
      </div>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Popular Exercises</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {popularExercises.map((exercise) => (
                <Button
                  key={exercise}
                  variant={exerciseName === exercise ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExerciseName(exercise)}
                  className="text-sm"
                >
                  {exercise}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Or enter custom exercise</label>
            <input
              type="text"
              placeholder="Enter exercise name..."
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Your Experience Level</label>
            <Select value={userLevel} onValueChange={(value: any) => setUserLevel(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Beginner</Badge>
                    <span className="text-sm">New to this exercise</span>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Intermediate</Badge>
                    <span className="text-sm">Some experience</span>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Advanced</Badge>
                    <span className="text-sm">Very experienced</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Specific Concerns (Optional)</label>
            <Textarea
              placeholder="e.g., I feel pain in my lower back, I can't feel my target muscles working, I'm not sure about my grip..."
              value={specificConcerns}
              onChange={(e) => setSpecificConcerns(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button 
            onClick={getFormCoaching}
            disabled={isAnalyzing || !exerciseName.trim()}
            className="w-full h-12"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing Form...</>
            ) : (
              <><Play className="h-4 w-4 mr-2" /> Get Form Coaching</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Form Coaching Results */}
      {formCoaching && (
        <>
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Quick Form Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formCoaching.quickTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-200">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Coaching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Detailed Form Coaching
                <Badge variant="outline">{formCoaching.userLevel}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {formCoaching.formCoaching}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Reminder */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Safety First
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    This AI coaching is for educational purposes. Always prioritize safety, start with light weights, 
                    and consider working with a qualified trainer, especially for complex movements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FormCoach;