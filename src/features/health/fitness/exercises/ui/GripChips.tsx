import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GripChipsProps {
  grips: Array<{
    id: string;
    name: string;
  }>;
  selectedGripIds: string[];
  onToggleGrip: (gripId: string) => void;
}

export default function GripChips({ grips, selectedGripIds, onToggleGrip }: GripChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {grips.map((grip) => {
        const isSelected = selectedGripIds.includes(grip.id);
        return (
          <Badge
            key={grip.id}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggleGrip(grip.id)}
          >
            {grip.name}
            {isSelected && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGrip(grip.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        );
      })}
    </div>
  );
}