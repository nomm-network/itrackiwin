import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { convertWeight } from '@/lib/equipment/convert';

interface PlateTableProps {
  plates: Array<{ id?: string; weight_kg: number; display_order: number; count?: number }>;
  unit: 'kg' | 'lb';
  editable?: boolean;
  source?: 'global' | 'gym';
  onPlatesChange?: (plates: Array<{ weight_kg: number; display_order: number; count?: number }>) => void;
}

export const PlateTable: React.FC<PlateTableProps> = ({
  plates,
  unit,
  editable = false,
  source = 'global',
  onPlatesChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlate, setNewPlate] = useState({ weight: '', count: '2' });
  const [isAdding, setIsAdding] = useState(false);

  const convertedPlates = plates.map(plate => ({
    ...plate,
    displayWeight: unit === 'kg' ? plate.weight_kg : convertWeight(plate.weight_kg, 'kg', 'lb')
  }));

  const handleAddPlate = () => {
    const weight = parseFloat(newPlate.weight);
    const count = parseInt(newPlate.count);
    
    if (isNaN(weight) || isNaN(count) || weight <= 0 || count <= 0) return;

    const weightKg = unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg');
    const newPlateData = {
      weight_kg: weightKg,
      display_order: plates.length * 10 + 10,
      count
    };

    onPlatesChange?.([...plates, newPlateData]);
    setNewPlate({ weight: '', count: '2' });
    setIsAdding(false);
  };

  const handleDeletePlate = (index: number) => {
    const updatedPlates = plates.filter((_, i) => i !== index);
    onPlatesChange?.(updatedPlates);
  };

  const handleEditPlate = (index: number, weight: number, count: number) => {
    const weightKg = unit === 'kg' ? weight : convertWeight(weight, 'lb', 'kg');
    const updatedPlates = plates.map((plate, i) => 
      i === index ? { ...plate, weight_kg: weightKg, count } : plate
    );
    onPlatesChange?.(updatedPlates);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Plates</h3>
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
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Plate
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Weight ({unit})</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Source</TableHead>
            {editable && <TableHead className="w-20">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {convertedPlates.map((plate, index) => {
            const isEditing = editingId === `${index}`;
            
            return (
              <TableRow key={index}>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      defaultValue={plate.displayWeight}
                      className="w-20"
                      step={unit === 'kg' ? '0.5' : '1'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const weight = parseFloat((e.target as HTMLInputElement).value);
                          const count = plate.count || 2;
                          handleEditPlate(index, weight, count);
                        }
                      }}
                    />
                  ) : (
                    `${plate.displayWeight} ${unit}`
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      defaultValue={plate.count || 2}
                      className="w-16"
                      min="1"
                    />
                  ) : (
                    plate.count || 2
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={source === 'global' ? 'default' : 'secondary'}>
                    {source === 'global' ? 'Global' : 'Gym'}
                  </Badge>
                </TableCell>
                {editable && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const weightInput = document.querySelector(`input[type="number"]`) as HTMLInputElement;
                              const countInput = document.querySelectorAll(`input[type="number"]`)[1] as HTMLInputElement;
                              const weight = parseFloat(weightInput.value);
                              const count = parseInt(countInput.value);
                              handleEditPlate(index, weight, count);
                            }}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(`${index}`)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePlate(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          
          {isAdding && (
            <TableRow>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Weight"
                  value={newPlate.weight}
                  onChange={(e) => setNewPlate(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-20"
                  step={unit === 'kg' ? '0.5' : '1'}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlate()}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Count"
                  value={newPlate.count}
                  onChange={(e) => setNewPlate(prev => ({ ...prev, count: e.target.value }))}
                  className="w-16"
                  min="1"
                />
              </TableCell>
              <TableCell>
                <Badge variant="secondary">Gym</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={handleAddPlate}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewPlate({ weight: '', count: '2' });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          
          {convertedPlates.length === 0 && !isAdding && (
            <TableRow>
              <TableCell colSpan={editable ? 4 : 3} className="text-center text-muted-foreground">
                No plates configured
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};