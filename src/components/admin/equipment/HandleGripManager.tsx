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
  const queryClient = useQueryClient();

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

  const toggleAllowed = useMutation({
    mutationFn: async ({ gripId, allowed }: { gripId: string; allowed: boolean }) => {
      if (allowed) {
        // Add grip
        const { error } = await supabase
          .from('equipment_handle_grips')
          .insert({
            equipment_id: equipmentId,
            handle_id: handleId,
            grip_id: gripId,
            is_default: false
          });
        if (error) throw error;
      } else {
        // Remove grip
        const { error } = await supabase
          .from('equipment_handle_grips')
          .delete()
          .eq('equipment_id', equipmentId)
          .eq('handle_id', handleId)
          .eq('grip_id', gripId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-grips', equipmentId, handleId] });
    },
    onError: (error) => {
      toast.error("Failed to update grip: " + error.message);
    }
  });

  const toggleDefault = useMutation({
    mutationFn: async ({ gripId, isDefault }: { gripId: string; isDefault: boolean }) => {
      // First, clear all defaults for this handle
      if (isDefault) {
        await supabase
          .from('equipment_handle_grips')
          .update({ is_default: false })
          .eq('equipment_id', equipmentId)
          .eq('handle_id', handleId);
      }

      // Then set the new default
      const { error } = await supabase
        .from('equipment_handle_grips')
        .update({ is_default: isDefault })
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId)
        .eq('grip_id', gripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-grips', equipmentId, handleId] });
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

  const isGripAllowed = (gripId: string) => {
    return handleGrips.some(hg => hg.grip_id === gripId);
  };

  const getHandleGrip = (gripId: string) => {
    return handleGrips.find(hg => hg.grip_id === gripId);
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
      <CardContent>
        <div>
          <h4 className="font-medium mb-3">Grip Configuration</h4>
          <div className="space-y-3">
            {allGrips.map((grip) => {
              const isAllowed = isGripAllowed(grip.id);
              const handleGrip = getHandleGrip(grip.id);
              
              return (
                <div key={grip.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{getGripName(grip)}</div>
                      <div className="text-sm text-muted-foreground">
                        {grip.category} • {grip.slug}
                      </div>
                    </div>
                    {handleGrip?.is_default && (
                      <Badge variant="default" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`allowed-${grip.id}`} className="text-sm">
                        Allowed
                      </label>
                      <Switch
                        id={`allowed-${grip.id}`}
                        checked={isAllowed}
                        onCheckedChange={(checked) => 
                          toggleAllowed.mutate({ gripId: grip.id, allowed: checked })
                        }
                      />
                    </div>
                    {isAllowed && (
                      <div className="flex items-center gap-2">
                        <label htmlFor={`default-${grip.id}`} className="text-sm">
                          Make Default
                        </label>
                        <Switch
                          id={`default-${grip.id}`}
                          checked={handleGrip?.is_default || false}
                          onCheckedChange={(checked) => 
                            toggleDefault.mutate({ gripId: grip.id, isDefault: checked })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}