export default function MealLogView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meal Log</h2>
        <p className="text-muted-foreground">Manual entries; placeholder for food-detect API.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Today's Meals</h3>
          <div className="space-y-3">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(meal => (
              <div key={meal} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="font-medium">{meal}</span>
                <button className="text-primary hover:text-primary/80 text-sm">
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Daily Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Calories</span>
              <span className="font-medium">1,850 / 2,200</span>
            </div>
            <div className="flex justify-between">
              <span>Protein</span>
              <span className="font-medium">120g / 140g</span>
            </div>
            <div className="flex justify-between">
              <span>Carbs</span>
              <span className="font-medium">180g / 220g</span>
            </div>
            <div className="flex justify-between">
              <span>Fat</span>
              <span className="font-medium">65g / 80g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}