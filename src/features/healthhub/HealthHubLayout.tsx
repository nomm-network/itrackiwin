type Props = {
  Header: React.ReactNode;        // title row + "Admin"/"All Categories" chips
  CategoryGrid: React.ReactNode;  // the 2x3 tiles (Fitness, Nutrition, Sleep, Medical, Energy, Configure)
  Primary: React.ReactNode;       // the main card area for the active sub
  Quick: React.ReactNode;         // Quick Actions row
};

export default function HealthHubLayout({ Header, CategoryGrid, Primary, Quick }: Props) {
  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <section className="space-y-1 sm:space-y-2">
        {Header}
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your progress across all areas of life.
        </p>
      </section>

      {/* Category Grid (Orbit Planets) */}
      <section className="hh-grid">{CategoryGrid}</section>

      {/* Primary Content Area */}
      <section className="hh-primary">{Primary}</section>

      {/* Quick Actions */}
      <section className="hh-quick">{Quick}</section>
    </div>
  );
}