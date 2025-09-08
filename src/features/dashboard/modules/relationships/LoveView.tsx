export default function LoveView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Love</h2>
        <p className="text-muted-foreground">Couple goals, date ideas, shared streaks.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Date Streak</h3>
          <div className="text-3xl font-bold text-red-500 mb-2">12</div>
          <p className="text-sm text-muted-foreground">Consecutive weeks with quality time</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Next Date</h3>
          <div className="text-lg font-medium mb-2">Cooking Class</div>
          <p className="text-sm text-muted-foreground">This Friday evening</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Love Languages</h3>
          <div className="text-sm space-y-1">
            <div>Quality Time ❤️</div>
            <div>Physical Touch 💕</div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Date Ideas</h3>
          <div className="space-y-2">
            {[
              "Sunset picnic in the park",
              "Try new restaurant downtown", 
              "Movie night at home",
              "Weekend hiking trip"
            ].map((idea, i) => (
              <div key={i} className="p-2 bg-muted rounded text-sm">{idea}</div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Shared Goals</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-medium">Plan Anniversary Trip</div>
              <div className="text-sm text-muted-foreground">Research destinations</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium">Learn Salsa Dancing</div>
              <div className="text-sm text-muted-foreground">Weekly lessons</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}