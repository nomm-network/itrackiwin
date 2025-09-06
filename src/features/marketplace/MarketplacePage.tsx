import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function MarketplacePage() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("v_marketplace_gyms").select("*").limit(10).then(({data}) => setGyms(data ?? []));
    supabase.from("v_marketplace_mentors").select("*").limit(10).then(({data}) => setMentors(data ?? []));
  }, []);

  return (
    <div style={{padding:24}}>
      <h1>Marketplace</h1>
      
      <section>
        <h2>Gyms</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12}}>
          {gyms.map(g => (
            <div key={g.id} style={{border:"1px solid #eee", padding:12}}>
              <h3>{g.name}</h3>
              <p>{g.city}, {g.country}</p>
              <p>Members: {g.member_count ?? 0}</p>
              <Link to={`/g/${g.slug}`}>View Details</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{marginTop:24}}>
        <h2>Mentors</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12}}>
          {mentors.map(m => (
            <div key={m.id} style={{border:"1px solid #eee", padding:12}}>
              <h3>{m.name}</h3>
              <p>{m.specialties?.join(", ")}</p>
              <p>{m.city}, {m.country}</p>
              <Link to={`/m/${m.id}`}>View Profile</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}