import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { convertWeight } from '@/lib/equipment/convert';

interface FixedBarsTableProps {
  straightBars: Array<{ weight_kg: number; count?: number }>;
  ezBars: Array<{ weight_kg: number; count?: number }>;
  unit: 'kg' | 'lb';
  editable?: boolean;
  source?: 'global' | 'gym';
  onBarsChange?: (type: 'straight' | 'ez', bars: Array<{ weight_kg: number; count?: number }>) => void;
}

export const FixedBarsTable: React.FC<FixedBarsTableProps> = ({
  straightBars,
  ezBars,
  unit,
  editable = false,
  source = 'global',
  onBarsChange
}) => {
  const [activeTab, setActiveTab] = useState('straight');
  const [newBar, setNewBar] = useState({ weight: '', count: '1' });
  const [isAdding, setIsAdding] = useState(false);

  const BarSubTable = ({ 
    bars, 
    type 
  }: { 
    bars: Array<{ weight_kg: number; count?: number }>;
    type: 'straight' | 'ez';
  }) => {
    const convertedBars = bars.map(bar => ({
      ...bar,
      displayWeight: unit === 'kg' ? bar.weight_kg : convertWeight(bar.weight_kg, 'kg', 'lb')
    })).sort((a, b) => a.displayWeight - b.displayWeight);

    const handleAddBar = () => {
      const weight = parseFloat(newBar.weight);
      const count = parseInt(newBar.count);
      
      if (isNaN(weight) || isNaN(count) || weight <= 0 || count <= 0) return;

      const weightKg = unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg');
      const newBarData = {
        weight_kg: weightKg,
        count
      };

      onBarsChange?.(type, [...bars, newBarData]);
      setNewBar({ weight: '', count: '1' });
      setIsAdding(false);
    };

    const handleDeleteBar = (index: number) => {
      const originalIndex = bars.findIndex(b => 
        Math.abs(b.weight_kg - (unit === 'kg' ? convertedBars[index].displayWeight : convertWeight(convertedBars[index].displayWeight, 'lb', 'kg'))) < 0.01
      );
      if (originalIndex >= 0) {
        const updatedBars = bars.filter((_, i) => i !== originalIndex);
        onBarsChange?.(type, updatedBars);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{type === 'straight' ? 'Straight Bars' : 'EZ Curl Bars'}</h4>
            <Badge variant={unit === 'kg' ? 'default' : 'secondary'}>
              {unit.toUpperCase()}
            </Badge>
            {source === 'gym' && (
              <Badge variant="outline">Gym Override</Badge>
            )}
          </div>
          {editable && (
            <Button 
              size="sm" 
              onClick={() => {
                setActiveTab(type);
                setIsAdding(true);
              }}
              disabled={isAdding}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Bar
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Weight ({unit})</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Source</TableHead>
              {editable && <TableHead className="w-16">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {convertedBars.map((bar, index) => (
              <TableRow key={index}>
                <TableCell>{bar.displayWeight} {unit}</TableCell>
                <TableCell>{bar.count || 1}</TableCell>
                <TableCell>
                  <Badge variant={source === 'global' ? 'default' : 'secondary'}>
                    {source === 'global' ? 'Global' : 'Gym'}
                  </Badge>
                </TableCell>
                {editable && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBar(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {isAdding && activeTab === type && (
              <TableRow>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={newBar.weight}
                    onChange={(e) => setNewBar(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-20"
                    step={unit === 'kg' ? '0.5' : '1'}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBar()}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Count"
                    value={newBar.count}
                    onChange={(e) => setNewBar(prev => ({ ...prev, count: e.target.value }))}
                    className="w-16"
                    min="1"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Gym</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleAddBar}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setIsAdding(false);
                        setNewBar({ weight: '', count: '1' });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {convertedBars.length === 0 && !(isAdding && activeTab === type) && (
              <TableRow>
                <TableCell colSpan={editable ? 4 : 3} className="text-center text-muted-foreground">
                  No {type} bars configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Fixed Bars</h3>
        <Badge variant={unit === 'kg' ? 'default' : 'secondary'}>
          {unit.toUpperCase()}
        </Badge>
        {source === 'gym' && (
          <Badge variant="outline">Gym Override</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="straight">Straight Bars</TabsTrigger>
          <TabsTrigger value="ez">EZ Curl Bars</TabsTrigger>
        </TabsList>

        <TabsContent value="straight" className="mt-4">
          <BarSubTable bars={straightBars} type="straight" />
        </TabsContent>

        <TabsContent value="ez" className="mt-4">
          <BarSubTable bars={ezBars} type="ez" />
        </TabsContent>
      </Tabs>
    </div>
  );
};