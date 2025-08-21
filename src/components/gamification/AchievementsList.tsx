import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Users, Flame, TrendingUp } from "lucide-react";
import { useUserAchievements, useAchievements } from "@/hooks/useGamification";
import AchievementCard from "./AchievementCard";

const categoryIcons = {
  workout: Target,
  streak: Flame,
  social: Users,
  milestone: TrendingUp,
};

const AchievementsList = () => {
  const { data: userAchievements = [], isLoading: loadingUserAchievements } = useUserAchievements();
  const { data: allAchievements = [], isLoading: loadingAllAchievements } = useAchievements();
  const [activeTab, setActiveTab] = useState("earned");

  const earnedAchievements = userAchievements.map(ua => ({
    ...ua.achievement,
    earned_at: ua.earned_at
  }));

  const earnedIds = new Set(earnedAchievements.map(a => a.id));
  const availableAchievements = allAchievements.filter(a => !earnedIds.has(a.id));

  const groupByCategory = (achievements: any[]) => {
    return achievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    }, {} as Record<string, any[]>);
  };

  if (loadingUserAchievements || loadingAllAchievements) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedByCategory = groupByCategory(earnedAchievements);
  const availableByCategory = groupByCategory(availableAchievements);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Achievements
          <Badge variant="secondary" className="ml-auto">
            {earnedAchievements.length} / {allAchievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">
              Earned ({earnedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableAchievements.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="mt-4">
            {earnedAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No achievements earned yet</p>
                <p className="text-sm">Complete workouts to start earning!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(earnedByCategory).map(([category, achievements]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Target;
                  const achievementList = achievements as any[];
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="font-medium capitalize">{category}</h3>
                        <Badge variant="outline" className="text-xs">
                          {achievementList.length}
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {achievementList.map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isEarned={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="mt-4">
            {availableAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>All achievements earned!</p>
                <p className="text-sm">You're a champion! 🏆</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(availableByCategory).map(([category, achievements]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Target;
                  const achievementList = achievements as any[];
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium capitalize text-muted-foreground">{category}</h3>
                        <Badge variant="outline" className="text-xs">
                          {achievementList.length}
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {achievementList.map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isEarned={false}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AchievementsList;