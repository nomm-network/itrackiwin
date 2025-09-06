import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDealsVerifyPage() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase
      .from("ambassador_gym_deals")
      .select("id, battle_id, gym_id, ambassador_id, status, contract_url, signed_at, verified_at")
      .order("signed_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);
  async function verify(id:string, status:"verified"|"rejected") {
    await supabase.rpc("verify_gym_deal", { p_deal: id, p_status: status });
    await load();
  }
  return (
    <div style={{padding:24}}>
      <h1>Deals Verification</h1>
      {rows.map(r => (
        <div key={r.id} style={{border:"1px solid #eee", padding:12, marginBottom:12}}>
          <div>Deal: {r.id}</div>
          <div>Gym: {r.gym_id}</div>
          <div>Ambassador: {r.ambassador_id}</div>
          <div>Status: {r.status}</div>
          {r.contract_url && <a href={r.contract_url} target="_blank" rel="noreferrer">Contract</a>}
          <div style={{marginTop:8}}>
            <button onClick={()=>verify(r.id, "verified")}>Verify</button>
            <button onClick={()=>verify(r.id, "rejected")} style={{marginLeft:8}}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}