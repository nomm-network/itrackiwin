import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GymEquipment {
  id: string;
  gym_id: string;
  equipment_id: string;
  name?: string;
  loading_mode?: string;
  min_weight_kg?: number;
  max_weight_kg?: number;
  increment_kg?: number;
  count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useGymEquipment(gymId?: string) {
  return useQuery({
    queryKey: ["gym-equipment", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID is required");
      
      const { data, error } = await supabase
        .from("gym_equipment")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as GymEquipment[];
    },
    enabled: !!gymId,
  });
}

export function useCreateGymEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (equipment: Partial<GymEquipment> & { gym_id: string; equipment_id: string; loading_mode: string }) => {
      const { data, error } = await supabase
        .from("gym_equipment")
        .insert([equipment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-equipment", variables.gym_id] });
      toast.success("Equipment added successfully!");
    },
    onError: (error) => {
      console.error("Error creating equipment:", error);
      toast.error("Failed to add equipment");
    },
  });
}

export function useUpdateGymEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      gymId, 
      ...updates 
    }: Partial<GymEquipment> & { 
      id: string; 
      gymId: string; 
    }) => {
      const { data, error } = await supabase
        .from("gym_equipment")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-equipment", variables.gymId] });
      toast.success("Equipment updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment");
    },
  });
}

export function useDeleteGymEquipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("gym_equipment")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-equipment", variables.gymId] });
      toast.success("Equipment deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    },
  });
}