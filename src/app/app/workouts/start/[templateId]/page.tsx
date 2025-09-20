// readiness-classic wrapper — SOT (keep this the ONLY start route)
"use client";

import { useNavigate, useParams } from "react-router-dom";
import EnhancedReadinessCheckIn from "@/components/fitness/EnhancedReadinessCheckIn";
import { useReadinessStore } from "@/stores/readinessStore";
import { useWorkoutLaunchers } from "@/features/training/hooks/useLaunchers";
import { useState } from "react";

export default function StartWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const setReadiness = useReadinessStore((s) => s.setReadiness);
  const setScore = useReadinessStore((s) => s.setScore);
  const { startFromTemplate } = useWorkoutLaunchers();
  const [debug, setDebug] = useState<any>({ version: "readiness-classic-bridge v1.0", templateId });

  return (
    <div className="mx-auto max-w-md p-5">
      <EnhancedReadinessCheckIn
        onCancel={() => navigate(-1)}
        onSubmit={async (data) => {
          // store legacy readiness in zustand (v90 pattern)
          setReadiness({
            energy: data.energy,
            soreness: data.soreness,
            sleepQuality: data.sleepQuality,
            sleepHours: data.sleepHours,
            stress: data.stress,
            preworkout: data.preworkout
          });
          // v90 wrote score as 0–100; keep that to match your old start hook behavior
          setScore((data.energy ?? 7) * 10);

          setDebug((d: any) => ({ ...d, submit: data }));
          const workoutId = await startFromTemplate(templateId as string);
          setDebug((d: any) => ({ ...d, workoutId }));

          navigate(`/app/workouts/${workoutId}`, { replace: true });
        }}
      />

      {/* DEBUG PANEL — leave it in until you confirm end-to-end */}
      <div className="mt-4 rounded-xl border border-[#223048] bg-[#0E1726] p-3 text-xs text-[#9AA4B2]">
        <div className="font-semibold text-[#E5E7EB]">Debug</div>
        <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
      </div>
    </div>
  );
}
