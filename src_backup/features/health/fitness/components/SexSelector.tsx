import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Users, UserX } from 'lucide-react';
import { SexType } from '../hooks/useFitnessProfile.hook';

interface SexOption {
  id: SexType;
  name: string;
  icon: JSX.Element;
  description: string;
}

const SEX_OPTIONS: SexOption[] = [
  {
    id: 'male',
    name: 'Male',
    icon: <User className="h-4 w-4" />,
    description: 'Typically higher muscle mass, lower body fat percentage'
  },
  {
    id: 'female',
    name: 'Female', 
    icon: <User className="h-4 w-4" />,
    description: 'Often benefits from higher glute/lower body emphasis'
  },
  {
    id: 'other',
    name: 'Other',
    icon: <Users className="h-4 w-4" />,
    description: 'Individualized approach based on personal preferences'
  },
  {
    id: 'prefer_not_to_say',
    name: 'Prefer not to say',
    icon: <UserX className="h-4 w-4" />,
    description: 'General approach without sex-specific adjustments'
  }
];

interface SexSelectorProps {
  value?: SexType;
  onChange: (sex: SexType) => void;
  className?: string;
}

export const SexSelector = ({ 
  value, 
  onChange, 
  className = '' 
}: SexSelectorProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SEX_OPTIONS.map((option) => (
          <Card 
            key={option.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              value === option.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onChange(option.id)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <h3 className="font-medium text-sm">{option.name}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {option.description}
              </p>
              <div className="flex justify-end">
                <Button
                  variant={value === option.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.id);
                  }}
                >
                  {value === option.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};