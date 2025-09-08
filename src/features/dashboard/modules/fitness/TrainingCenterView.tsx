export default function TrainingCenterView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Training Center</h2>
        <p className="text-muted-foreground">Start/continue workouts, templates, warmups.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Quick Start</h3>
          <p className="text-sm text-muted-foreground mb-4">Jump into a workout immediately</p>
          <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-primary/90 transition-colors">
            Start Workout
          </button>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Templates</h3>
          <p className="text-sm text-muted-foreground mb-4">Browse and use workout templates</p>
          <button className="w-full bg-secondary text-secondary-foreground rounded-lg py-2 px-4 hover:bg-secondary/80 transition-colors">
            View Templates
          </button>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Programs</h3>
          <p className="text-sm text-muted-foreground mb-4">Follow structured training programs</p>
          <button className="w-full bg-secondary text-secondary-foreground rounded-lg py-2 px-4 hover:bg-secondary/80 transition-colors">
            Browse Programs
          </button>
        </div>
      </div>
    </div>
  );
}