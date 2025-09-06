import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HabitItemProps {
  title: string;
  onComplete: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ title, onComplete }) => {
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-md border bg-card")}
      role="listitem">
      <span className="text-sm">{title}</span>
      <Button size="sm" onClick={onComplete} aria-label={`Complete habit ${title}`}>
        Complete
      </Button>
    </div>
  );
};

export default HabitItem;
