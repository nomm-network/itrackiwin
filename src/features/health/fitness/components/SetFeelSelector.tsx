import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSaveSetFeel } from "../hooks/useRecalibration.hook";
import { useState } from "react";

interface SetFeelSelectorProps {
  setId: string;
  currentFeel?: string;
  onFeelChange?: (feel: string) => void;
}

const FEEL_OPTIONS = [
  { value: '--', label: 'Very Hard', color: 'bg-red-500 hover:bg-red-600', emoji: '😵' },
  { value: '-', label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', emoji: '😤' },
  { value: '=', label: 'Just Right', color: 'bg-yellow-500 hover:bg-yellow-600', emoji: '😐' },
  { value: '+', label: 'Easy', color: 'bg-green-500 hover:bg-green-600', emoji: '😊' },
  { value: '++', label: 'Very Easy', color: 'bg-blue-500 hover:bg-blue-600', emoji: '😄' },
];

export const SetFeelSelector = ({ setId, currentFeel, onFeelChange }: SetFeelSelectorProps) => {
  const [selectedFeel, setSelectedFeel] = useState<string | null>(currentFeel || null);
  const saveSetFeel = useSaveSetFeel();

  const handleFeelSelect = async (feel: string) => {
    setSelectedFeel(feel);
    onFeelChange?.(feel);
    
    try {
      await saveSetFeel.mutateAsync({ setId, feel: feel as any });
    } catch (error) {
      console.error('Failed to save set feel:', error);
      setSelectedFeel(currentFeel || null);
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-center">How did that set feel?</h4>
          
          <div className="grid grid-cols-5 gap-2">
            {FEEL_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedFeel === option.value ? "default" : "outline"}
                size="sm"
                className={`
                  flex flex-col items-center p-2 h-auto
                  ${selectedFeel === option.value ? option.color + ' text-white' : ''}
                `}
                onClick={() => handleFeelSelect(option.value)}
                disabled={saveSetFeel.isPending}
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-xs mt-1">{option.value}</span>
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {selectedFeel 
                ? FEEL_OPTIONS.find(opt => opt.value === selectedFeel)?.label
                : 'Select how the set felt'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};