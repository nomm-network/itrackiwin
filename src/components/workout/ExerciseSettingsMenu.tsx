import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Target, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseSettingsMenuProps {
  autoRestTimer: boolean;
  onAutoRestTimerChange: (enabled: boolean) => void;
  showTargets: boolean;
  onShowTargetsChange: (enabled: boolean) => void;
  enableQuickAdd: boolean;
  onEnableQuickAddChange: (enabled: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ExerciseSettingsMenu: React.FC<ExerciseSettingsMenuProps> = ({
  autoRestTimer,
  onAutoRestTimerChange,
  showTargets,
  onShowTargetsChange,
  enableQuickAdd,
  onEnableQuickAddChange,
  isOpen,
  onClose,
  className
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Card className={cn("border-0 shadow-none bg-muted/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Set Settings</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Auto Rest Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="auto-rest" className="text-sm">Auto-start rest timer</Label>
            </div>
            <Switch
              id="auto-rest"
              checked={autoRestTimer}
              onCheckedChange={onAutoRestTimerChange}
            />
          </div>

          {/* Show Targets */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="show-targets" className="text-sm">Show targets</Label>
            </div>
            <Switch
              id="show-targets"
              checked={showTargets}
              onCheckedChange={onShowTargetsChange}
            />
          </div>

          {/* Quick Add Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="quick-add" className="text-sm">Quick add mode</Label>
            </div>
            <Switch
              id="quick-add"
              checked={enableQuickAdd}
              onCheckedChange={onEnableQuickAddChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseSettingsMenu;