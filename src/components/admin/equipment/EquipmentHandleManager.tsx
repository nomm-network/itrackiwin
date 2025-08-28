import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings } from "lucide-react";
import { useHandles } from "@/hooks/useHandles";
import { toast } from "sonner";
import { AddDirectHandleDialog } from "./AddDirectHandleDialog";
import { AddHandleRuleDialog } from "./AddHandleRuleDialog";

interface EquipmentHandleManagerProps {
  equipmentId: string;
}

interface DirectHandle {
  handle_id: string;
  handle: {
    id: string;
    slug: string;
    translations: { language_code: string; name: string }[];
  };
}

interface HandleRule {
  id: string;
  handle_id: string;
  equipment_type: string | null;
  kind: string | null;
  load_type: string | null;
  load_medium: string | null;
  handle: {
    id: string;
    slug: string;
    translations: { language_code: string; name: string }[];
  };
}

export function EquipmentHandleManager({ equipmentId }: EquipmentHandleManagerProps) {
  const [showDirectDialog, setShowDirectDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch direct handle mappings
  const { data: directHandles = [], isLoading: directLoading } = useQuery({
    queryKey: ['equipment-direct-handles', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('handle_equipment')
        .select(`
          handle_id,
          handle:handles (
            id, slug,
            translations:handle_translations (language_code, name)
          )
        `)
        .eq('equipment_id', equipmentId);
      
      if (error) throw error;
      return data as DirectHandle[];
    }
  });

  // Fetch rule-based handle mappings that affect this equipment
  const { data: handleRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['equipment-handle-rules', equipmentId],
    queryFn: async () => {
      // First get equipment details
      const { data: equipment } = await supabase
        .from('equipment')
        .select('equipment_type, kind, load_type, load_medium')
        .eq('id', equipmentId)
        .single();

      if (!equipment) return [];

      // Then find rules that match this equipment
      const { data, error } = await supabase
        .from('handle_equipment_rules')
        .select(`
          id, handle_id, equipment_type, kind, load_type, load_medium,
          handle:handles (
            id, slug,
            translations:handle_translations (language_code, name)
          )
        `)
        .or(
          `equipment_type.is.null,equipment_type.eq.${equipment.equipment_type || 'null'}`
        );

      if (error) throw error;

      // Filter rules that match this equipment
      return (data as HandleRule[]).filter(rule => {
        return (
          (!rule.equipment_type || rule.equipment_type === equipment.equipment_type) &&
          (!rule.kind || rule.kind === equipment.kind) &&
          (!rule.load_type || rule.load_type === equipment.load_type) &&
          (!rule.load_medium || rule.load_medium === equipment.load_medium)
        );
      });
    }
  });

  const removeDirectHandle = useMutation({
    mutationFn: async (handleId: string) => {
      const { error } = await supabase
        .from('handle_equipment')
        .delete()
        .eq('equipment_id', equipmentId)
        .eq('handle_id', handleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-direct-handles', equipmentId] });
      toast.success("Direct handle mapping removed");
    },
    onError: (error) => {
      toast.error("Failed to remove handle mapping: " + error.message);
    }
  });

  const getHandleName = (handle: any) => {
    return handle?.translations?.find((t: any) => t.language_code === 'en')?.name || 
           handle?.slug?.replace(/-/g, ' ') || 
           'Unknown Handle';
  };

  if (directLoading || rulesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Handle Relations
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
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Handle Relations
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDirectDialog(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Direct Mapping
          </Button>
          <Button
            onClick={() => setShowRuleDialog(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Direct Handle Mappings */}
        <div>
          <h4 className="font-medium mb-3">Direct Handle Mappings</h4>
          {directHandles.length > 0 ? (
            <div className="space-y-2">
              {directHandles.map((mapping) => (
                <div key={mapping.handle_id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Badge variant="default" className="mb-1">Direct</Badge>
                    <div className="font-medium">{getHandleName(mapping.handle)}</div>
                    <div className="text-sm text-muted-foreground">{mapping.handle.slug}</div>
                  </div>
                  <Button
                    onClick={() => removeDirectHandle.mutate(mapping.handle_id)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border rounded-md">
              No direct handle mappings
            </div>
          )}
        </div>

        {/* Rule-based Mappings */}
        <div>
          <h4 className="font-medium mb-3">Rule-based Mappings</h4>
          {handleRules.length > 0 ? (
            <div className="space-y-2">
              {handleRules.map((rule) => (
                <div key={rule.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Rule-based</Badge>
                    <div className="text-sm text-muted-foreground">
                      Global rule affects this equipment
                    </div>
                  </div>
                  <div className="font-medium">{getHandleName(rule.handle)}</div>
                  <div className="text-sm text-muted-foreground mb-2">{rule.handle.slug}</div>
                  <div className="flex flex-wrap gap-1">
                    {rule.equipment_type && (
                      <Badge variant="outline" className="text-xs">
                        Type: {rule.equipment_type}
                      </Badge>
                    )}
                    {rule.kind && (
                      <Badge variant="outline" className="text-xs">
                        Kind: {rule.kind}
                      </Badge>
                    )}
                    {rule.load_type && (
                      <Badge variant="outline" className="text-xs">
                        Load: {rule.load_type}
                      </Badge>
                    )}
                    {rule.load_medium && (
                      <Badge variant="outline" className="text-xs">
                        Medium: {rule.load_medium}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border rounded-md">
              No rule-based handle mappings apply to this equipment
            </div>
          )}
        </div>
      </CardContent>

      <AddDirectHandleDialog
        equipmentId={equipmentId}
        open={showDirectDialog}
        onOpenChange={setShowDirectDialog}
        existingHandleIds={directHandles.map(h => h.handle_id)}
      />

      <AddHandleRuleDialog
        open={showRuleDialog}
        onOpenChange={setShowRuleDialog}
      />
    </Card>
  );
}