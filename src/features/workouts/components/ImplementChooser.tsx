import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface ImplementChooserProps {
  exerciseId: string;
  supportedImplements: ('barbell' | 'dumbbell' | 'machine')[];
  selectedImplement?: string;
  onImplementChange: (implement: string) => void;
  className?: string;
}

export function ImplementChooser({
  exerciseId,
  supportedImplements,
  selectedImplement,
  onImplementChange,
  className
}: ImplementChooserProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (supportedImplements.length <= 1) {
    return null; // Don't show chooser if only one option
  }

  const implementLabels = {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    machine: 'Machine/Stack'
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Choose implement"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Choose Implement</h4>
          
          <RadioGroup
            value={selectedImplement}
            onValueChange={(value) => {
              onImplementChange(value);
              setIsOpen(false);
            }}
          >
            {supportedImplements.map((implement) => (
              <div key={implement} className="flex items-center space-x-2">
                <RadioGroupItem value={implement} id={implement} />
                <Label htmlFor={implement} className="text-sm">
                  {implementLabels[implement]}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Changes default for this exercise
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}