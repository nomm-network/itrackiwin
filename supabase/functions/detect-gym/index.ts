import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_KEY = Deno.env.get("GOOGLE_PLACES_KEY") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, user_id } = await req.json();
    
    if (typeof lat !== "number" || typeof lng !== "number") {
      console.error('Invalid coordinates provided:', { lat, lng });
      return new Response(
        JSON.stringify({ error: "Invalid coordinates provided" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Detecting gym for coordinates:', { lat, lng, user_id });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1) Search local database first
    console.log('Searching local database for nearby gyms...');
    const { data: localGyms, error: localError } = await supabase.rpc("nearest_gyms", { 
      _lat: lat, 
      _lng: lng, 
      _radius_m: 1200 
    });

    if (localError) {
      console.error('Error querying local gyms:', localError);
    }

    let candidates = localGyms ?? [];
    console.log('Found local candidates:', candidates.length);

    // 2) If no good local candidates, query Google Places
    const topLocal = candidates[0];
    const hasGoodLocalMatch = topLocal && (topLocal.confidence ?? 0) >= 0.6;
    
    if (!hasGoodLocalMatch && GOOGLE_KEY) {
      console.log('No good local match, querying Google Places API...');
      
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=gym&key=${GOOGLE_KEY}`;
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();

        if (placesData.status === 'OK' && placesData.results) {
          console.log('Found Google Places results:', placesData.results.length);
          
          // Upsert new places into our database
          for (const place of placesData.results.slice(0, 8)) {
            const name = place.name as string;
            const placeId = place.place_id as string;
            const address = place.vicinity as string;
            const placeLat = place.geometry?.location?.lat as number;
            const placeLng = place.geometry?.location?.lng as number;

            if (name && placeId && placeLat && placeLng) {
              console.log('Upserting gym:', name);
              
              const { error: upsertError } = await supabase
                .from("gyms")
                .upsert({
                  name,
                  provider: "google",
                  provider_place_id: placeId,
                  address,
                  location: `SRID=4326;POINT(${placeLng} ${placeLat})`,
                }, { 
                  onConflict: "provider,provider_place_id",
                  ignoreDuplicates: false 
                });

              if (upsertError) {
                console.error('Error upserting gym:', upsertError);
              }
            }
          }

          // Re-query local database after upserts
          console.log('Re-querying local database after upserts...');
          const { data: updatedLocalGyms } = await supabase.rpc("nearest_gyms", { 
            _lat: lat, 
            _lng: lng, 
            _radius_m: 1200 
          });
          
          candidates = updatedLocalGyms ?? [];
          console.log('Updated candidates after upserts:', candidates.length);
        } else {
          console.log('Google Places API response status:', placesData.status);
        }
      } catch (error) {
        console.error('Error fetching from Google Places:', error);
      }
    }

    // 3) Log visit if user_id provided and we have a good match
    if (user_id && candidates.length > 0) {
      const bestMatch = candidates[0];
      if (bestMatch.confidence >= 0.5) {
        console.log('Logging gym visit for user:', user_id);
        
        const { error: visitError } = await supabase
          .from("user_gym_visits")
          .insert({
            user_id,
            gym_id: bestMatch.gym_id,
            source: 'gps',
            lat,
            lng,
            confidence: bestMatch.confidence
          });

        if (visitError) {
          console.error('Error logging gym visit:', visitError);
        }
      }
    }

    // 4) Return response
    const response = {
      candidates: candidates.map(c => ({
        gym_id: c.gym_id,
        name: c.name,
        distance_m: Math.round(c.distance_m),
        address: c.address,
        confidence: Number(c.confidence.toFixed(2))
      })),
      suggested_gym_id: candidates[0]?.gym_id ?? null,
      source: hasGoodLocalMatch ? 'local' : 'external'
    };

    console.log('Returning response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-gym function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});