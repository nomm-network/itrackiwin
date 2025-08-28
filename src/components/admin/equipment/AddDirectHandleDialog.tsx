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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHandles } from "@/hooks/useHandles";
import { toast } from "sonner";

interface AddDirectHandleDialogProps {
  equipmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingHandleIds: string[];
}

export function AddDirectHandleDialog({
  equipmentId,
  open,
  onOpenChange,
  existingHandleIds
}: AddDirectHandleDialogProps) {
  const [selectedHandleIds, setSelectedHandleIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { data: handles = [] } = useHandles();

  const availableHandles = handles.filter(h => !existingHandleIds.includes(h.id));

  const addDirectMappings = useMutation({
    mutationFn: async (handleIds: string[]) => {
      const mappings = handleIds.map(handleId => ({
        equipment_id: equipmentId,
        handle_id: handleId
      }));

      const { error } = await supabase
        .from('handle_equipment')
        .insert(mappings);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-direct-handles', equipmentId] });
      toast.success(`Added ${selectedHandleIds.length} direct handle mapping(s)`);
      setSelectedHandleIds([]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to add handle mappings: " + error.message);
    }
  });

  const toggleHandle = (handleId: string) => {
    setSelectedHandleIds(prev => 
      prev.includes(handleId)
        ? prev.filter(id => id !== handleId)
        : [...prev, handleId]
    );
  };

  const handleSubmit = () => {
    if (selectedHandleIds.length > 0) {
      addDirectMappings.mutate(selectedHandleIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Direct Handle Mappings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Select handles to create direct mappings with this equipment.
          </div>
          
          <ScrollArea className="h-96 border rounded-md p-4">
            <div className="space-y-2">
              {availableHandles.map((handle) => (
                <div
                  key={handle.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedHandleIds.includes(handle.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleHandle(handle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{handle.name}</div>
                      <div className="text-sm text-muted-foreground">{handle.slug}</div>
                    </div>
                    {selectedHandleIds.includes(handle.id) && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {availableHandles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  All available handles are already mapped
                </div>
              )}
            </div>
          </ScrollArea>
          
          {selectedHandleIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedHandleIds.length} handle(s) selected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedHandleIds.length === 0 || addDirectMappings.isPending}
          >
            {addDirectMappings.isPending ? "Adding..." : `Add ${selectedHandleIds.length} Mapping(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}