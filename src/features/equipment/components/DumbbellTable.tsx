import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Zap } from 'lucide-react';
import { convertWeight } from '@/lib/equipment/convert';

interface DumbbellTableProps {
  dumbbells: Array<{ weight_kg: number; pair_count?: number }>;
  unit: 'kg' | 'lb';
  editable?: boolean;
  source?: 'global' | 'gym';
  onDumbbellsChange?: (dumbbells: Array<{ weight_kg: number; pair_count?: number }>) => void;
}

export const DumbbellTable: React.FC<DumbbellTableProps> = ({
  dumbbells,
  unit,
  editable = false,
  source = 'global',
  onDumbbellsChange
}) => {
  const [newDumbbell, setNewDumbbell] = useState({ weight: '', pairs: '1' });
  const [isAdding, setIsAdding] = useState(false);
  const [rangeGenerator, setRangeGenerator] = useState({
    start: '',
    end: '',
    step: '',
    pairs: '1'
  });

  const convertedDumbbells = dumbbells.map(dumbbell => ({
    ...dumbbell,
    displayWeight: unit === 'kg' ? dumbbell.weight_kg : convertWeight(dumbbell.weight_kg, 'kg', 'lb')
  })).sort((a, b) => a.displayWeight - b.displayWeight);

  const handleAddDumbbell = () => {
    const weight = parseFloat(newDumbbell.weight);
    const pairs = parseInt(newDumbbell.pairs);
    
    if (isNaN(weight) || isNaN(pairs) || weight <= 0 || pairs <= 0) return;

    const weightKg = unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg');
    const newDumbbellData = {
      weight_kg: weightKg,
      pair_count: pairs
    };

    onDumbbellsChange?.([...dumbbells, newDumbbellData]);
    setNewDumbbell({ weight: '', pairs: '1' });
    setIsAdding(false);
  };

  const handleDeleteDumbbell = (index: number) => {
    const originalIndex = dumbbells.findIndex(d => 
      Math.abs(d.weight_kg - (unit === 'kg' ? convertedDumbbells[index].displayWeight : convertWeight(convertedDumbbells[index].displayWeight, 'lb', 'kg'))) < 0.01
    );
    if (originalIndex >= 0) {
      const updatedDumbbells = dumbbells.filter((_, i) => i !== originalIndex);
      onDumbbellsChange?.(updatedDumbbells);
    }
  };

  const generateRange = () => {
    const start = parseFloat(rangeGenerator.start);
    const end = parseFloat(rangeGenerator.end);
    const step = parseFloat(rangeGenerator.step);
    const pairs = parseInt(rangeGenerator.pairs);

    if (isNaN(start) || isNaN(end) || isNaN(step) || isNaN(pairs) || 
        start <= 0 || end <= start || step <= 0 || pairs <= 0) return;

    const newDumbbells = [];
    for (let weight = start; weight <= end; weight += step) {
      const weightKg = unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg');
      newDumbbells.push({
        weight_kg: weightKg,
        pair_count: pairs
      });
    }

    onDumbbellsChange?.([...dumbbells, ...newDumbbells]);
    setRangeGenerator({ start: '', end: '', step: '', pairs: '1' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Dumbbells</h3>
          <Badge variant={unit === 'kg' ? 'default' : 'secondary'}>
            {unit.toUpperCase()}
          </Badge>
          {source === 'gym' && (
            <Badge variant="outline">Gym Override</Badge>
          )}
        </div>
        {editable && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Single
            </Button>
          </div>
        )}
      </div>

      {editable && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Range Generator</CardTitle>
            <CardDescription>Quickly generate a range of dumbbell weights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 items-end">
              <div>
                <Label className="text-xs">Start ({unit})</Label>
                <Input
                  type="number"
                  value={rangeGenerator.start}
                  onChange={(e) => setRangeGenerator(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="2.5"
                  step={unit === 'kg' ? '0.5' : '1'}
                />
              </div>
              <div>
                <Label className="text-xs">End ({unit})</Label>
                <Input
                  type="number"
                  value={rangeGenerator.end}
                  onChange={(e) => setRangeGenerator(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="50"
                  step={unit === 'kg' ? '0.5' : '1'}
                />
              </div>
              <div>
                <Label className="text-xs">Step ({unit})</Label>
                <Input
                  type="number"
                  value={rangeGenerator.step}
                  onChange={(e) => setRangeGenerator(prev => ({ ...prev, step: e.target.value }))}
                  placeholder="2.5"
                  step={unit === 'kg' ? '0.5' : '1'}
                />
              </div>
              <div>
                <Label className="text-xs">Pairs</Label>
                <Input
                  type="number"
                  value={rangeGenerator.pairs}
                  onChange={(e) => setRangeGenerator(prev => ({ ...prev, pairs: e.target.value }))}
                  placeholder="1"
                  min="1"
                />
              </div>
              <Button size="sm" onClick={generateRange}>
                <Zap className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Weight ({unit})</TableHead>
            <TableHead>Pairs Available</TableHead>
            <TableHead>Source</TableHead>
            {editable && <TableHead className="w-16">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {convertedDumbbells.map((dumbbell, index) => (
            <TableRow key={index}>
              <TableCell>{dumbbell.displayWeight} {unit}</TableCell>
              <TableCell>{dumbbell.pair_count || 1}</TableCell>
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
                    onClick={() => handleDeleteDumbbell(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          
          {isAdding && (
            <TableRow>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Weight"
                  value={newDumbbell.weight}
                  onChange={(e) => setNewDumbbell(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-20"
                  step={unit === 'kg' ? '0.5' : '1'}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDumbbell()}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Pairs"
                  value={newDumbbell.pairs}
                  onChange={(e) => setNewDumbbell(prev => ({ ...prev, pairs: e.target.value }))}
                  className="w-16"
                  min="1"
                />
              </TableCell>
              <TableCell>
                <Badge variant="secondary">Gym</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={handleAddDumbbell}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewDumbbell({ weight: '', pairs: '1' });
                    }}
                  >
                    <span>×</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          
          {convertedDumbbells.length === 0 && !isAdding && (
            <TableRow>
              <TableCell colSpan={editable ? 4 : 3} className="text-center text-muted-foreground">
                No dumbbells configured
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};