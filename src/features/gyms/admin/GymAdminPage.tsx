import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsGymAdmin } from "@/hooks/useIsGymAdmin";

export default function GymAdminPage() {
  const { gymId } = useParams();
  const { isAdmin } = useIsGymAdmin(gymId);
  const [act, setAct] = useState<any>(null);
  const [eq, setEq] = useState<any>(null);
  const [pf, setPf] = useState<any>(null);

  useEffect(() => {
    if (!gymId) return;
    supabase.from("v_gym_activity").select("*").eq("gym_id", gymId).single().then(({data})=>setAct(data));
    supabase.from("v_gym_equipment_completeness").select("*").eq("gym_id", gymId).single().then(({data})=>setEq(data));
    supabase.from("v_gym_poster_freshness").select("*").eq("gym_id", gymId).single().then(({data})=>setPf(data));
  }, [gymId]);

  if (isAdmin === false) return <div style={{padding:24}}>Unauthorized</div>;
  if (isAdmin === null)  return <div style={{padding:24}}>Checking…</div>;

  return (
    <div style={{padding:24}}>
      <h1>Gym Admin</h1>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12}}>
        <Kpi label="Active members" value={act?.active_members ?? act?.total_members ?? 0}/>
        <Kpi label="Active coaches" value={act?.active_coaches ?? act?.total_coaches ?? 0}/>
        <Kpi label="Workouts (30d)" value={act?.workouts_30d ?? act?.total_workouts_last_30_days ?? 0}/>
        <Kpi label="Equipment coverage" value={(eq?.overrides_coverage_pct ?? eq?.configuration_completeness_pct ?? 0) + '%'} />
        <Kpi label="Poster status" value={pf?.freshness_status ?? 'unknown'} />
        <Kpi label="Last poster check" value={pf?.last_poster_check ?? pf?.last_poster_proof_at ?? '—'} />
      </div>

      <section style={{marginTop:16}}>
        <h3>QR Codes</h3>
        <QRButtons gymId={gymId!}/>
      </section>
    </div>
  );
}

function Kpi({label, value}:{label:string; value:any}) {
  return <div style={{border:"1px solid #eee", padding:12}}><div>{label}</div><div style={{fontSize:22}}>{value}</div></div>;
}

function QRButtons({gymId}:{gymId:string}) {
  async function make(kind:"gym_member"|"coach_to_gym") {
    const { data, error } = await supabase.rpc("create_join_code", { p_kind: kind, p_gym: gymId });
    if (error) return alert(error.message);
    const link = `${location.origin}/join/${data}`;
    navigator.clipboard.writeText(link);
    alert(`Copied: ${link}`);
  }
  return (
    <>
      <button onClick={()=>make("gym_member")}>Create Member QR</button>
      <button onClick={()=>make("coach_to_gym")} style={{marginLeft:8}}>Create Coach QR</button>
    </>
  );
}