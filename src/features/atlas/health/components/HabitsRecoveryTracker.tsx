import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Droplets, Pill, Wind, Moon } from "lucide-react";
import { useState } from "react";

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  completed: boolean;
}

export function HabitsRecoveryTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Water intake (2L)", icon: <Droplets className="w-4 h-4" />, completed: false },
    { id: "2", name: "Took vitamins", icon: <Pill className="w-4 h-4" />, completed: false },
    { id: "3", name: "Breathing session", icon: <Wind className="w-4 h-4" />, completed: false },
    { id: "4", name: "Sleep logged", icon: <Moon className="w-4 h-4" />, completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const completedCount = habits.filter(h => h.completed).length;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Daily Habits</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {habits.length} completed today
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Habit
        </Button>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={habit.completed}
              onCheckedChange={() => toggleHabit(habit.id)}
              className="flex-shrink-0"
            />
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                habit.completed ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {habit.icon}
              </div>
              <span className={habit.completed ? "line-through text-muted-foreground" : ""}>
                {habit.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
