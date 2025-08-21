import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";
import { calculateLevelProgress } from "@/hooks/useGamification";

interface LevelProgressProps {
  level: number;
  xp: number;
  className?: string;
}

const LevelProgress = ({ level, xp, className = "" }: LevelProgressProps) => {
  const progress = calculateLevelProgress(xp, level);

  return (
    <Card className={`bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-primary" />
          Level {level}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">XP Progress</span>
          <span className="font-medium">
            {progress.current.toLocaleString()} / {progress.needed.toLocaleString()}
          </span>
        </div>
        
        <Progress 
          value={progress.percentage} 
          className="h-3"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              {xp.toLocaleString()} Total XP
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {Math.round(progress.percentage)}% to Level {level + 1}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgress;