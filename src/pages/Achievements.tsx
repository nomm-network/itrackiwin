import { useUserStats } from "@/hooks/useGamification";
import LevelProgress from "@/components/gamification/LevelProgress";
import StreakCounter from "@/components/gamification/StreakCounter";
import AchievementsList from "@/components/gamification/AchievementsList";

const Achievements = () => {
  const { data: userStats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Achievements & Progress
          </h1>
          <p className="text-muted-foreground">
            Track your fitness journey and unlock achievements
          </p>
        </div>

        {userStats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LevelProgress
              level={userStats.current_level}
              xp={userStats.total_xp}
              className="md:col-span-2 lg:col-span-2"
            />
            
            <StreakCounter
              currentStreak={userStats.workout_streak}
              longestStreak={userStats.longest_streak}
            />
          </div>
        )}

        <AchievementsList />
      </div>
    </div>
  );
};

export default Achievements;