import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { EquipmentHandleManager } from "./EquipmentHandleManager";

interface EquipmentEditDialogProps {
  equipmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentEditDialog({
  equipmentId,
  open,
  onOpenChange,
}: EquipmentEditDialogProps) {
  const [formData, setFormData] = useState({
    equipment_type: "",
    kind: "",
    slug: "",
    notes: "",
    load_type: "",
    load_medium: "",
    weight_kg: "",
    default_stack: "[]",
    default_side_min_plate_kg: "",
    default_single_min_increment_kg: "",
    default_bar_weight_kg: "",
  });

  const queryClient = useQueryClient();

  // Fetch equipment data
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: async () => {
      if (!equipmentId) return null;
      
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!equipmentId && open,
  });

  // Update form when equipment data loads
  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_type: equipment.equipment_type || "",
        kind: equipment.kind || "",
        slug: equipment.slug || "",
        notes: equipment.notes || "",
        load_type: equipment.load_type || "",
        load_medium: equipment.load_medium || "",
        weight_kg: equipment.weight_kg?.toString() || "",
        default_stack: JSON.stringify(equipment.default_stack || []),
        default_side_min_plate_kg: equipment.default_side_min_plate_kg?.toString() || "",
        default_single_min_increment_kg: equipment.default_single_min_increment_kg?.toString() || "",
        default_bar_weight_kg: equipment.default_bar_weight_kg?.toString() || "",
      });
    }
  }, [equipment]);

  const updateEquipment = useMutation({
    mutationFn: async (data: any) => {
      if (!equipmentId) throw new Error("No equipment ID");

      const updateData = {
        ...data,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        default_stack: JSON.parse(data.default_stack || "[]"),
        default_side_min_plate_kg: data.default_side_min_plate_kg ? parseFloat(data.default_side_min_plate_kg) : null,
        default_single_min_increment_kg: data.default_single_min_increment_kg ? parseFloat(data.default_single_min_increment_kg) : null,
        default_bar_weight_kg: data.default_bar_weight_kg ? parseFloat(data.default_bar_weight_kg) : null,
      };

      const { error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', equipmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success("Equipment updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update equipment: " + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEquipment.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!equipmentId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Equipment Details</TabsTrigger>
            <TabsTrigger value="handles">Handle Relations</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <ScrollArea className="h-96">
              <form onSubmit={handleSubmit} className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipment Type</Label>
                    <Select
                      value={formData.equipment_type}
                      onValueChange={(value) => handleInputChange('equipment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="machine">Machine</SelectItem>
                        <SelectItem value="free_weight">Free Weight</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kind</Label>
                    <Input
                      value={formData.kind}
                      onChange={(e) => handleInputChange('kind', e.target.value)}
                      placeholder="e.g., cable, pulldown, row"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="equipment-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Load Type</Label>
                    <Select
                      value={formData.load_type}
                      onValueChange={(value) => handleInputChange('load_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select load type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="single_load">Single Load</SelectItem>
                        <SelectItem value="dual_load">Dual Load</SelectItem>
                        <SelectItem value="stack">Stack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Load Medium</Label>
                    <Select
                      value={formData.load_medium}
                      onValueChange={(value) => handleInputChange('load_medium', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select load medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="plates">Plates</SelectItem>
                        <SelectItem value="stack">Stack</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                        <SelectItem value="band">Band</SelectItem>
                        <SelectItem value="chain">Chain</SelectItem>
                        <SelectItem value="flywheel">Flywheel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Bar Weight (kg)</Label>
                    <Input
                      type="number"
                      value={formData.default_bar_weight_kg}
                      onChange={(e) => handleInputChange('default_bar_weight_kg', e.target.value)}
                      placeholder="20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Plate Per Side (kg)</Label>
                    <Input
                      type="number"
                      value={formData.default_side_min_plate_kg}
                      onChange={(e) => handleInputChange('default_side_min_plate_kg', e.target.value)}
                      placeholder="1.25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Increment (kg)</Label>
                    <Input
                      type="number"
                      value={formData.default_single_min_increment_kg}
                      onChange={(e) => handleInputChange('default_single_min_increment_kg', e.target.value)}
                      placeholder="2.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Equipment notes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Stack (JSON)</Label>
                  <Textarea
                    value={formData.default_stack}
                    onChange={(e) => handleInputChange('default_stack', e.target.value)}
                    placeholder="[10, 20, 30, 40, 50]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateEquipment.isPending}
                  >
                    {updateEquipment.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="handles">
            <ScrollArea className="h-96">
              <EquipmentHandleManager equipmentId={equipmentId} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}