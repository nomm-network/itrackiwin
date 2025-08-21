import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

const StreakCounter = ({ currentStreak, longestStreak, className = "" }: StreakCounterProps) => {
  return (
    <Card className={`bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="w-5 h-5 text-orange-500" />
          Workout Streak
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500 mb-1">
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            Current Streak
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Best Streak</span>
          </div>
          <div className="text-sm font-medium">
            {longestStreak} days
          </div>
        </div>
        
        {currentStreak > 0 && (
          <div className="text-xs text-center text-muted-foreground">
            Keep it up! 🔥
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;