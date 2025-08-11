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
    const sources = [
      "https://raw.githubusercontent.com/wrkout/exercises.json/master/exercises.json",
      "https://raw.githubusercontent.com/wrkout/exercises.json/main/exercises.json",
    ];

    async function fetchJson(url: string) {
      const res = await fetch(url, {
        headers: { "Accept": "application/json", "User-Agent": "itrackiwin-edge/1.0" },
      });
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return await res.json();
    }

    type CommunityItem = {
      name: string;
      equipment?: string | string[];
      primaryMuscles?: string[];
      secondaryMuscles?: string[];
      instructions?: string[] | string;
      category?: string;
      images?: string[];
      id?: string | number;
    };

    let rawList: any[] = [];
    for (const src of sources) {
      try {
        const json = await fetchJson(src);
        if (Array.isArray(json)) { rawList = json; break; }
        if (Array.isArray((json as any)?.exercises)) { rawList = (json as any).exercises; break; }
        if (Array.isArray((json as any)?.data)) { rawList = (json as any).data; break; }
      } catch (e) {
        console.error("community fetch failed", src, e);
        continue;
      }
    }

    const desired = 800;
    const items: CommunityItem[] = (rawList || []).slice(0, desired);
    console.log("community dataset count:", items.length);

    const rows = items.map((it) => {
      const name = typeof it?.name === "string" ? it.name.trim() : "";
      const slugKey = slugify(name);
      if (!name || !slugKey) return null;

      const instr = Array.isArray(it.instructions)
        ? it.instructions.join(" ")
        : (typeof it.instructions === "string" ? it.instructions : null);
      const equipment = Array.isArray(it.equipment)
        ? it.equipment.filter(Boolean).join(", ")
        : (it.equipment || null);
      const primary = Array.isArray(it.primaryMuscles) && it.primaryMuscles.length > 0 ? it.primaryMuscles[0] : null;
      const secondary = Array.isArray(it.secondaryMuscles) && it.secondaryMuscles.length ? it.secondaryMuscles : null;

      return {
        _slug: slugKey, // local dedupe only; DB generates slug
        name,
        description: instr,
        equipment,
        primary_muscle: primary,
        secondary_muscles: secondary,
        body_part: it.category || null,
        is_public: true,
        owner_user_id: null,
        source_url: "https://github.com/wrkout/exercises.json",
        image_url: null,
        thumbnail_url: null,
        popularity_rank: null,
      } as any;
    }).filter(Boolean);

    const seen = new Set<string>();
    const uniqueRows = (rows as any[]).filter((r) => {
      const k = r._slug as string;
      if (!k) return false;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    let affected = 0;
    const chunkSize = 200;
    for (let i = 0; i < uniqueRows.length; i += chunkSize) {
      const chunk = uniqueRows.slice(i, i + chunkSize);
      const payload = chunk.map(({ _slug, ...rest }) => rest);
      const { data: upserted, error } = await supabase
        .from("exercises")
        .upsert(payload, { onConflict: "slug" })
        .select("id");
      if (error) throw error;
      affected += upserted?.length || 0;
    }

    return new Response(
      JSON.stringify({ ok: true, processed: uniqueRows.length, affected }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("import-exercises-community error", e);
    return new Response(JSON.stringify({ ok: false, error: String((e as any)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});