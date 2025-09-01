import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHandleSelector } from '@/features/workouts/hooks/useHandleSelector';
import { useEquipmentHandles, pickEquipmentHandleName } from '@/hooks/useEquipmentHandles';
import { useEquipmentHandleGrips, pickEquipmentGripName } from '@/hooks/useEquipmentHandleGrips';
import { Loader2, Grip } from 'lucide-react';

interface HandleSelectorProps {
  exerciseId?: string;
  equipmentId?: string; // For new exercises
  selectedHandleId?: string;
  selectedGripIds?: string[];
  onHandleChange: (handleId: string | undefined) => void;
  onGripChange: (gripIds: string[]) => void;
  multiSelectGrips?: boolean;
}

interface HandleData {
  handle_id: string;
  handles: {
    id: string;
    slug: string;
    handles_translations?: Array<{
      language_code: string;
      name: string;
      description?: string;
    }>;
    translations?: Array<{
      language_code: string;
      name: string;
      description?: string;
    }>;
  };
}

interface GripData {
  grip_id: string;
  grips: {
    id: string;
    slug: string;
    grips_translations?: Array<{
      language_code: string;
      name: string;
      description?: string;
    }>;
  };
}

export function HandleGripSelector({
  exerciseId,
  equipmentId,
  selectedHandleId,
  selectedGripIds = [],
  onHandleChange,
  onGripChange,
  multiSelectGrips = true
}: HandleSelectorProps) {
  const [handles, setHandles] = useState<HandleData[]>([]);
  const [grips, setGrips] = useState<GripData[]>([]);
  
  // For existing exercises, use exercise-specific handles/grips
  const { getDefaultHandles, getDefaultGrips, isLoading: exerciseLoading } = useHandleSelector({ 
    exerciseId: exerciseId || '' 
  });
  
  // For new exercises, use equipment-based handles/grips
  const { data: equipmentHandles, isLoading: equipmentHandlesLoading } = useEquipmentHandles(equipmentId);
  const { data: equipmentGrips, isLoading: equipmentGripsLoading } = useEquipmentHandleGrips(
    equipmentId, 
    selectedHandleId
  );

  const isLoading = exerciseId 
    ? exerciseLoading 
    : (equipmentHandlesLoading || equipmentGripsLoading);

  // Load data based on context (existing exercise vs new exercise)
  useEffect(() => {
    const loadData = async () => {
      if (exerciseId) {
        // For existing exercises
        try {
          const [handlesData, gripsData] = await Promise.all([
            getDefaultHandles(),
            getDefaultGrips()
          ]);
          
          setHandles(handlesData as unknown as HandleData[]);
          setGrips(gripsData as unknown as GripData[]);
        } catch (error) {
          console.error('Failed to load exercise defaults:', error);
        }
      } else if (equipmentId && equipmentHandles) {
        // For new exercises, transform equipment handles to match expected format
        const transformedHandles = equipmentHandles.map(eh => ({
          handle_id: eh.handle_id,
          handles: {
            ...eh.handles,
            handles_translations: eh.handles.handles_translations
          }
        }));
        setHandles(transformedHandles);
        
        // Clear grips when handles change (will be refetched based on selected handle)
        if (!selectedHandleId) {
          setGrips([]);
        }
      }
    };

    loadData();
  }, [exerciseId, equipmentId, equipmentHandles, getDefaultHandles, getDefaultGrips, selectedHandleId]);

  // Update grips when equipment grips are available (for new exercises)
  useEffect(() => {
    if (!exerciseId && equipmentGrips) {
      const transformedGrips = equipmentGrips.map(eg => ({
        grip_id: eg.grip_id,
        grips: eg.grips
      }));
      setGrips(transformedGrips);
    }
  }, [exerciseId, equipmentGrips]);

  const getHandleName = (handle: HandleData['handles']) => {
    const translation = handle.handles_translations?.find(t => t.language_code === 'en') 
                       || handle.translations?.find(t => t.language_code === 'en')
                       || handle.handles_translations?.[0]
                       || handle.translations?.[0];
    return translation?.name || handle.slug.replace(/-/g, ' ');
  };

  const getGripName = (grip: GripData['grips']) => {
    const translation = grip.grips_translations?.find(t => t.language_code === 'en') 
                       || grip.grips_translations?.[0];
    return translation?.name || grip.slug.replace(/-/g, ' ');
  };

  const handleHandleSelect = (handleId: string) => {
    const newHandleId = selectedHandleId === handleId ? undefined : handleId;
    onHandleChange(newHandleId);
    
    // Clear grips when handle changes (for new exercises)
    if (!exerciseId) {
      onGripChange([]);
    }
  };

  const handleGripToggle = (gripId: string) => {
    if (multiSelectGrips) {
      const newGripIds = selectedGripIds.includes(gripId)
        ? selectedGripIds.filter(id => id !== gripId)
        : [...selectedGripIds, gripId];
      onGripChange(newGripIds);
    } else {
      onGripChange(selectedGripIds.includes(gripId) ? [] : [gripId]);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading handles & grips...</p>
        </CardContent>
      </Card>
    );
  }

  if (handles.length === 0 && grips.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Grip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {exerciseId 
              ? "No handles or grips configured for this exercise" 
              : "Select equipment first to see available handles and grips"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Handle & Grip Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Handles Section */}
        {handles.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">HANDLES</h4>
            <div className="flex flex-wrap gap-2">
              {handles.map((handleData) => (
                <Button
                  key={handleData.handles.id}
                  variant={selectedHandleId === handleData.handles.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleHandleSelect(handleData.handles.id)}
                  className="text-xs"
                >
                  {getHandleName(handleData.handles)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Separator if both handles and grips exist */}
        {handles.length > 0 && grips.length > 0 && <Separator />}

        {/* Grips Section - Only show for new exercises if handle is selected, or always for existing exercises */}
        {grips.length > 0 && (exerciseId || selectedHandleId) && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              GRIP ORIENTATION {multiSelectGrips && '(multi-select)'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {grips.map((gripData) => (
                <Button
                  key={gripData.grips.id}
                  variant={selectedGripIds.includes(gripData.grips.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGripToggle(gripData.grips.id)}
                  className="text-xs"
                >
                  {getGripName(gripData.grips)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Hint for new exercises */}
        {!exerciseId && selectedHandleId && grips.length === 0 && !equipmentGripsLoading && (
          <div className="text-xs text-muted-foreground text-center py-2">
            No grip options available for the selected handle
          </div>
        )}

        {/* Selected Items Summary */}
        {(selectedHandleId || selectedGripIds.length > 0) && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">SELECTED</h4>
              <div className="flex flex-wrap gap-1">
                {selectedHandleId && (
                  <Badge variant="default" className="text-xs">
                    {getHandleName(handles.find(h => h.handles.id === selectedHandleId)?.handles!)}
                  </Badge>
                )}
                {selectedGripIds.map(gripId => {
                  const grip = grips.find(g => g.grips.id === gripId)?.grips;
                  return grip ? (
                    <Badge key={gripId} variant="secondary" className="text-xs">
                      {getGripName(grip)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}