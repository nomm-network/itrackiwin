export default function ReadinessView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Readiness</h2>
        <p className="text-muted-foreground">Daily check-ins, score breakdown, trends.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Today's Score</h3>
          <div className="text-3xl font-bold text-primary mb-2">8.2</div>
          <p className="text-sm text-muted-foreground">Ready for intense training</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Sleep Quality</h3>
          <div className="text-2xl font-bold mb-2">7.5 hrs</div>
          <p className="text-sm text-muted-foreground">Good recovery sleep</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Stress Level</h3>
          <div className="text-2xl font-bold mb-2">Low</div>
          <p className="text-sm text-muted-foreground">Optimal for training</p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Weekly Trend</h3>
        <div className="h-32 bg-muted rounded flex items-center justify-center">
          <span className="text-muted-foreground">Readiness chart placeholder</span>
        </div>
      </div>
    </div>
  );
}