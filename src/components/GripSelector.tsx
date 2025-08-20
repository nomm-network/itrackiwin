import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Grip {
  id: string;
  name: string;
  category: string;
  slug: string;
}

interface GripSelectorProps {
  selectedGrips: string[];
  onGripsChange: (grips: string[]) => void;
  className?: string;
}

const GripSelector: React.FC<GripSelectorProps> = ({ 
  selectedGrips, 
  onGripsChange,
  className 
}) => {
  const { data: grips = [] } = useQuery<Grip[]>({
    queryKey: ["grips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grips')
        .select('id, name, category, slug')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const groupedGrips = grips.reduce((acc, grip) => {
    if (!acc[grip.category]) {
      acc[grip.category] = [];
    }
    acc[grip.category].push(grip);
    return acc;
  }, {} as Record<string, Grip[]>);

  const handleGripToggle = (grip: Grip) => {
    const currentlySelected = selectedGrips.includes(grip.slug);
    
    if (currentlySelected) {
      // Remove grip
      onGripsChange(selectedGrips.filter(g => g !== grip.slug));
    } else {
      // Add grip, but remove any other grip from the same category
      const newGrips = selectedGrips.filter(selectedSlug => {
        const selectedGrip = grips.find(g => g.slug === selectedSlug);
        return selectedGrip?.category !== grip.category;
      });
      onGripsChange([...newGrips, grip.slug]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Preferred Grips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedGrips).map(([category, categoryGrips]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryGrips.map(grip => {
                const isSelected = selectedGrips.includes(grip.slug);
                return (
                  <Button
                    key={grip.id}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleGripToggle(grip)}
                    className="h-7 text-xs"
                  >
                    {grip.name}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
        
        {selectedGrips.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Selected:</p>
            <div className="flex flex-wrap gap-1">
              {selectedGrips.map(gripSlug => {
                const grip = grips.find(g => g.slug === gripSlug);
                return grip ? (
                  <Badge key={gripSlug} variant="secondary" className="text-xs">
                    {grip.name}
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