import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewportTestSuite from "@/components/mobile/ViewportTestSuite";
import MobileRestTimer from "@/components/fitness/MobileRestTimer";
import SwipeToCompleteSet from "@/components/mobile/SwipeToCompleteSet";
import TouchOptimizedSetInput from "@/components/workout/TouchOptimizedSetInput";
import { Dumbbell, Timer, Smartphone, Target, Check } from "lucide-react";
import { toast } from "sonner";

const MobilePolishDemo: React.FC = () => {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(60);
  const [currentReps, setCurrentReps] = useState(10);

  React.useEffect(() => {
    document.title = "Mobile Polish Demo | iTrack.iWin";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Demonstration of mobile-first responsive design and touch-optimized UI components for fitness tracking.');
    document.head.appendChild(desc);
  }, []);

  const handleCompleteSet = () => {
    toast.success("Set completed!", { description: "Great work! Rest timer started." });
    setShowRestTimer(true);
  };

  const handleCancelSet = () => {
    toast.error("Set cancelled", { description: "No worries, try again when ready." });
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    toast.success("Rest complete!", { description: "Ready for your next set." });
  };

  return (
    <main className="container p-fluid-s space-y-fluid-m pb-safe-area-bottom">
      {/* Header */}
      <div className="space-y-fluid-xs">
        <div className="flex items-center justify-between">
          <h1 className="text-fluid-3xl font-bold">Mobile Polish Demo</h1>
          <Badge variant="secondary" className="text-fluid-sm">
            v1.0
          </Badge>
        </div>
        <p className="text-fluid-base text-muted-foreground">
          Demonstration of mobile-first responsive design with fluid typography, 
          touch-optimized interactions, and progressive enhancement.
        </p>
      </div>

      {/* Mobile Rest Timer Demo */}
      {showRestTimer && (
        <MobileRestTimer
          suggestedSeconds={180}
          onComplete={handleRestComplete}
          onSkip={() => setShowRestTimer(false)}
          isActive={true}
        />
      )}

      <Tabs defaultValue="responsive" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-fluid-s">
          <TabsTrigger value="responsive" className="text-fluid-sm">Responsive</TabsTrigger>
          <TabsTrigger value="touch" className="text-fluid-sm">Touch UI</TabsTrigger>
          <TabsTrigger value="swipe" className="text-fluid-sm">Gestures</TabsTrigger>
          <TabsTrigger value="typography" className="text-fluid-sm">Typography</TabsTrigger>
        </TabsList>

        {/* Responsive Design Testing */}
        <TabsContent value="responsive" className="space-y-fluid-s">
          <ViewportTestSuite />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                CSS Grid Responsive Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-fluid-s">
                <div>
                  <h4 className="text-fluid-lg font-medium mb-fluid-xs">Auto-fit Grid</h4>
                  <div className="grid-auto-fit">
                    {Array.from({ length: 6 }, (_, i) => (
                      <Card key={i} className="p-fluid-s">
                        <div className="text-center">
                          <div className="text-fluid-xl font-bold">Card {i + 1}</div>
                          <div className="text-fluid-sm text-muted-foreground">Auto-sizing</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-fluid-lg font-medium mb-fluid-xs">Mobile Stack Grid</h4>
                  <div className="grid-mobile-stack">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Card key={i} className="p-fluid-s">
                        <div className="text-center">
                          <div className="text-fluid-lg font-bold">Item {i + 1}</div>
                          <div className="text-fluid-sm text-muted-foreground">Responsive stacking</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Touch-Optimized UI */}
        <TabsContent value="touch" className="space-y-fluid-s">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Touch Target Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-fluid-s">
              <div>
                <h4 className="text-fluid-base font-medium mb-fluid-xs">Touch-Optimized Set Input</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-s">
                  <TouchOptimizedSetInput
                    value={currentWeight}
                    onChange={setCurrentWeight}
                    label="Weight"
                    suffix="kg"
                    step={2.5}
                    min={0}
                    max={300}
                  />
                  <TouchOptimizedSetInput
                    value={currentReps}
                    onChange={setCurrentReps}
                    label="Reps"
                    suffix="reps"
                    step={1}
                    min={1}
                    max={50}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-fluid-base font-medium mb-fluid-xs">Touch Target Sizes</h4>
                <div className="space-y-fluid-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" className="h-8">32px (too small)</Button>
                    <Button size="sm" className="h-10">40px (borderline)</Button>
                    <Button size="sm" className="touch-target">44px (minimum)</Button>
                    <Button size="sm" className="touch-target-comfortable">48px (comfortable)</Button>
                  </div>
                  <p className="text-fluid-sm text-muted-foreground">
                    Apple recommends 44px minimum, Google recommends 48px for optimal accessibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Swipe Gestures */}
        <TabsContent value="swipe" className="space-y-fluid-s">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Swipe Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-fluid-s">
              <div>
                <h4 className="text-fluid-base font-medium mb-fluid-xs">Swipe to Complete Set</h4>
                <SwipeToCompleteSet
                  onComplete={handleCompleteSet}
                  onCancel={handleCancelSet}
                >
                  <div className="flex items-center gap-fluid-xs">
                    <div>
                      <div className="font-medium">Bench Press</div>
                      <div className="text-fluid-sm text-muted-foreground">
                        {currentWeight}kg × {currentReps} reps
                      </div>
                    </div>
                  </div>
                </SwipeToCompleteSet>
              </div>

              <div>
                <h4 className="text-fluid-base font-medium mb-fluid-xs">Workout History Cards</h4>
                <p className="text-fluid-sm text-muted-foreground mb-fluid-xs">
                  Swipe left to reveal actions, swipe right to mark complete.
                </p>
                
                {Array.from({ length: 3 }, (_, i) => (
                  <SwipeToCompleteSet
                    key={i}
                    onComplete={() => toast.success(`Workout ${i + 1} completed!`)}
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">Push Day #{i + 1}</div>
                        <div className="text-fluid-sm text-muted-foreground">
                          45 min • 12 exercises
                        </div>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </SwipeToCompleteSet>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluid Typography */}
        <TabsContent value="typography" className="space-y-fluid-s">
          <Card>
            <CardHeader>
              <CardTitle>Fluid Typography System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-fluid-s">
              <div className="space-y-fluid-xs">
                <h1 className="text-fluid-4xl font-bold">Heading 1 (fluid-4xl)</h1>
                <h2 className="text-fluid-3xl font-bold">Heading 2 (fluid-3xl)</h2>
                <h3 className="text-fluid-2xl font-semibold">Heading 3 (fluid-2xl)</h3>
                <h4 className="text-fluid-xl font-semibold">Heading 4 (fluid-xl)</h4>
                <h5 className="text-fluid-lg font-medium">Heading 5 (fluid-lg)</h5>
                <p className="text-fluid-base">Body text using fluid-base for optimal readability.</p>
                <p className="text-fluid-sm text-muted-foreground">Small text using fluid-sm for secondary content.</p>
              </div>

              <div className="p-fluid-s bg-muted/20 rounded-lg">
                <h4 className="text-fluid-base font-medium mb-2">Fluid Spacing Examples</h4>
                <div className="space-y-fluid-xs">
                  <div className="p-fluid-3xs bg-primary/20 rounded text-center text-fluid-sm">p-fluid-3xs</div>
                  <div className="p-fluid-2xs bg-primary/20 rounded text-center text-fluid-sm">p-fluid-2xs</div>
                  <div className="p-fluid-xs bg-primary/20 rounded text-center text-fluid-sm">p-fluid-xs</div>
                  <div className="p-fluid-s bg-primary/20 rounded text-center text-fluid-sm">p-fluid-s</div>
                  <div className="p-fluid-m bg-primary/20 rounded text-center text-fluid-sm">p-fluid-m</div>
                </div>
              </div>

              <div className="text-fluid-sm text-muted-foreground">
                <p>
                  All typography and spacing uses CSS <code>clamp()</code> functions to scale 
                  smoothly between viewport sizes, ensuring optimal readability and layout 
                  on all devices from 320px to 1920px+.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Mobile Performance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-xs">
            {[
              { label: "Responsive breakpoints (360px, 375px, 414px, 768px, 1024px)", status: "✅" },
              { label: "Touch targets ≥44px", status: "✅" },
              { label: "Fluid typography with clamp()", status: "✅" },
              { label: "CSS Grid responsive layout", status: "✅" },
              { label: "Swipe gestures for interactions", status: "✅" },
              { label: "Safe area handling (notches)", status: "✅" },
              { label: "Reduced motion preferences", status: "✅" },
              { label: "Haptic feedback simulation", status: "✅" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-fluid-sm">
                <span className="text-fluid-lg">{item.status}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20 md:h-0" />
    </main>
  );
};

export default MobilePolishDemo;