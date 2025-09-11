import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResolveResult } from '@/lib/loadout/resolveLoadout';

interface LoadoutDetail {
  snap: ResolveResult;
  loadType: string;
  title?: string;
}

export function LoadoutModal() {
  const [detail, setDetail] = useState<LoadoutDetail | null>(null);

  useEffect(() => {
    const handleOpenLoadout = (e: CustomEvent<LoadoutDetail>) => {
      setDetail(e.detail);
    };

    window.addEventListener('open-loadout', handleOpenLoadout as EventListener);
    return () => window.removeEventListener('open-loadout', handleOpenLoadout as EventListener);
  }, []);

  if (!detail) return null;

  const { snap, loadType, title } = detail;

  return (
    <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || 'Load Configuration'}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Total Weight: <span className="text-primary">{snap.totalSystemWeight}</span>
            </CardTitle>
            {snap.matchQuality !== 'exact' && (
              <Badge variant={snap.matchQuality === 'nearestUp' ? 'default' : 'secondary'}>
                {snap.matchQuality === 'nearestUp' ? 'Rounded Up' : 'Rounded Down'}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Barbell Configuration */}
            {snap.perSidePlates && snap.perSidePlates.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Per Side Plates:</h4>
                <div className="flex gap-2 flex-wrap">
                  {snap.perSidePlates.map((weight, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {weight}
                    </Badge>
                  ))}
                </div>
                {snap.perSidePlates.length === 0 && (
                  <p className="text-muted-foreground text-sm">Bar only</p>
                )}
              </div>
            )}

            {/* Stack Machine Configuration */}
            {snap.machineDisplay != null && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Stack Setting:</h4>
                    <Badge className="text-lg">{snap.machineDisplay}</Badge>
                  </div>
                  
                  {snap.usedAddOns && snap.usedAddOns.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Add-ons:</h4>
                      <div className="flex gap-1 flex-wrap">
                        {snap.usedAddOns.map((addon, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            +{addon}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fixed Weight Configuration */}
            {loadType === 'fixed' && !snap.perSidePlates && snap.machineDisplay == null && (
              <div>
                <h4 className="font-medium mb-2">Fixed Weight Selected:</h4>
                <Badge className="text-lg">{snap.totalSystemWeight}</Badge>
              </div>
            )}

            {/* Loading Tips */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {loadType === 'dual_load' && 'Load plates symmetrically on both sides'}
                {loadType === 'stack' && 'Set pin at indicated position and attach any add-ons'}
                {loadType === 'fixed' && 'Use the indicated fixed weight'}
                {loadType === 'single_load' && 'Single implement - load as shown'}
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to trigger the modal
export function openLoadoutModal(snap: ResolveResult, loadType: string, title?: string) {
  window.dispatchEvent(
    new CustomEvent('open-loadout', {
      detail: { snap, loadType, title }
    })
  );
}