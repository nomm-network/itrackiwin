import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_KEY = Deno.env.get("GOOGLE_PLACES_KEY") ?? "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { query, lat, lng, radius = 5000 } = await req.json();

    if (!query && (!lat || !lng)) {
      return new Response(
        JSON.stringify({ error: 'Either query or lat/lng coordinates are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let placesUrl: string;
    
    if (lat && lng) {
      // Search by location (nearby search)
      placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=gym&key=${GOOGLE_KEY}`;
    } else {
      // Search by text query
      placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' gym')}&key=${GOOGLE_KEY}`;
    }

    console.log('Calling Google Places API:', placesUrl.replace(GOOGLE_KEY, 'API_KEY_HIDDEN'));

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK') {
      console.error('Google Places API error:', placesData.status, placesData.error_message);
      return new Response(
        JSON.stringify({ 
          error: 'Google Places API error', 
          status: placesData.status,
          message: placesData.error_message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform the results to a cleaner format
    const results = placesData.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      location: place.geometry?.location,
      photos: place.photos?.slice(0, 1).map((photo: any) => ({
        photo_reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        // Construct photo URL
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_KEY}`
      })),
      opening_hours: place.opening_hours,
      website: place.website,
      phone: place.formatted_phone_number,
      types: place.types
    }));

    return new Response(
      JSON.stringify({ 
        results,
        total: results.length,
        query: query || `${lat},${lng}`,
        radius: radius
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-gyms function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});