import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical } from 'lucide-react';
import { PlateProfilePlate } from '../hooks/usePlateProfiles';

interface PlateRowProps {
  plate: PlateProfilePlate;
  index: number;
  defaultUnit: 'kg' | 'lb';
  onUpdate: (index: number, field: keyof PlateProfilePlate, value: any) => void;
  onDelete: (index: number) => void;
}

export function PlateRow({ plate, index, defaultUnit, onUpdate, onDelete }: PlateRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
      <div className="cursor-grab text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Weight</label>
          <div className="flex gap-1">
            <Input
              type="number"
              step="0.25"
              value={plate.weight_kg}
              onChange={(e) => onUpdate(index, 'weight_kg', parseFloat(e.target.value) || 0)}
              placeholder="Weight"
              className="flex-1"
            />
            <div className="px-2 py-1 text-sm text-muted-foreground bg-muted rounded flex items-center">
              {defaultUnit}
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Quantity (per side)</label>
          <Input
            type="number"
            min="1"
            value={plate.count_per_side}
            onChange={(e) => onUpdate(index, 'count_per_side', parseInt(e.target.value) || 1)}
            placeholder="Qty"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Order</label>
          <Input
            type="number"
            min="0"
            value={plate.display_order}
            onChange={(e) => onUpdate(index, 'display_order', parseInt(e.target.value) || 0)}
            placeholder="Order"
          />
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}