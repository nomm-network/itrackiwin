import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyGym } from '../hooks/useMyGym.hook';

interface GymConstraintsFilterProps {
  onConstraintsChange?: (constraints: {
    availableEquipment: string[];
    availableGrips: string[];
  }) => void;
}

export function GymConstraintsFilter({ onConstraintsChange }: GymConstraintsFilterProps) {
  const { gym: userGym } = useMyGym();
  
  // Fetch gym equipment and grip constraints
  const { data: gymConstraints, isLoading } = useQuery({
    queryKey: ['gym-constraints', userGym?.id],
    queryFn: async () => {
      if (!userGym?.id) return null;
      
      // Get gym machines and their available grips
      // TODO: Fix after gym_machines table is properly defined
      const machines: any[] = [];
      const machinesError = null;
      /*
      const { data: machines, error: machinesError } = await supabase
        .from('gym_machines')
        .select(`
          id,
          equipment_id,
          equipment:equipment_id (
            id,
            slug
          ),
          gym_machine_grip_options (
            grip_id,
            is_available,
            grips (
              id,
              slug
            )
          )
        `)
        .eq('gym_id', userGym.id);
      */

      if (machinesError) throw machinesError;

      // Extract available equipment IDs
      const availableEquipment: string[] = [];
      
      // Extract available grip IDs  
      const availableGrips: string[] = [];

      return {
        availableEquipment: [...new Set(availableEquipment)], // Remove duplicates
        availableGrips: [...new Set(availableGrips)],
        machineCount: machines?.length || 0,
        gripOptionsCount: availableGrips.length
      };
    },
    enabled: !!userGym?.id
  });

  React.useEffect(() => {
    if (gymConstraints && onConstraintsChange) {
      onConstraintsChange({
        availableEquipment: gymConstraints.availableEquipment,
        availableGrips: gymConstraints.availableGrips
      });
    }
  }, [gymConstraints, onConstraintsChange]);

  if (!userGym) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            No gym selected. Choose your gym to filter exercises and grips by availability.
          </p>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Select Gym
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Loading gym constraints...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          {userGym.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Equipment Available</span>
          </div>
          <Badge variant="secondary">
            {gymConstraints?.machineCount || 0} machines
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Grip Options</span>
          </div>
          <Badge variant="secondary">
            {gymConstraints?.gripOptionsCount || 0} grips
          </Badge>
        </div>

        {(!gymConstraints?.machineCount || gymConstraints.machineCount === 0) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-700">
              <p className="font-medium">No equipment configured</p>
              <p>Exercise recommendations will show all options. Configure your gym equipment for better filtering.</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Exercises and alternatives are automatically filtered based on your gym's available equipment and grip options.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}