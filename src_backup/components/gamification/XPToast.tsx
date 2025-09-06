import { useEffect } from "react";
import { toast } from "sonner";
import { Zap, Trophy } from "lucide-react";

interface XPToastProps {
  xpGained: number;
  reason: string;
  achievement?: {
    title: string;
    icon: string;
    points: number;
  };
}

export const showXPToast = ({ xpGained, reason, achievement }: XPToastProps) => {
  // Show XP gain toast
  toast.success(`+${xpGained} XP`, {
    description: reason,
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    duration: 3000,
  });

  // Show achievement toast if earned
  if (achievement) {
    setTimeout(() => {
      toast.success(`Achievement Unlocked!`, {
        description: `${achievement.icon} ${achievement.title} (+${achievement.points} XP)`,
        icon: <Trophy className="w-4 h-4 text-yellow-500" />,
        duration: 5000,
      });
    }, 1000);
  }
};