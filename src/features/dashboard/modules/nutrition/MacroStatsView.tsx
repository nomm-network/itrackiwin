export default function MacroStatsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Macro Stats</h2>
        <p className="text-muted-foreground">Macros per day/week; targets.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Protein</h3>
          <div className="text-2xl font-bold text-blue-600 mb-2">120g</div>
          <div className="text-sm text-muted-foreground">Target: 140g</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Carbs</h3>
          <div className="text-2xl font-bold text-green-600 mb-2">180g</div>
          <div className="text-sm text-muted-foreground">Target: 220g</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '82%'}}></div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Fat</h3>
          <div className="text-2xl font-bold text-orange-600 mb-2">65g</div>
          <div className="text-sm text-muted-foreground">Target: 80g</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-orange-600 h-2 rounded-full" style={{width: '81%'}}></div>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Weekly Trends</h3>
        <div className="h-40 bg-muted rounded flex items-center justify-center">
          <span className="text-muted-foreground">Macro trends chart placeholder</span>
        </div>
      </div>
    </div>
  );
}