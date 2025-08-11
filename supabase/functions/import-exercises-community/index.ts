import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

// CORS for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Local slug util only for dedupe (DB has generated column for slug)
function slugify(name?: string | null) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Minimal offline fallback so we always import something
const OFFLINE_FALLBACK = [
  { name: "Barbell Bench Press", bodyPart: "chest", target: "pectorals", equipment: "barbell", secondaryMuscles: ["triceps", "front delts"], instructions: ["Unrack the bar with straight arms.", "Lower to mid-chest.", "Press until elbows are locked."] },
  { name: "Back Squat", bodyPart: "upper legs", target: "quadriceps", equipment: "barbell", secondaryMuscles: ["glutes", "hamstrings", "lower back"], instructions: ["Brace your core.", "Sit back and down.", "Stand up by driving through mid-foot."] },
  { name: "Deadlift", bodyPart: "back", target: "lower back", equipment: "barbell", secondaryMuscles: ["glutes", "hamstrings", "traps"], instructions: ["Set bar over mid-foot.", "Hinge and grab.", "Push the floor away and stand tall."] },
  { name: "Overhead Press", bodyPart: "shoulders", target: "deltoids", equipment: "barbell", secondaryMuscles: ["triceps", "upper back"], instructions: ["Squeeze glutes.", "Press the bar overhead.", "Lock out with ribs down."] },
  { name: "Pull-up", bodyPart: "back", target: "lats", equipment: "body weight", secondaryMuscles: ["biceps", "rear delts"], instructions: ["Hang from bar.", "Pull chin over bar.", "Lower under control."] },
  { name: "Bent-over Row", bodyPart: "back", target: "lats", equipment: "barbell", secondaryMuscles: ["rear delts", "biceps"], instructions: ["Hinge to 45°.", "Row toward lower ribs.", "Control down."] },
  { name: "Romanian Deadlift", bodyPart: "upper legs", target: "hamstrings", equipment: "barbell", secondaryMuscles: ["glutes", "lower back"], instructions: ["Hinge back.", "Keep bar close.", "Stand tall."] },
  { name: "Dumbbell Bench Press", bodyPart: "chest", target: "pectorals", equipment: "dumbbell", secondaryMuscles: ["triceps", "front delts"], instructions: ["Lower to chest.", "Press to lockout."] },
  { name: "Incline Dumbbell Press", bodyPart: "chest", target: "upper chest", equipment: "dumbbell", secondaryMuscles: ["triceps", "front delts"], instructions: ["Lower to upper chest.", "Press and squeeze."] },
  { name: "Lat Pulldown", bodyPart: "back", target: "lats", equipment: "cable", secondaryMuscles: ["biceps", "rear delts"], instructions: ["Pull to collarbone.", "Control return."] },
  { name: "Seated Cable Row", bodyPart: "back", target: "mid back", equipment: "cable", secondaryMuscles: ["biceps", "rear delts"], instructions: ["Row to navel.", "Squeeze shoulder blades."] },
  { name: "Leg Press", bodyPart: "upper legs", target: "quadriceps", equipment: "machine", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Lower sled.", "Press without locking knees."] },
  { name: "Leg Extension", bodyPart: "upper legs", target: "quadriceps", equipment: "machine", secondaryMuscles: [], instructions: ["Kick up.", "Pause and lower under control."] },
  { name: "Leg Curl", bodyPart: "upper legs", target: "hamstrings", equipment: "machine", secondaryMuscles: ["calves"], instructions: ["Curl the pad down.", "Control back up."] },
  { name: "Calf Raise", bodyPart: "lower legs", target: "calves", equipment: "machine", secondaryMuscles: [], instructions: ["Rise onto toes.", "Lower slowly."] },
  { name: "Biceps Curl", bodyPart: "upper arms", target: "biceps", equipment: "dumbbell", secondaryMuscles: ["forearms"], instructions: ["Curl up.", "Lower slowly."] },
  { name: "Triceps Pushdown", bodyPart: "upper arms", target: "triceps", equipment: "cable", secondaryMuscles: [], instructions: ["Extend elbow.", "Control return."] },
  { name: "Lateral Raise", bodyPart: "shoulders", target: "lateral delts", equipment: "dumbbell", secondaryMuscles: ["traps"], instructions: ["Raise to shoulder height.", "Soft elbows."] },
  { name: "Face Pull", bodyPart: "shoulders", target: "rear delts", equipment: "cable", secondaryMuscles: ["traps"], instructions: ["Pull to face.", "Externally rotate."] },
  { name: "Hip Thrust", bodyPart: "glutes", target: "glutes", equipment: "barbell", secondaryMuscles: ["hamstrings", "quads"], instructions: ["Drive hips up.", "Squeeze glutes at top."] },
  { name: "Bulgarian Split Squat", bodyPart: "upper legs", target: "quadriceps", equipment: "dumbbell", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Rear foot elevated.", "Lower and drive up."] },
  { name: "Goblet Squat", bodyPart: "upper legs", target: "quadriceps", equipment: "dumbbell", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Hold bell at chest.", "Squat and stand."] },
  { name: "Cable Fly", bodyPart: "chest", target: "pectorals", equipment: "cable", secondaryMuscles: ["front delts"], instructions: ["Hug motion.", "Slow eccentric."] },
  { name: "Chest Fly Machine", bodyPart: "chest", target: "pectorals", equipment: "machine", secondaryMuscles: ["front delts"], instructions: ["Squeeze handles.", "Control return."] },
  { name: "Close-Grip Bench Press", bodyPart: "upper arms", target: "triceps", equipment: "barbell", secondaryMuscles: ["chest", "front delts"], instructions: ["Grip shoulder width.", "Lower and press."] },
  { name: "Skullcrusher", bodyPart: "upper arms", target: "triceps", equipment: "barbell", secondaryMuscles: ["forearms"], instructions: ["Lower to forehead.", "Extend elbows."] },
  { name: "Hammer Curl", bodyPart: "upper arms", target: "biceps", equipment: "dumbbell", secondaryMuscles: ["forearms"], instructions: ["Neutral grip curl.", "Lower slowly."] },
  { name: "Preacher Curl", bodyPart: "upper arms", target: "biceps", equipment: "machine", secondaryMuscles: [], instructions: ["Curl up.", "Control down."] },
  { name: "Cable Curl", bodyPart: "upper arms", target: "biceps", equipment: "cable", secondaryMuscles: ["forearms"], instructions: ["Curl and squeeze.", "Control down."] },
  { name: "Shrug", bodyPart: "traps", target: "traps", equipment: "barbell", secondaryMuscles: ["forearms"], instructions: ["Raise shoulders to ears.", "Pause and lower."] },
  { name: "Farmer's Walk", bodyPart: "full body", target: "grip", equipment: "dumbbell", secondaryMuscles: ["traps", "core"], instructions: ["Stand tall and walk."] },
  { name: "Plank", bodyPart: "core", target: "abs", equipment: "body weight", secondaryMuscles: ["lower back"], instructions: ["Elbows under shoulders.", "Hold a straight line."] },
  { name: "Hanging Leg Raise", bodyPart: "core", target: "abs", equipment: "body weight", secondaryMuscles: ["hip flexors"], instructions: ["Raise legs.", "Lower under control."] },
  { name: "Crunch", bodyPart: "core", target: "abs", equipment: "body weight", secondaryMuscles: [], instructions: ["Curl up.", "Lower down."] },
  { name: "Russian Twist", bodyPart: "core", target: "obliques", equipment: "body weight", secondaryMuscles: ["abs"], instructions: ["Rotate side to side."] },
  { name: "Hip Abduction", bodyPart: "hips", target: "glute med", equipment: "machine", secondaryMuscles: ["glutes"], instructions: ["Press out.", "Control in."] },
  { name: "Hip Adduction", bodyPart: "hips", target: "adductors", equipment: "machine", secondaryMuscles: [], instructions: ["Squeeze in.", "Control out."] },
  { name: "Good Morning", bodyPart: "back", target: "lower back", equipment: "barbell", secondaryMuscles: ["hamstrings", "glutes"], instructions: ["Hinge forward.", "Stand tall."] },
  { name: "Pendlay Row", bodyPart: "back", target: "mid back", equipment: "barbell", secondaryMuscles: ["rear delts", "biceps"], instructions: ["Row from floor.", "Reset each rep."] },
  { name: "T-Bar Row", bodyPart: "back", target: "mid back", equipment: "machine", secondaryMuscles: ["rear delts", "biceps"], instructions: ["Row to lower chest.", "Squeeze back."] },
  { name: "Incline Bench Press", bodyPart: "chest", target: "upper chest", equipment: "barbell", secondaryMuscles: ["triceps", "front delts"], instructions: ["Lower to upper chest.", "Press to lockout."] },
  { name: "Dip", bodyPart: "upper arms", target: "triceps", equipment: "body weight", secondaryMuscles: ["chest", "front delts"], instructions: ["Lower under control.", "Press to lockout."] },
  { name: "Cable Lateral Raise", bodyPart: "shoulders", target: "lateral delts", equipment: "cable", secondaryMuscles: ["traps"], instructions: ["Raise to shoulder height.", "Lower slowly."] },
  { name: "Rear Delt Fly", bodyPart: "shoulders", target: "rear delts", equipment: "dumbbell", secondaryMuscles: ["mid back"], instructions: ["Hinge and raise arms out."] },
  { name: "Arnold Press", bodyPart: "shoulders", target: "deltoids", equipment: "dumbbell", secondaryMuscles: ["triceps"], instructions: ["Rotate and press.", "Reverse down."] },
  { name: "Front Squat", bodyPart: "upper legs", target: "quadriceps", equipment: "barbell", secondaryMuscles: ["glutes", "hamstrings", "upper back"], instructions: ["Elbows high.", "Sit down and up."] },
  { name: "Sumo Deadlift", bodyPart: "upper legs", target: "hamstrings", equipment: "barbell", secondaryMuscles: ["glutes", "adductors"], instructions: ["Wide stance.", "Drive hips through."] },
  { name: "Hip Hinge", bodyPart: "back", target: "lower back", equipment: "body weight", secondaryMuscles: ["glutes", "hamstrings"], instructions: ["Push hips back.", "Return to stand."] },
];

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    // Sources (ordered)
    const sources = [
      { key: "yuhonas", url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises.json" },
      { key: "everkinetic", url: "https://raw.githubusercontent.com/everkinetic/data/master/exercises.json" },
      { key: "wrkout", url: "https://raw.githubusercontent.com/wrkout/exercises.json/main/exercises.json" },
      { key: "wrkout-master", url: "https://raw.githubusercontent.com/wrkout/exercises.json/master/exercises.json" },
    ] as const;

    async function fetchJson(url: string) {
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "itrackiwin-edge/1.0",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return await res.json();
    }

    type YuhonasItem = {
      name: string; id?: string | number; bodyPart?: string; target?: string; equipment?: string;
      secondaryMuscles?: string[]; instructions?: string[]; gifUrl?: string;
    };

    type WrkoutItem = {
      name: string; equipment?: string | string[]; primaryMuscles?: string[]; secondaryMuscles?: string[]; instructions?: string[] | string; category?: string; images?: string[]; id?: string | number;
    };

    let usedSource: string | "offline" = "offline";
    let items: any[] = [];
    const errors: Record<string, string> = {};

    for (const s of sources) {
      try {
        const json = await fetchJson(s.url);
        // yuhonas is an array of exercises
        if (Array.isArray(json) && s.key === "yuhonas") {
          items = json as any[];
          usedSource = s.key;
          break;
        }
        // Some repos put data under .exercises or .data
        if (Array.isArray((json as any)?.exercises)) {
          items = (json as any).exercises;
          usedSource = s.key;
          break;
        }
        if (Array.isArray((json as any)?.data)) {
          items = (json as any).data;
          usedSource = s.key;
          break;
        }
        // raw array fallback
        if (Array.isArray(json)) {
          items = json as any[];
          usedSource = s.key;
          break;
        }
        throw new Error("Unsupported JSON structure");
      } catch (e) {
        const msg = (e as Error).message || String(e);
        console.error("exercise import fetch failed", s.key, s.url, msg);
        errors[s.key] = msg;
        continue;
      }
    }

    if (!items || items.length === 0) {
      items = OFFLINE_FALLBACK;
      usedSource = "offline";
    }

    // Transform to DB shape
    const mapped = items.map((raw) => {
      // Detect shape
      const isY = typeof raw?.bodyPart !== "undefined" || typeof raw?.target !== "undefined";
      const isW = typeof raw?.primaryMuscles !== "undefined" || typeof raw?.category !== "undefined";

      if (isY) {
        const it = raw as YuhonasItem;
        const name = (it.name || "").trim();
        const slugKey = slugify(name);
        if (!name || !slugKey) return null;
        const instr = Array.isArray(it.instructions) ? it.instructions.join(" ") : undefined;
        return {
          _slug: slugKey,
          name,
          description: instr ?? null,
          equipment: it.equipment || null,
          primary_muscle: it.target || null,
          secondary_muscles: Array.isArray(it.secondaryMuscles) ? it.secondaryMuscles : null,
          body_part: it.bodyPart || null,
          is_public: true,
          owner_user_id: null,
          source_url: "https://github.com/yuhonas/free-exercise-db",
          image_url: (it as any).gifUrl || null,
          thumbnail_url: null,
          popularity_rank: null,
        } as const;
      }

      // wrkout / everkinetic-style
      const it = raw as WrkoutItem;
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
        _slug: slugKey,
        name,
        description: instr,
        equipment,
        primary_muscle: primary,
        secondary_muscles: secondary,
        body_part: (it as any).category || null,
        is_public: true,
        owner_user_id: null,
        source_url: usedSource.includes("everkinetic") ? "https://github.com/everkinetic/data" : "https://github.com/wrkout/exercises.json",
        image_url: Array.isArray(it.images) && it.images.length ? it.images[0] : null,
        thumbnail_url: null,
        popularity_rank: null,
      } as const;
    }).filter(Boolean) as any[];

    // Dedupe by local slug
    const seen = new Set<string>();
    const uniqueRows = mapped.filter((r: any) => {
      const k = r._slug as string;
      if (!k) return false;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Upsert in chunks, NEVER send slug (generated column in DB)
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

    console.log("exercise import:", { source: usedSource, processed: uniqueRows.length, affected, errors });
    return new Response(
      JSON.stringify({ ok: true, source: usedSource, processed: uniqueRows.length, affected, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("import-exercises-community error", e);
    const msg = (e as any)?.message || String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
