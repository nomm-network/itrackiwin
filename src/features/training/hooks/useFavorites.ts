import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FavTemplate = { id: string; name: string };
export type FavProgram = { id: string; name: string };

type State = {
  loading: boolean;
  templates: FavTemplate[];
  programs: FavProgram[];
  error?: string;
};

export function useFavorites(): State {
  const [state, setState] = useState<State>({
    loading: true,
    templates: [],
    programs: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState(s => ({ ...s, loading: true, error: undefined }));

      // Fetch favorite templates and programs
      const [tf, pf] = await Promise.all([
        supabase
          .from("user_favorite_templates")
          .select("workout_templates:template_id(id,name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("training_programs")
          .select("id,name")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      const err = tf.error || pf.error;
      if (err) {
        setState(s => ({ ...s, loading: false, error: err.message }));
        return;
      }

      const templates =
        (tf.data || [])
          .map((r: any) => r.workout_templates)
          .filter(Boolean) as FavTemplate[];

      const programs = (pf.data || []) as FavProgram[];

      setState({ loading: false, templates, programs });
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return useMemo(() => state, [state]);
}