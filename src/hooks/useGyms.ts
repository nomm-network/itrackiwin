import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Gym {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  photo_url?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useGyms() {
  return useQuery({
    queryKey: ["gyms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Gym[];
    },
  });
}

export function useCreateGym() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, city, country }: { name: string; city: string; country: string }) => {
      const { data, error } = await supabase.rpc("create_gym", {
        p_name: name,
        p_city: city,
        p_country: country,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast.success("Gym created successfully!");
    },
    onError: (error) => {
      console.error("Error creating gym:", error);
      toast.error("Failed to create gym");
    },
  });
}

export function useGym(gymId?: string) {
  return useQuery({
    queryKey: ["gym", gymId],
    queryFn: async () => {
      if (!gymId) throw new Error("Gym ID is required");
      
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .eq("id", gymId)
        .single();
      
      if (error) throw error;
      return data as Gym;
    },
    enabled: !!gymId,
  });
}