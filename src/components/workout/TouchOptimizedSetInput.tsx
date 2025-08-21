import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TouchOptimizedSetInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  onComplete?: () => void;
  className?: string;
}

const TouchOptimizedSetInput: React.FC<TouchOptimizedSetInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  min = 0,
  max = 999,
  step = 1,
  label,
  suffix,
  onComplete,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleIncrement = () => {
    const currentValue = value || 0;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = value || 0;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue);
  };

  const handleInputSubmit = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else {
      setInputValue(value?.toString() || "");
    }
    setIsEditing(false);
    onComplete?.();
  };

  const handleInputCancel = () => {
    setInputValue(value?.toString() || "");
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    } else if (e.key === "Escape") {
      handleInputCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {label && <span className="text-sm font-medium min-w-0 shrink-0">{label}</span>}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            min={min}
            max={max}
            step={step}
            className="w-20 h-10 text-center border-0 bg-transparent focus-visible:ring-0"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleInputSubmit}
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleInputCancel}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {suffix && <span className="text-sm text-muted-foreground shrink-0">{suffix}</span>}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-sm font-medium min-w-0 shrink-0">{label}</span>}
      <div className="flex items-center bg-muted rounded-lg p-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDecrement}
          disabled={value !== null && value <= min}
          className="h-10 w-10 touch-manipulation"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <button
          onClick={() => {
            setIsEditing(true);
            setInputValue(value?.toString() || "");
          }}
          className="flex items-center justify-center min-w-[60px] h-10 px-3 text-center font-medium hover:bg-background rounded transition-colors touch-manipulation"
        >
          {value ?? placeholder}
        </button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={handleIncrement}
          disabled={value !== null && value >= max}
          className="h-10 w-10 touch-manipulation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {suffix && <span className="text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  );
};

export default TouchOptimizedSetInput;