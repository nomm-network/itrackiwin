import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function TrainingCenterCard() {
  const [busy, setBusy] = useState<false | "template" | "program">(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  async function startFromTemplate(templateId: string) {
    setErr(null); setBusy("template");
    const { data, error } = await supabase.rpc("start_workout", { p_template_id: templateId });
    setBusy(false);
    if (error) return setErr(error.message);
    if (data) nav(`/app/workouts/${data}`);
  }

  async function startFromProgram(programId: string) {
    setErr(null); setBusy("program");
    // Get next program block and start workout from that template
    const { data: nextBlock, error: e1 } = await supabase
      .rpc("get_next_program_block", { _user_id: (await supabase.auth.getUser()).data.user?.id });
    if (e1) { setBusy(false); return setErr(e1.message); }

    if (!nextBlock?.[0]?.workout_template_id) {
      setBusy(false);
      return setErr("No next workout found in program");
    }

    const { data, error } = await supabase.rpc("start_workout", { p_template_id: nextBlock[0].workout_template_id });
    setBusy(false);
    if (error) return setErr(error.message);
    if (data) nav(`/app/workouts/${data}`);
  }

  return (
    <div className="rounded-xl bg-[#0f1f1b] border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Training Center</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <TemplateQuickPick onPick={startFromTemplate} disabled={!!busy}/>
        <ProgramQuickPick onPick={startFromProgram} disabled={!!busy}/>
      </div>

      {err && <div className="mt-3 text-sm text-red-400">Start failed: {err}</div>}
    </div>
  );
}

function TemplateQuickPick({ onPick, disabled }:{onPick:(id:string)=>void; disabled:boolean;}) {
  const [open,setOpen]=useState(false);
  const [items,setItems]=useState<{id:string; name:string}[]>([]);
  async function load() {
    setOpen(true);
    if (items.length) return;
    const { data } = await supabase.from("workout_templates").select("id,name").order("updated_at",{ascending:false}).limit(12);
    setItems(data?.map(d=>({id:d.id,name:d.name})) ?? []);
  }
  return (
    <div className="rounded-lg bg-[#0d1a17] border border-white/10 p-3">
      <div className="text-sm opacity-80 mb-2">Start from Template</div>
      <button disabled={disabled} onClick={load} className="w-full rounded-md bg-emerald-500/90 hover:bg-emerald-500 px-3 py-2 font-medium">
        Pick Template
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map(t=>(
            <button key={t.id} onClick={()=>onPick(t.id)} className="w-full rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-left">
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramQuickPick({ onPick, disabled }:{onPick:(id:string)=>void; disabled:boolean;}) {
  const [open,setOpen]=useState(false);
  const [items,setItems]=useState<{id:string; name:string}[]>([]);
  async function load() {
    setOpen(true);
    if (items.length) return;
    const { data } = await supabase.from("training_programs").select("id,name").eq("is_active", true).order("updated_at",{ascending:false}).limit(12);
    setItems(data?.map(d=>({id:d.id,name:d.name})) ?? []);
  }
  return (
    <div className="rounded-lg bg-[#0d1a17] border border-white/10 p-3">
      <div className="text-sm opacity-80 mb-2">Start from Program</div>
      <button disabled={disabled} onClick={load} className="w-full rounded-md bg-indigo-500/90 hover:bg-indigo-500 px-3 py-2 font-medium">
        Pick Program
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map(p=>(
            <button key={p.id} onClick={()=>onPick(p.id)} className="w-full rounded-md bg-white/5 hover:bg-white/10 px-3 py-2 text-left">
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}