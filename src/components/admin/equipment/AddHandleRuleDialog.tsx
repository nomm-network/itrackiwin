import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHandles } from "@/hooks/useHandles";
import { toast } from "sonner";

interface AddHandleRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHandleRuleDialog({ open, onOpenChange }: AddHandleRuleDialogProps) {
  const [selectedHandleId, setSelectedHandleId] = useState<string>("");
  const [equipmentType, setEquipmentType] = useState<string>("");
  const [kind, setKind] = useState<string>("");
  const [loadType, setLoadType] = useState<string>("");
  const [loadMedium, setLoadMedium] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { data: handles = [] } = useHandles();

  const equipmentTypes = ['machine', 'free_weight', 'support', 'cardio', 'bodyweight'];
  const kinds = ['cable', 'pulldown', 'row', 'press', 'bench', 'barbell'];
  const loadTypes = ['none', 'single_load', 'dual_load', 'stack'];
  const loadMediums = ['bar', 'plates', 'stack', 'bodyweight', 'band', 'chain', 'flywheel', 'other'];

  const addHandleRule = useMutation({
    mutationFn: async () => {
      const rule: any = {
        handle_id: selectedHandleId,
        equipment_type: equipmentType || null,
        kind: kind || null,
        load_type: loadType || null,
        load_medium: loadMedium || null,
      };

      // Validate that at least one filter is set
      if (!rule.equipment_type && !rule.kind && !rule.load_type && !rule.load_medium) {
        throw new Error("At least one filter must be set");
      }

      const { error } = await supabase
        .from('handle_equipment_rules')
        .insert(rule);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-handle-rules'] });
      toast.success("Handle rule added successfully");
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to add handle rule: " + error.message);
    }
  });

  const resetForm = () => {
    setSelectedHandleId("");
    setEquipmentType("");
    setKind("");
    setLoadType("");
    setLoadMedium("");
  };

  const handleSubmit = () => {
    if (!selectedHandleId) {
      toast.error("Please select a handle");
      return;
    }
    addHandleRule.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Handle Rule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Create a rule that applies this handle to all equipment matching the specified criteria.
            At least one filter must be set.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="handle">Handle *</Label>
            <Select value={selectedHandleId} onValueChange={setSelectedHandleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a handle" />
              </SelectTrigger>
              <SelectContent>
                {handles.map((handle) => (
                  <SelectItem key={handle.id} value={handle.id}>
                    {handle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment Type</Label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kind</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {kinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Load Type</Label>
              <Select value={loadType} onValueChange={setLoadType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {loadTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Load Medium</Label>
              <Select value={loadMedium} onValueChange={setLoadMedium}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {loadMediums.map((medium) => (
                    <SelectItem key={medium} value={medium}>
                      {medium}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedHandleId || addHandleRule.isPending}
          >
            {addHandleRule.isPending ? "Adding..." : "Add Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}