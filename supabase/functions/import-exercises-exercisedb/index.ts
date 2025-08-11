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
    const base = "https://v1.exercisedb.dev/api/v1/exercises";
    const desired = 500;
    const pageSize = 200;

    async function fetchJson(u: string) {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`Failed to fetch ExerciseDB: ${r.status} ${r.statusText}`);
      return await r.json();
    }

    type ExDb = {
      id: string;
      name: string;
      bodyPart: string;
      equipment: string;
      gifUrl?: string;
      target?: string;
      secondaryMuscles?: string[];
    };

    const strategies: string[] = [
      `${base}?limit=${desired}`,
      ...Array.from({ length: Math.ceil(desired / pageSize) }, (_, i) => `${base}?limit=${pageSize}&offset=${i * pageSize}`),
      ...Array.from({ length: Math.ceil(desired / pageSize) }, (_, i) => `${base}?page=${i + 1}&limit=${pageSize}`),
      ...Array.from({ length: Math.ceil(desired / pageSize) }, (_, i) => `${base}?limit=${pageSize}&skip=${i * pageSize}`),
      base,
    ];

    const collected: any[] = [];
    for (const u of strategies) {
      if (collected.length >= desired) break;
      try {
        const raw = await fetchJson(u);
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : Array.isArray((raw as any)?.results)
          ? (raw as any).results
          : [];
        for (const item of arr) {
          collected.push(item);
          if (collected.length >= desired) break;
        }
        if (arr.length === 0) continue;
      } catch (_) {
        // ignore and try next strategy
      }
    }

    const list: ExDb[] = collected as ExDb[];
    console.log("ExerciseDB fetched count:", Array.isArray(list) ? list.length : 0);

    const rows = (Array.isArray(list) ? list : []).map((ex: ExDb) => {
      const name = typeof ex.name === "string" ? ex.name.trim() : "";
      const slugKey = slugify(name);
      if (!name || !slugKey) return null;

      const primary = ex.target?.trim() || null;
      const secondary = Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles.filter(Boolean) : null;

      return {
        _slug: slugKey, // for local dedupe only; slug is generated in DB
        name,
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

    // Deduplicate by computed slug
    const seen = new Set<string>();
    const uniqueRows = rows.filter((r: any) => {
      if (seen.has(r._slug)) return false;
      seen.add(r._slug);
      return true;
    });

    const chunkSize = 200;
    let affected = 0;
    for (let i = 0; i < uniqueRows.length; i += chunkSize) {
      const chunk = uniqueRows.slice(i, i + chunkSize);
      const payload = (chunk as any[]).map(({ _slug, ...rest }) => rest);
      const { data: upserted, error } = await supabase
        .from("exercises")
        .upsert(payload, { onConflict: "slug" })
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
