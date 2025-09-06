import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBattleDetailPage() {
  const { id } = useParams();
  const [battle, setBattle] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  async function load() {
    const [{data: b}, {data: inv}, {data: parts}] = await Promise.all([
      supabase.from("battles").select("*").eq("id", id).single(),
      supabase.from("battle_invitations").select("*").eq("battle_id", id),
      supabase.from("battle_participants").select("*").eq("battle_id", id),
    ]);
    setBattle(b); setInvitations(inv ?? []); setParticipants(parts ?? []);
  }

  async function computeWinners() {
    const { data, error } = await supabase.rpc("declare_battle_winners", { p_battle: id });
    if (!error) setStandings(data ?? []);
  }

  async function grantBenefits() {
    if (standings.length < 2) return;
    const w1 = standings.find(s => s.rank === 1)?.ambassador_id;
    const w2 = standings.find(s => s.rank === 2)?.ambassador_id;
    await supabase.rpc("grant_winner_benefits", { p_battle: id, p_winner1: w1, p_winner2: w2 });
    await load();
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div style={{padding:24}}>
      <h1>{battle?.name}</h1>
      <h3>Invitations ({invitations.length})</h3>
      <pre>{JSON.stringify(invitations.slice(0,5), null, 2)}</pre>

      <h3>Participants ({participants.length})</h3>
      <pre>{JSON.stringify(participants.slice(0,5), null, 2)}</pre>

      <h3>Standings</h3>
      <button onClick={computeWinners}>Compute Winners</button>
      {standings.length>0 && (
        <>
          <pre>{JSON.stringify(standings, null, 2)}</pre>
          <button onClick={grantBenefits}>Confirm & Grant Benefits</button>
        </>
      )}
    </div>
  );
}