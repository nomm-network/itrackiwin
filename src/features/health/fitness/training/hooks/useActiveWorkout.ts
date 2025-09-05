import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ActiveWorkout = {
  id: string;
  started_at: string | null;
  workout_templates?: { name?: string | null } | null;
};

export function useActiveWorkout() {
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      const uid = session?.session?.user?.id;
      if (!uid) { setActive(null); setLoading(false); return; }

      const { data, error } = await supabase
        .from("workouts")
        .select("id, started_at, workout_templates(name)")
        .eq("user_id", uid)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) { setError(error.message); setActive(null); }
      else { setActive(data ?? null); }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { active, isLoading: loading, error };
}