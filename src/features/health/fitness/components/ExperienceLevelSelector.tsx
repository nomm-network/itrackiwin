import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ExperienceLevel {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  {
    id: 'new',
    name: 'New to Exercise',
    description: 'Just starting your fitness journey',
    badge: 'Beginner'
  },
  {
    id: 'returning',
    name: 'Returning',
    description: 'Getting back into fitness after a break',
    badge: 'Comeback'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Consistent training for several months',
    badge: 'Regular'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Years of training experience',
    badge: 'Expert'
  }
];

interface ExperienceLevelSelectorProps {
  value?: string;
  onChange: (level: string) => void;
  className?: string;
}

export const ExperienceLevelSelector = ({ 
  value, 
  onChange, 
  className = '' 
}: ExperienceLevelSelectorProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPERIENCE_LEVELS.map((level) => (
          <Card 
            key={level.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              value === level.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onChange(level.id)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{level.name}</h3>
                {level.badge && (
                  <Badge 
                    variant={value === level.id ? "default" : "outline"}
                    className="text-xs"
                  >
                    {level.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {level.description}
              </p>
              <div className="flex justify-end">
                <Button
                  variant={value === level.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(level.id);
                  }}
                >
                  {value === level.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};