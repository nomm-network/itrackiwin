import { useEffect } from "react";
import { toast } from "sonner";
import { Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonalRecord {
  id: string;
  kind: string;
  value: number;
  unit?: string;
  exercise_id: string;
  achieved_at: string;
}

interface PRToastProps {
  personalRecord: PersonalRecord;
  exerciseName: string;
  workoutId?: string;
  onShare?: () => void;
}

export const showPRToast = ({ personalRecord, exerciseName, workoutId, onShare }: PRToastProps) => {
  const { kind, value, unit } = personalRecord;
  
  const formatValue = () => {
    if (kind === 'reps') return `${value} reps`;
    if (kind === 'heaviest') return `${value}${unit || 'kg'}`;
    if (kind === '1RM') return `${value}${unit || 'kg'} (est. 1RM)`;
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const message = `New ${kind === 'heaviest' ? 'Weight' : kind === '1RM' ? '1RM' : 'Rep'} PR!`;
  const description = `${exerciseName}: ${formatValue()}`;

  toast.success(message, {
    description,
    icon: <Trophy className="w-4 h-4 text-yellow-500" />,
    duration: 8000,
    action: onShare && workoutId ? {
      label: (
        <div className="flex items-center gap-1">
          <Share2 className="w-3 h-3" />
          Share
        </div>
      ),
      onClick: onShare
    } : undefined,
  });
};