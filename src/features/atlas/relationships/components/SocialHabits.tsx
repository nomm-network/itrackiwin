import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const habits = [
  { id: "text", label: "Text a loved one", completed: true },
  { id: "call", label: "Weekly call or meetup", completed: false },
  { id: "gratitude", label: "Practice gratitude", completed: true },
];

export function SocialHabits() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Social Habits</h2>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox id={habit.id} checked={habit.completed} />
            <label 
              htmlFor={habit.id}
              className={`flex-1 text-sm cursor-pointer ${habit.completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {habit.label}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
