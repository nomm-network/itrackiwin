import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GymAdmin {
  gym_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export function useGymAdmins(gymId?: string) {
  return useQuery({
    queryKey: ["gym-admins", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID is required");
      
      const { data, error } = await supabase
        .from("gym_admins")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as GymAdmin[];
    },
    enabled: !!gymId,
  });
}

export function useAssignGymAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      gymId, 
      userId, 
      role 
    }: { 
      gymId: string; 
      userId: string; 
      role: string; 
    }) => {
      const { error } = await supabase.rpc("assign_gym_admin", {
        p_gym: gymId,
        p_user: userId,
        p_role: role,
      });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-admins", variables.gymId] });
      toast.success("Admin assigned successfully!");
    },
    onError: (error) => {
      console.error("Error assigning admin:", error);
      toast.error("Failed to assign admin");
    },
  });
}