import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRequestGymRole() {
  return useMutation({
    mutationFn: async ({
      gymId,
      role,
      message,
    }: {
      gymId: string;
      role: string;
      message?: string;
    }) => {
      const { data, error } = await supabase.rpc("request_gym_role", {
        p_gym: gymId,
        p_role: role,
        p_msg: message || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Role request submitted successfully!");
    },
    onError: (error) => {
      console.error("Error requesting role:", error);
      toast.error("Failed to submit role request");
    },
  });
}