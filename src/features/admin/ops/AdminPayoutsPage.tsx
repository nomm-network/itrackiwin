import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPayoutsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()+1);

  async function exportCSV() {
    const { data, error } = await supabase.rpc("export_payouts_csv", { p_year: year, p_month: month });
    if (error) return alert(error.message);
    const blob = new Blob([data ?? ""], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payouts_${year}_${month}.csv`; a.click();
  }

  return (
    <div style={{padding:24}}>
      <h1>Payouts</h1>
      <div>
        <input type="number" value={year} onChange={e=>setYear(+e.target.value)} />
        <input type="number" value={month} min={1} max={12} onChange={e=>setMonth(+e.target.value)} />
        <button onClick={exportCSV}>Export CSV</button>
      </div>
    </div>
  );
}