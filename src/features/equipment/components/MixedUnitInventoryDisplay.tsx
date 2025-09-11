// Step 7.3: UI behavior - Inventory screens with Native + Converted columns
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Scale } from 'lucide-react';
import { useMixedUnitGymInventory, useGymMixedUnitSupport } from '@/hooks/useMixedUnitGymInventory';
import { WeightUnit } from '@/lib/equipment/mixedUnits';

interface MixedUnitInventoryDisplayProps {
  gymId: string;
  onAddItem?: (itemType: 'plate' | 'dumbbell') => void;
}

export function MixedUnitInventoryDisplay({ gymId, onAddItem }: MixedUnitInventoryDisplayProps) {
  const { data: inventory, isLoading } = useMixedUnitGymInventory(gymId);
  const { data: supportsMixedUnits } = useGymMixedUnitSupport(gymId);

  if (isLoading) {
    return <div className="animate-pulse">Loading inventory...</div>;
  }

  const plates = inventory?.filter(item => item.item_type === 'plate') || [];
  const dumbbells = inventory?.filter(item => item.item_type === 'dumbbell') || [];

  return (
    <div className="space-y-6">
      {/* Mixed Units Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Mixed Units Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={supportsMixedUnits ? "default" : "secondary"}>
              {supportsMixedUnits ? 'Enabled' : 'Disabled'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {supportsMixedUnits ? 'kg & lb equipment supported' : 'Single unit only'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Plates Inventory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plates</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddItem?.('plate')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Plate
          </Button>
        </CardHeader>
        <CardContent>
          {plates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No plates configured</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Native</div>
                <div>Converted</div>
                <div>Quantity</div>
                <div>Label</div>
                <div>Color</div>
                <div>Actions</div>
              </div>
              
              {/* Inventory Items */}
              {plates.map((plate) => (
                <div key={plate.id} className="grid grid-cols-6 gap-4 py-2 border-b">
                  <div className="font-mono">
                    {plate.native_weight} {plate.native_unit}
                  </div>
                  <div className="font-mono text-muted-foreground">
                    {plate.converted_weight.toFixed(1)} {plate.converted_unit}
                  </div>
                  <div>{plate.quantity} per side</div>
                  <div>
                    {plate.label ? (
                      <Badge variant="outline">{plate.label}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div>
                    {plate.color ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: plate.color }}
                        />
                        <span className="text-sm">{plate.color}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dumbbells Inventory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dumbbells</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddItem?.('dumbbell')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Dumbbell
          </Button>
        </CardHeader>
        <CardContent>
          {dumbbells.length === 0 ? (
            <p className="text-muted-foreground text-sm">No dumbbells configured</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Native</div>
                <div>Converted</div>
                <div>Quantity</div>
                <div>Actions</div>
              </div>
              
              {/* Inventory Items */}
              {dumbbells.map((dumbbell) => (
                <div key={dumbbell.id} className="grid grid-cols-4 gap-4 py-2 border-b">
                  <div className="font-mono">
                    {dumbbell.native_weight} {dumbbell.native_unit}
                  </div>
                  <div className="font-mono text-muted-foreground">
                    {dumbbell.converted_weight.toFixed(1)} {dumbbell.converted_unit}
                  </div>
                  <div>{dumbbell.quantity}</div>
                  <div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}