import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GymCoachMembership {
  id: string;
  gym_id: string;
  mentor_id: string;
  status: string;
  requested_by: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
  mentor?: {
    id: string;
    display_name?: string;
    mentor_type: string;
  };
}

export function useGymCoaches(gymId?: string) {
  return useQuery({
    queryKey: ["gym-coaches", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID is required");
      
      const { data, error } = await supabase
        .from("gym_coach_memberships")
        .select(`
          *,
          mentor:mentors(
            id,
            display_name,
            mentor_type
          )
        `)
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as GymCoachMembership[];
    },
    enabled: !!gymId,
  });
}

export function useRequestGymCoach() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      gymId, 
      mentorId 
    }: { 
      gymId: string; 
      mentorId: string; 
    }) => {
      const { error } = await supabase.rpc("request_gym_coach", {
        p_gym: gymId,
        p_mentor_id: mentorId,
      });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-coaches", variables.gymId] });
      toast.success("Coach request submitted!");
    },
    onError: (error) => {
      console.error("Error requesting coach membership:", error);
      toast.error("Failed to submit coach request");
    },
  });
}

export function useDecideGymCoach() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      gymId, 
      mentorId, 
      status 
    }: { 
      gymId: string; 
      mentorId: string; 
      status: string; 
    }) => {
      const { error } = await supabase.rpc("decide_gym_coach", {
        p_gym: gymId,
        p_mentor_id: mentorId,
        p_status: status,
      });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-coaches", variables.gymId] });
      toast.success(`Coach ${variables.status === 'active' ? 'approved' : 'rejected'}!`);
    },
    onError: (error) => {
      console.error("Error deciding coach membership:", error);
      toast.error("Failed to update coach status");
    },
  });
}