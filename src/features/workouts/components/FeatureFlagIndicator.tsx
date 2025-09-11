import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlag } from '@/lib/equipment/featureFlags';

interface FeatureFlagIndicatorProps {
  className?: string;
}

export function FeatureFlagIndicator({ className }: FeatureFlagIndicatorProps) {
  const [v2Enabled, setV2Enabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getFeatureFlag('gym_equipment_v2').then(setV2Enabled);
  }, []);

  if (v2Enabled === null) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className || ''}`}>
      <Badge 
        variant={v2Enabled ? "default" : "outline"}
        className="text-xs"
      >
        Equipment v{v2Enabled ? '2' : '1'}
      </Badge>
    </div>
  );
}

// Debug component for development/QA
export function EquipmentDebugPanel() {
  const [flags, setFlags] = React.useState<{ [key: string]: boolean }>({});
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const checkFlags = async () => {
      const v2 = await getFeatureFlag('gym_equipment_v2');
      setFlags({ gym_equipment_v2: v2 });
    };
    
    if (isVisible) {
      checkFlags();
    }
  }, [isVisible]);

  // Only show in development or when specifically enabled
  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="text-xs"
      >
        Debug
      </Button>
      
      {isVisible && (
        <div className="mt-2 p-3 bg-background border rounded shadow-lg">
          <h4 className="font-medium text-sm mb-2">Feature Flags</h4>
          {Object.entries(flags).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between text-xs mb-1">
              <span>{key}</span>
              <Badge variant={enabled ? "default" : "outline"} className="text-xs">
                {enabled ? 'ON' : 'OFF'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}