import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tablet, Monitor, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewportTestCase {
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'desktop';
  icon: React.ComponentType<{ className?: string }>;
}

const testViewports: ViewportTestCase[] = [
  { name: "Ultra Compact", width: 320, height: 568, category: 'mobile', icon: Smartphone },
  { name: "iPhone SE", width: 375, height: 667, category: 'mobile', icon: Smartphone },
  { name: "iPhone 12", width: 390, height: 844, category: 'mobile', icon: Smartphone },
  { name: "iPhone 14 Pro", width: 414, height: 896, category: 'mobile', icon: Smartphone },
  { name: "iPad Mini", width: 768, height: 1024, category: 'tablet', icon: Tablet },
  { name: "Desktop", width: 1024, height: 768, category: 'desktop', icon: Monitor },
];

interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
}

export const ViewportTestSuite: React.FC = () => {
  const [currentViewport, setCurrentViewport] = useState<ViewportInfo | null>(null);
  const [selectedTest, setSelectedTest] = useState<ViewportTestCase | null>(null);

  useEffect(() => {
    const updateViewportInfo = () => {
      setCurrentViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    window.addEventListener('orientationchange', updateViewportInfo);

    return () => {
      window.removeEventListener('resize', updateViewportInfo);
      window.removeEventListener('orientationchange', updateViewportInfo);
    };
  }, []);

  const simulateViewport = (viewport: ViewportTestCase) => {
    setSelectedTest(viewport);
    // In a real implementation, this would resize the iframe or container
    // For demo purposes, we'll just highlight the selected viewport
  };

  const getCurrentViewportCategory = (): string => {
    if (!currentViewport) return 'unknown';
    
    if (currentViewport.width < 360) return 'ultra-compact';
    if (currentViewport.width < 414) return 'compact-mobile';
    if (currentViewport.width < 768) return 'large-mobile';
    if (currentViewport.width < 1024) return 'tablet';
    return 'desktop';
  };

  const getViewportQuality = (): { score: number; issues: string[] } => {
    if (!currentViewport) return { score: 0, issues: ['Unable to detect viewport'] };
    
    const issues: string[] = [];
    let score = 100;

    // Check for common mobile issues
    if (currentViewport.width < 360) {
      issues.push('Very narrow viewport may cause layout issues');
      score -= 20;
    }

    if (currentViewport.width > 414 && currentViewport.width < 768 && currentViewport.orientation === 'portrait') {
      issues.push('Large mobile portrait view should use available space efficiently');
      score -= 10;
    }

    if (!currentViewport.touchSupport && currentViewport.width < 768) {
      issues.push('Small viewport without touch support detected');
      score -= 15;
    }

    if (currentViewport.devicePixelRatio < 2 && currentViewport.width < 414) {
      issues.push('Low DPI mobile device - ensure text remains readable');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  };

  const quality = getViewportQuality();

  return (
    <div className="space-y-fluid-s">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Viewport Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Viewport Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-fluid-xs mb-fluid-s">
            <div className="text-center p-fluid-xs border rounded-lg">
              <div className="text-fluid-lg font-bold">{currentViewport?.width || '?'}</div>
              <div className="text-fluid-sm text-muted-foreground">Width</div>
            </div>
            <div className="text-center p-fluid-xs border rounded-lg">
              <div className="text-fluid-lg font-bold">{currentViewport?.height || '?'}</div>
              <div className="text-fluid-sm text-muted-foreground">Height</div>
            </div>
            <div className="text-center p-fluid-xs border rounded-lg">
              <div className="text-fluid-lg font-bold">{currentViewport?.devicePixelRatio || '?'}</div>
              <div className="text-fluid-sm text-muted-foreground">DPR</div>
            </div>
            <div className="text-center p-fluid-xs border rounded-lg">
              <div className="text-fluid-lg font-bold capitalize">{currentViewport?.orientation || '?'}</div>
              <div className="text-fluid-sm text-muted-foreground">Orient</div>
            </div>
          </div>

          {/* Viewport Quality Score */}
          <div className="mb-fluid-s">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-sm font-medium">Mobile Optimization Score</span>
              <Badge variant={quality.score >= 80 ? 'default' : quality.score >= 60 ? 'secondary' : 'destructive'}>
                {quality.score}/100
              </Badge>
            </div>
            {quality.issues.length > 0 && (
              <div className="space-y-1">
                {quality.issues.map((issue, index) => (
                  <div key={index} className="text-fluid-sm text-muted-foreground">
                    • {issue}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Viewports */}
          <div className="space-y-fluid-xs">
            <h4 className="text-fluid-sm font-medium">Test Viewports</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {testViewports.map((viewport) => {
                const Icon = viewport.icon;
                const isActive = selectedTest?.name === viewport.name;
                
                return (
                  <Button
                    key={viewport.name}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => simulateViewport(viewport)}
                    className={cn(
                      "h-auto p-fluid-xs flex flex-col items-center gap-1 touch-target",
                      isActive && "ring-2 ring-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-xs font-medium">{viewport.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {viewport.width}×{viewport.height}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Current Category Badge */}
          <div className="mt-fluid-s pt-fluid-s border-t">
            <div className="flex items-center justify-between">
              <span className="text-fluid-sm">Current Category:</span>
              <Badge variant="secondary" className="capitalize">
                {getCurrentViewportCategory().replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-specific touch targets test */}
      <Card>
        <CardHeader>
          <CardTitle>Touch Target Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-fluid-xs">
            <p className="text-fluid-sm text-muted-foreground">
              Test touch targets on various device sizes. Minimum recommended size is 44px.
            </p>
            
            <div className="grid grid-cols-4 gap-2">
              <Button size="sm" className="h-8 touch-manipulation">32px</Button>
              <Button size="sm" className="h-10 touch-manipulation">40px</Button>
              <Button size="sm" className="touch-target touch-manipulation">44px</Button>
              <Button size="sm" className="touch-target-comfortable touch-manipulation">48px</Button>
            </div>
            
            <div className="text-fluid-sm text-muted-foreground">
              Try tapping these buttons on different devices to test accessibility.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewportTestSuite;