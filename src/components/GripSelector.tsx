import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from '@/hooks/useTranslations';

interface Grip {
  id: string;
  category: string;
  slug: string;
  translations: Record<string, { name: string; description?: string }> | null;
}

interface GripSelectorProps {
  selectedGrips: string[];
  onGripsChange: (grips: string[]) => void;
  className?: string;
  defaultGrips?: string[];
  requireSelection?: boolean;
}

export const GripSelector: React.FC<GripSelectorProps> = ({
  selectedGrips,
  onGripsChange,
  className,
  defaultGrips = [],
  requireSelection = false,
}) => {
  const { getTranslatedName, getTranslatedDescription, currentLanguage } = useTranslations();
  
  // Fetch grips with translations from Supabase
  const { data: grips = [] } = useQuery({
    queryKey: ['grips'],
    queryFn: async () => {
      const { data: gripsData, error: gripsError } = await supabase
        .from('grips')
        .select('*')
        .order('category', { ascending: true });
      if (gripsError) throw gripsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('grips_translations')
        .select('*');
      if (translationsError) throw translationsError;

      // Combine grips with their translations
      return gripsData.map(grip => {
        const translations = translationsData
          .filter(t => t.grip_id === grip.id)
          .reduce((acc, t) => {
            acc[t.language_code] = {
              name: t.name,
              description: t.description
            };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return {
          ...grip,
          translations
        };
      });
    },
  });

  // Group grips by category
  const gripsByCategory = grips.reduce((acc, grip) => {
    if (!acc[grip.category]) {
      acc[grip.category] = [];
    }
    acc[grip.category].push(grip);
    return acc;
  }, {} as Record<string, Grip[]>);

  const handleGripToggle = (grip: Grip) => {
    const isSelected = selectedGrips.includes(grip.id);
    
    if (isSelected) {
      // Check if this is the last selected grip in its category and requireSelection is true
      if (requireSelection) {
        const categoryGrips = grips.filter(g => g.category === grip.category);
        const selectedInCategory = selectedGrips.filter(selectedId => {
          const selectedGrip = grips.find(g => g.id === selectedId);
          return selectedGrip?.category === grip.category;
        });
        
        // Don't allow removing if it's the last one in a required category
        if (selectedInCategory.length === 1) {
          return;
        }
      }
      
      // Remove the grip
      onGripsChange(selectedGrips.filter(id => id !== grip.id));
    } else {
      // Add the grip, but first remove any other grip from the same category
      const newGrips = selectedGrips.filter(selectedId => {
        const selectedGrip = grips.find(g => g.id === selectedId);
        return selectedGrip?.category !== grip.category;
      });
      onGripsChange([...newGrips, grip.id]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Preferred Grips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(gripsByCategory).map(([category, categoryGrips]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryGrips.map((grip) => (
                <div key={grip.id} className="flex items-center gap-2">
                  <Button
                    variant={selectedGrips.includes(grip.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGripToggle(grip)}
                    className="justify-start text-left flex-1"
                  >
                    {getTranslatedName(grip)}
                  </Button>
                  {getTranslatedDescription(grip) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{getTranslatedDescription(grip)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {selectedGrips.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Selected:</p>
            <div className="flex flex-wrap gap-1">
              {selectedGrips.map((gripId) => {
                const grip = grips.find(g => g.id === gripId);
                return grip ? (
                  <Badge key={gripId} variant="secondary" className="text-xs">
                    {getTranslatedName(grip)}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GripSelector;