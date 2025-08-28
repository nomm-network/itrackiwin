import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Grip } from "lucide-react";
import { toast } from "sonner";

interface HandleGripManagerProps {
  equipmentId: string;
  handleId: string;
  handleName: string;
  onClose: () => void;
}

interface HandleGrip {
  id: string;
  grip_id: string;
  is_default: boolean;
  grip: {
    id: string;
    slug: string;
    category: string;
    translations: { language_code: string; name: string }[];
  };
}

interface AvailableGrip {
  id: string;
  slug: string;
  category: string;
  translations: { language_code: string; name: string }[];
}

export function HandleGripManager({ equipmentId, handleId, handleName, onClose }: HandleGripManagerProps) {
  const [selectedGripIds, setSelectedGripIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch existing grips for this handle
  const { data: handleGrips = [], isLoading: gripsLoading } = useQuery({
    queryKey: ['equipment-handle-grips', equipmentId, handleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_handle_grips')
        .select(`
          id,
          grip_id,
          is_default,
          grip:grips (
            id, slug, category,
            translations:grips_translations (language_code, name)
          )
        `)
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId);
      
      if (error) throw error;
      return data as any;
    }
  });

  // Fetch all available grips
  const { data: allGrips = [], isLoading: allGripsLoading } = useQuery({
    queryKey: ['all-grips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grips')
        .select(`
          id, slug, category,
          translations:grips_translations (language_code, name)
        `)
        .order('category, slug');
      
      if (error) throw error;
      return data as any;
    }
  });

  const existingGripIds = handleGrips.map(hg => hg.grip_id);
  const availableGrips = allGrips.filter(g => !existingGripIds.includes(g.id));

  const addGrips = useMutation({
    mutationFn: async (gripIds: string[]) => {
      const mappings = gripIds.map(gripId => ({
        equipment_id: equipmentId,
        handle_id: handleId,
        grip_id: gripId,
        is_default: false
      }));

      const { error } = await supabase
        .from('equipment_handle_grips')
        .insert(mappings);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-grips', equipmentId, handleId] });
      toast.success(`Added ${selectedGripIds.length} grip(s) to ${handleName}`);
      setSelectedGripIds([]);
    },
    onError: (error) => {
      toast.error("Failed to add grips: " + error.message);
    }
  });

  const removeGrip = useMutation({
    mutationFn: async (gripId: string) => {
      const { error } = await supabase
        .from('equipment_handle_grips')
        .delete()
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId)
        .eq('grip_id', gripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-grips', equipmentId, handleId] });
      toast.success("Grip removed");
    },
    onError: (error) => {
      toast.error("Failed to remove grip: " + error.message);
    }
  });

  const toggleDefault = useMutation({
    mutationFn: async ({ id, isDefault }: { id: string; isDefault: boolean }) => {
      const { error } = await supabase
        .from('equipment_handle_grips')
        .update({ is_default: isDefault })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-grips', equipmentId, handleId] });
      toast.success("Default setting updated");
    },
    onError: (error) => {
      toast.error("Failed to update default: " + error.message);
    }
  });

  const getGripName = (grip: any) => {
    return grip?.translations?.find((t: any) => t.language_code === 'en')?.name || 
           grip?.slug?.replace(/-/g, ' ') || 
           'Unknown Grip';
  };

  const toggleGripSelection = (gripId: string) => {
    setSelectedGripIds(prev => 
      prev.includes(gripId)
        ? prev.filter(id => id !== gripId)
        : [...prev, gripId]
    );
  };

  const handleAddGrips = () => {
    if (selectedGripIds.length > 0) {
      addGrips.mutate(selectedGripIds);
    }
  };

  if (gripsLoading || allGripsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grip className="h-5 w-5" />
            Grip Configuration: {handleName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grip className="h-5 w-5" />
            Grip Configuration: {handleName}
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Grips */}
        <div>
          <h4 className="font-medium mb-3">Current Grips</h4>
          {handleGrips.length > 0 ? (
            <div className="space-y-2">
              {handleGrips.map((handleGrip) => (
                <div key={handleGrip.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{getGripName(handleGrip.grip)}</div>
                      <div className="text-sm text-muted-foreground">
                        {handleGrip.grip.category} • {handleGrip.grip.slug}
                      </div>
                    </div>
                    {handleGrip.is_default && (
                      <Badge variant="default" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`default-${handleGrip.id}`} className="text-sm">
                        Default
                      </label>
                      <Switch
                        id={`default-${handleGrip.id}`}
                        checked={handleGrip.is_default}
                        onCheckedChange={(checked) => 
                          toggleDefault.mutate({ id: handleGrip.id, isDefault: checked })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => removeGrip.mutate(handleGrip.grip_id)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border rounded-md">
              No grips configured for this handle
            </div>
          )}
        </div>

        {/* Add New Grips */}
        {availableGrips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Add Grips</h4>
              {selectedGripIds.length > 0 && (
                <Button 
                  onClick={handleAddGrips}
                  size="sm"
                  disabled={addGrips.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add {selectedGripIds.length} Grip(s)
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="space-y-2">
                {availableGrips.map((grip) => (
                  <div
                    key={grip.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedGripIds.includes(grip.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleGripSelection(grip.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{getGripName(grip)}</div>
                        <div className="text-sm text-muted-foreground">
                          {grip.category} • {grip.slug}
                        </div>
                      </div>
                      {selectedGripIds.includes(grip.id) && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {selectedGripIds.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {selectedGripIds.length} grip(s) selected
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}