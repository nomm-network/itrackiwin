import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function GymPublicPage() {
  const { slug } = useParams();
  const [gym, setGym] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from("v_marketplace_gyms").select("*").eq("slug", slug).single()
      .then(({data}) => setGym(data));
  }, [slug]);

  if (!gym) return <div style={{padding:24}}>Loading...</div>;

  return (
    <div style={{padding:24}}>
      <h1>{gym.name}</h1>
      <p>{gym.city}, {gym.country}</p>
      <p>Members: {gym.member_count ?? 0}</p>
      <p>Coaches: {gym.coach_count ?? 0}</p>
      
      <section style={{marginTop:24}}>
        <h2>Join This Gym</h2>
        <button style={{padding:"12px 24px", fontSize:16, backgroundColor:"#007bff", color:"white", border:"none", borderRadius:4}}>
          Request Membership
        </button>
      </section>
    </div>
  );
}