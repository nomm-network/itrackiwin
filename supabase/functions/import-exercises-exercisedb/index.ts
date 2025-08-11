import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(name?: string | null) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const url = "https://v1.exercisedb.dev/api/v1/exercises";
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ExerciseDB: ${res.status} ${res.statusText}`);
    }
    const raw = await res.json();

    type ExDb = {
      id: string;
      name: string;
      bodyPart: string;
      equipment: string;
      gifUrl?: string;
      target?: string;
      secondaryMuscles?: string[];
    };

    const list: ExDb[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.data)
      ? (raw as any).data
      : Array.isArray((raw as any)?.results)
      ? (raw as any).results
      : [];

    console.log("ExerciseDB fetched count:", Array.isArray(list) ? list.length : 0);

    const rows = (Array.isArray(list) ? list : []).map((ex: ExDb) => {
      const name = typeof ex.name === "string" ? ex.name.trim() : "";
      const slugRaw = slugify(name);
      if (!name || !slugRaw) return null;

      const primary = ex.target?.trim() || null;
      const secondary = Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles.filter(Boolean) : null;

      return {
        name,
        slug: slugRaw,
        description: null,
        equipment: ex.equipment || null,
        primary_muscle: primary,
        secondary_muscles: secondary,
        body_part: ex.bodyPart || null,
        is_public: true,
        owner_user_id: null,
        source_url: `https://v1.exercisedb.dev/api/v1/exercises/${ex.id}`,
        image_url: ex.gifUrl || null,
        thumbnail_url: ex.gifUrl || null,
        popularity_rank: null,
      } as any;
    }).filter(Boolean);

    // Deduplicate by slug
    const seen = new Set<string>();
    const uniqueRows = rows.filter((r: any) => {
      if (seen.has(r.slug)) return false;
      seen.add(r.slug);
      return true;
    });

    const chunkSize = 200;
    let affected = 0;
    for (let i = 0; i < uniqueRows.length; i += chunkSize) {
      const chunk = uniqueRows.slice(i, i + chunkSize);
      const { data: upserted, error } = await supabase
        .from("exercises")
        .upsert(chunk, { onConflict: "slug" })
        .select("id, slug");
      if (error) throw error;
      affected += upserted?.length || 0;
    }

    return new Response(
      JSON.stringify({ ok: true, processed: uniqueRows.length, affected }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("import-exercises-exercisedb error", e);
    return new Response(JSON.stringify({ ok: false, error: String((e as any)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
