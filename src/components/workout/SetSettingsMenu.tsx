import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Clock, Target, Zap } from 'lucide-react';

interface SetSettingsMenuProps {
  targetSets: number;
  onTargetSetsChange: (sets: number) => void;
  autoRestTimer: boolean;
  onAutoRestTimerChange: (enabled: boolean) => void;
  showTargets: boolean;
  onShowTargetsChange: (enabled: boolean) => void;
  quickAddMode: boolean;
  onQuickAddModeChange: (enabled: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SetSettingsMenu: React.FC<SetSettingsMenuProps> = ({
  targetSets,
  onTargetSetsChange,
  autoRestTimer,
  onAutoRestTimerChange,
  showTargets,
  onShowTargetsChange,
  quickAddMode,
  onQuickAddModeChange,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Exercise Settings</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Set Settings Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Set Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Target Sets Input */}
            <div className="mb-6">
              <Label htmlFor="target-sets" className="text-sm text-gray-300 mb-2 block">
                Target Sets
              </Label>
              <Input
                id="target-sets"
                type="number"
                value={targetSets}
                onChange={(e) => onTargetSetsChange(Number(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4">
            {/* Auto-start rest timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Auto-start rest timer</span>
              </div>
              <Switch
                checked={autoRestTimer}
                onCheckedChange={onAutoRestTimerChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Show targets */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Show targets</span>
              </div>
              <Switch
                checked={showTargets}
                onCheckedChange={onShowTargetsChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Quick add mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Quick add mode</span>
              </div>
              <Switch
                checked={quickAddMode}
                onCheckedChange={onQuickAddModeChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};