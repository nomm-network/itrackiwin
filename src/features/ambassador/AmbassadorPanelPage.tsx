import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AmbassadorPanelPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [stm, setStm] = useState<any[]>([]);
  const [ym, setYM] = useState<[number,number]>(() => {
    const d = new Date(); return [d.getFullYear(), d.getMonth()+1];
  });

  async function load() {
    const [{data: i}, {data: s}] = await Promise.all([
      supabase.from("battle_invitations").select("*").eq("status","pending"),
      supabase.from("v_ambassador_summary").select("*"),
    ]);
    setInvites(i ?? []); setSummary(s ?? []);
  }
  async function accept(invId:string, action:"accept"|"decline") {
    await supabase.rpc("battle_respond_invite", { p_invitation: invId, p_action: action });
    await load();
  }
  async function loadStatements() {
    const { data } = await supabase
      .from("v_ambassador_statements")
      .select("*")
      .eq("year", ym[0]).eq("month", ym[1]);
    setStm(data ?? []);
  }

  useEffect(()=>{ load(); }, []);
  useEffect(()=>{ loadStatements(); }, [ym]);

  return (
    <div style={{padding:24}}>
      <h1>Ambassador Panel</h1>

      <section>
        <h3>Invitations</h3>
        {invites.length===0 ? <div>No invites.</div> : invites.map(i =>
          <div key={i.id} style={{marginBottom:8}}>
            <span>Battle: {i.battle_id}</span>
            <button onClick={()=>accept(i.id,'accept')}>Accept</button>
            <button onClick={()=>accept(i.id,'decline')}>Decline</button>
          </div>
        )}
      </section>

      <section>
        <h3>My KPIs</h3>
        <pre>{JSON.stringify(summary[0] ?? {}, null, 2)}</pre>
      </section>

      <section>
        <h3>Statements</h3>
        <div>
          <input type="number" value={ym[0]} onChange={e=>setYM([+e.target.value, ym[1]])}/>
          <input type="number" value={ym[1]} min={1} max={12} onChange={e=>setYM([ym[0], +e.target.value])}/>
        </div>
        <pre>{JSON.stringify(stm, null, 2)}</pre>
      </section>
    </div>
  );
}