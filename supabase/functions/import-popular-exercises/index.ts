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
    // Fetch popular exercises from Wger public API (English, status=2=verified)
    // We will paginate until we collect ~500 unique exercises.
    const base = "https://wger.de/api/v2/exerciseinfo/?language=2&status=2";

    type WgerExercise = {
      id: number;
      name: string;
      description: string;
      equipment: { name: string }[];
      muscles: { name_en: string }[];
      muscles_secondary?: { name_en: string }[];
      category?: { name: string };
      images?: { image: string; is_main: boolean }[];
    };

    // Helper to fetch a page
    async function fetchPage(url: string) {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch from Wger: ${res.status} ${res.statusText}`);
      }
      return await res.json();
    }

    const desired = 500;
    let nextUrl: string | null = `${base}&limit=100&offset=0`;
    const results: WgerExercise[] = [];

    while (nextUrl && results.length < desired) {
      const page = await fetchPage(nextUrl);
      const pageResults: WgerExercise[] = page.results || [];
      for (const ex of pageResults) {
        results.push(ex);
        if (results.length >= desired) break;
      }
      nextUrl = page.next || null; // Wger returns full URL for next page
    }

    const popularOrder = [
      "barbell squat",
      "deadlift",
      "barbell bench press",
      "overhead press",
      "pull-up",
      "chin-up",
      "barbell row",
      "dumbbell row",
      "lat pulldown",
      "incline bench press",
      "romanian deadlift",
      "hip thrust",
      "lunge",
      "leg press",
      "leg extension",
      "leg curl",
      "calf raise",
      "barbell curl",
      "dumbbell curl",
      "hammer curl",
      "triceps pushdown",
      "skullcrusher",
      "lateral raise",
      "face pull",
      "rear delt fly",
      "cable row",
      "seated cable row",
      "plank",
      "crunch",
      "hanging leg raise",
    ];

    const orderIndex = new Map<string, number>();
    popularOrder.forEach((n, i) => orderIndex.set(slugify(n), i + 1));

    // Map and prepare rows
    const mapped = results.map((ex: WgerExercise) => {
      const name = typeof ex.name === "string" ? ex.name.trim() : "";
      const slug = slugify(name); // for local ranking & dedupe only
      const primaryMuscle = ex.muscles?.[0]?.name_en || null;
      const secondary = (ex.muscles_secondary || [])
        .map((m) => m?.name_en)
        .filter(Boolean) as string[];
      const equipment = ex.equipment?.map((e) => e.name).join(", ") || null;
      const descriptionText = ex.description
        ? ex.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
        : null;
      const mainImg = ex.images?.find((im) => im.is_main)?.image || ex.images?.[0]?.image || null;
      const baseRank = slug ? orderIndex.get(slug) ?? null : null;

      // Build row WITHOUT slug (slug is generated in DB)
      const row = {
        name: name || null,
        description: descriptionText,
        equipment,
        primary_muscle: primaryMuscle,
        secondary_muscles: secondary.length ? secondary : null,
        body_part: ex.category?.name || null,
        is_public: true,
        owner_user_id: null,
        source_url: `https://wger.de/en/exercise/${ex.id}`,
        image_url: mainImg,
        thumbnail_url: mainImg,
        popularity_rank: baseRank,
      } as any;

      return { row, slug };
    });

    // Deduplicate by slug, prefer first occurrence
    const seen = new Set<string>();
    const uniqueRows = mapped
      .filter((m) => {
        if (!m.slug || !m.row.name) return false;
        if (seen.has(m.slug)) return false;
        seen.add(m.slug);
        return true;
      })
      .map((m) => m.row);

    // Upsert in chunks
    const chunkSize = 200;
    let affected = 0;

    for (let i = 0; i < uniqueRows.length; i += chunkSize) {
      const chunk = uniqueRows.slice(i, i + chunkSize);
      const { data: upserted, error } = await supabase
        .from("exercises")
        .upsert(chunk, { onConflict: "slug" })
        .select("id");
      if (error) throw error;
      if (upserted) {
        affected += upserted.length; // affected rows
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: uniqueRows.length, affected }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("import-popular-exercises error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
