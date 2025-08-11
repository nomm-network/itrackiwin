import React from "react";
import PageNav from "@/components/PageNav";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkoutDetail } from "@/features/fitness/api";

const WorkoutDetail: React.FC = () => {
  const { id } = useParams();
  const { data } = useWorkoutDetail(id);

  React.useEffect(() => {
    document.title = "Workout Details | I Track I Win";
  }, []);

  return (
    <>
      <PageNav current="Workout Details" />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-semibold">{data?.workout?.title || 'Workout'}</h1>
        {(data?.exercises || []).map(ex => (
          <Card key={ex.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exercise: {ex.exercise_id}</CardTitle>
              <CardDescription>Order {ex.order_index}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {(data?.setsByWe[ex.id] || []).map(s => (
                  <div key={s.id} className="flex gap-4">
                    <span>Set {s.set_index}</span>
                    <span>{s.weight ?? '-'} {s.weight ? s.weight_unit : ''}</span>
                    <span>x {s.reps ?? '-'}</span>
                    <span>RPE {s.rpe ?? '-'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </>
  );
};

export default WorkoutDetail;
