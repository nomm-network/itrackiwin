import { TestBottomNavRPC } from '@/components/test/TestBottomNavRPC';
import { NavigationSettings } from '@/components/settings/NavigationSettingsWithCoaches';
import { DynamicBottomNav } from '@/components/navigation/DynamicBottomNav';
import { CoachTestingComponent } from '@/components/test/CoachTestingComponent';
import { AtlasTestingComponent } from '@/components/test/AtlasTestingComponent';

export default function TestPage() {
  return (
    <main className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Dynamic Navigation Test Page</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">RPC Function Test</h2>
        <TestBottomNavRPC />
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Coach Selection Test</h2>
        <CoachTestingComponent />
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Atlas Implementation Test</h2>
        <AtlasTestingComponent />
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Navigation Settings with Coach Selection</h2>
        <NavigationSettings />
      </section>
      
      <section className="pb-20">
        <h2 className="text-xl font-semibold mb-4">Test Content</h2>
        <p>This page tests the dynamic bottom navigation. Check the bottom of the screen to see the navigation in action.</p>
        <div className="h-96 bg-muted rounded p-4">
          <p>Scroll to test the fixed bottom navigation...</p>
        </div>
      </section>
    </main>
  );
}