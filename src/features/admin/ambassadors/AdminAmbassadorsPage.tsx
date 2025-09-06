import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAmbassadorsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("v_ambassador_summary").select("*").then(({data}) => setRows(data ?? []));
  }, []);
  return (
    <div style={{padding:24}}>
      <h1>Ambassadors</h1>
      <table>
        <thead>
          <tr><th>User</th><th>Status</th><th>Verified deals</th><th>Visits</th><th>Last visit</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.ambassador_id}>
              <td>{r.user_id}</td>
              <td>{r.status}</td>
              <td>{r.verified_deals_total ?? r.gyms_signed ?? 0}</td>
              <td>{r.total_gym_visits ?? 0}</td>
              <td>{r.last_visit_at ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}