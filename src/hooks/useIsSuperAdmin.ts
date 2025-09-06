import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminState =
  | { status: "loading" }
  | { status: "authorized" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

export function useIsSuperAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        // Ensure we are logged in
        const { data: ses } = await supabase.auth.getSession();
        const user = ses?.session?.user ?? null;
        if (!user) {
          if (isMounted) setState({ status: "unauthorized" });
          return;
        }

        const { data, error } = await supabase.rpc("is_superadmin_simple");
        if (error) {
          if (isMounted) setState({ status: "error", message: error.message });
          return;
        }

        const isAdmin = Boolean(data);
        if (isMounted) {
          setState(isAdmin ? { status: "authorized" } : { status: "unauthorized" });
        }
      } catch (e: any) {
        if (isMounted) setState({ status: "error", message: e?.message ?? "Unknown error" });
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}