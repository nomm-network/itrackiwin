import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { usePersonalRecords, useRecentWorkouts } from "@/features/fitness/api";

const History: React.FC = () => {
  const { data: workouts } = useRecentWorkouts(50);
  const { data: prs } = usePersonalRecords();

  React.useEffect(() => {
    document.title = "Workout History | I Track I Win";
  }, []);

  return (
    <>
      <PageNav current="History" />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Workout History</h1>
        <section className="grid md:grid-cols-2 gap-4">
          {(workouts ?? []).map(w => (
            <Link key={w.id} to={`/fitness/history/${w.id}`}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{w.title || 'Free Session'}</CardTitle>
                  <CardDescription>
                    {new Date(w.started_at).toLocaleString()} • {w.ended_at ? 'Completed' : 'In progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tap to view details</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="font-medium mb-3">Recent Personal Records</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {(prs ?? []).slice(0, 10).map(pr => (
              <Card key={pr.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pr.kind} — {pr.value} {pr.unit || ''}</CardTitle>
                  <CardDescription>{new Date(pr.achieved_at).toLocaleString()}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {(!prs || prs.length === 0) && <p className="text-sm text-muted-foreground">No PRs yet.</p>}
          </div>
        </section>
      </main>
    </>
  );
};

export default History;
