export default function FamilyView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Family</h2>
        <p className="text-muted-foreground">Shared goals, routines, events.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Family Calendar</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium">Mom's Birthday</div>
              <div className="text-sm text-muted-foreground">This Saturday</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium">Family Dinner</div>
              <div className="text-sm text-muted-foreground">Every Sunday</div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="font-medium">Kids Soccer Game</div>
              <div className="text-sm text-muted-foreground">Next Tuesday</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Family Goals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Weekly Game Night</span>
              <div className="text-sm text-green-600 font-medium">3/4 weeks</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Outdoor Adventures</span>
              <div className="text-sm text-blue-600 font-medium">2/3 this month</div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Set Family Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}