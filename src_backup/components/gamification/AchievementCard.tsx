import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earned_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  isEarned?: boolean;
}

const AchievementCard = ({ achievement, isEarned = false }: AchievementCardProps) => {
  return (
    <Card 
      className={`transition-all duration-200 ${
        isEarned 
          ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' 
          : 'bg-muted/30 border-muted/40 opacity-70'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-2xl ${isEarned ? '' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-sm ${
                isEarned ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {achievement.title}
              </h3>
              {isEarned && (
                <Trophy className="w-4 h-4 text-primary" />
              )}
            </div>
            
            <p className={`text-xs ${
              isEarned ? 'text-muted-foreground' : 'text-muted-foreground/70'
            }`}>
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <Badge 
                variant={isEarned ? "default" : "outline"}
                className="text-xs"
              >
                {achievement.category}
              </Badge>
              
              <div className={`text-xs font-medium ${
                isEarned ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {achievement.points} XP
              </div>
            </div>
            
            {isEarned && achievement.earned_at && (
              <div className="text-xs text-muted-foreground mt-1">
                Earned {new Date(achievement.earned_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;