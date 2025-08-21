import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, Calendar, Award, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  type: "1rm" | "volume" | "bodyweight" | "endurance";
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  priority: "low" | "medium" | "high";
  status: "active" | "achieved" | "missed";
  exercise?: string;
  notes?: string;
}

// Mock goals data - replace with real data from hooks
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Bench Press 2x Bodyweight",
    type: "1rm",
    targetValue: 160,
    currentValue: 112.5,
    unit: "kg",
    targetDate: "2024-12-31",
    priority: "high",
    status: "active",
    exercise: "Bench Press",
    notes: "Current bodyweight: 80kg"
  },
  {
    id: "2",
    title: "200kg Deadlift",
    type: "1rm",
    targetValue: 200,
    currentValue: 177.5,
    unit: "kg",
    targetDate: "2024-10-15",
    priority: "high",
    status: "active",
    exercise: "Deadlift"
  },
  {
    id: "3",
    title: "50 Total Sets per Week",
    type: "volume",
    targetValue: 50,
    currentValue: 42,
    unit: "sets",
    targetDate: "2024-09-30",
    priority: "medium",
    status: "active"
  },
  {
    id: "4",
    title: "100kg Bench Press",
    type: "1rm",
    targetValue: 100,
    currentValue: 100,
    unit: "kg",
    targetDate: "2024-08-01",
    priority: "medium",
    status: "achieved",
    exercise: "Bench Press"
  }
];

export const GoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved": return <Award className="h-4 w-4 text-green-600" />;
      case "active": return <Target className="h-4 w-4 text-blue-600" />;
      case "missed": return <Calendar className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const activeGoals = goals.filter(g => g.status === "active");
  const achievedGoals = goals.filter(g => g.status === "achieved");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Goal Tracking</h2>
          <p className="text-muted-foreground">
            Set and track your fitness milestones
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new fitness goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="e.g. 200kg Deadlift" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1rm">1RM Strength</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="bodyweight">Body Weight</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target Value</Label>
                  <Input id="target" type="number" placeholder="200" />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="kg" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="date">Target Date</Label>
                <Input id="date" type="date" />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Additional context..." rows={3} />
              </div>
              
              <div className="flex gap-3">
                <Button className="flex-1">Create Goal</Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{activeGoals.length}</div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{achievedGoals.length}</div>
                <div className="text-sm text-muted-foreground">Achieved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(activeGoals.reduce((acc, goal) => acc + getProgressPercentage(goal), 0) / activeGoals.length || 0)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Goals</CardTitle>
          <CardDescription>Goals you're currently working towards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.map(goal => {
            const progress = getProgressPercentage(goal);
            const daysLeft = getDaysUntilTarget(goal.targetDate);
            
            return (
              <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <h3 className="font-semibold">{goal.title}</h3>
                      <Badge className={getPriorityColor(goal.priority)} variant="secondary">
                        {goal.priority}
                      </Badge>
                    </div>
                    {goal.exercise && (
                      <div className="text-sm text-muted-foreground">
                        Exercise: {goal.exercise}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {goal.notes && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    {goal.notes}
                  </div>
                )}
              </div>
            );
          })}
          
          {activeGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active goals. Create your first goal to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Goals you've successfully completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievedGoals.slice(0, 3).map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-green-50 border-green-200 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Achieved {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Completed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};