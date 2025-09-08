import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignAmbassadorToGym, AmbassadorSummary } from '../hooks/useAdminAmbassadors';
import { useGyms } from '@/features/mentors/admin/hooks/useGyms';

interface AssignGymDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: AmbassadorSummary | null;
}

export function AssignGymDialog({ open, onOpenChange, ambassador }: AssignGymDialogProps) {
  const [selectedGymId, setSelectedGymId] = useState('');
  const [selectedBattleId, setSelectedBattleId] = useState('');
  
  const { data: gyms, isLoading: gymsLoading } = useGyms();
  const assignToGym = useAssignAmbassadorToGym();

  // For now, we'll use a placeholder battle ID - in a real system you'd fetch active battles
  const mockBattles = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Q1 2024 Battle' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Q2 2024 Battle' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ambassador || !selectedGymId || !selectedBattleId) return;

    assignToGym.mutate({
      ambassadorId: ambassador.ambassador_id,
      gymId: selectedGymId,
      battleId: selectedBattleId
    }, {
      onSuccess: () => {
        setSelectedGymId('');
        setSelectedBattleId('');
        onOpenChange(false);
      }
    });
  };

  if (!ambassador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Ambassador to Gym</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ambassador</Label>
            <div className="text-sm text-muted-foreground">
              {ambassador.user_email} {ambassador.user_name && `(${ambassador.user_name})`}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gym">Select Gym</Label>
            <Select value={selectedGymId} onValueChange={setSelectedGymId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a gym" />
              </SelectTrigger>
              <SelectContent>
                {gyms?.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name} {gym.city && `- ${gym.city}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battle">Select Battle/Campaign</Label>
            <Select value={selectedBattleId} onValueChange={setSelectedBattleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a battle" />
              </SelectTrigger>
              <SelectContent>
                {mockBattles.map((battle) => (
                  <SelectItem key={battle.id} value={battle.id}>
                    {battle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedGymId || !selectedBattleId || assignToGym.isPending}
            >
              {assignToGym.isPending ? 'Assigning...' : 'Assign to Gym'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}