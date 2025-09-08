export default function FriendsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Friends</h2>
        <p className="text-muted-foreground">Goals, quality time, check-ins.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Connections</h3>
          <div className="space-y-3">
            {['Alex', 'Jamie', 'Taylor', 'Morgan'].map(friend => (
              <div key={friend} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{friend[0]}</span>
                  </div>
                  <span className="font-medium">{friend}</span>
                </div>
                <span className="text-sm text-muted-foreground">2 days ago</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Shared Goals</h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">Weekend Hike</div>
              <div className="text-sm text-muted-foreground">With Alex & Jamie</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">Monthly Game Night</div>
              <div className="text-sm text-muted-foreground">Friend group tradition</div>
            </div>
            <button className="w-full p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Add New Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}