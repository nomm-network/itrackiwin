import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function AdminBattlesListPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("battles").select("*").order("starts_at", { ascending: false })
      .then(({data}) => setRows(data ?? []));
  }, []);
  return (
    <div style={{padding:24}}>
      <h1>Battles</h1>
      <Link to="new" className="btn">Create Battle</Link>
      <ul>{rows.map(b => <li key={b.id}><Link to={b.id}>{b.name}</Link> &nbsp;({b.status})</li>)}</ul>
    </div>
  );
}