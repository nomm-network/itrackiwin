export default function WorkoutHistoryView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Workout History</h2>
        <p className="text-muted-foreground">Compact summaries of past sessions.</p>
      </div>
      
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h3 className="font-semibold">Recent Workouts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <div className="font-medium">Upper Body Strength</div>
                  <div className="text-sm text-muted-foreground">2 days ago • 45 min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">8 exercises</div>
                  <div className="text-sm text-muted-foreground">3.2k total weight</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}