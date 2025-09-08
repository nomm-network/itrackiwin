import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useAmbassadorCommissionRates, 
  useUpdateCommissionRate, 
  AmbassadorSummary 
} from '../hooks/useAdminAmbassadors';

interface CommissionRatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: AmbassadorSummary | null;
}

export function CommissionRatesDialog({ open, onOpenChange, ambassador }: CommissionRatesDialogProps) {
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});
  
  const { data: commissionRates, isLoading } = useAmbassadorCommissionRates(ambassador?.ambassador_id);
  const updateCommissionRate = useUpdateCommissionRate();

  const handleRateChange = (agreementId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditingRates(prev => ({ ...prev, [agreementId]: numValue }));
    }
  };

  const handleSaveRate = (agreementId: string) => {
    const newRate = editingRates[agreementId];
    if (newRate !== undefined && newRate >= 0 && newRate <= 100) {
      updateCommissionRate.mutate({
        agreementId,
        percent: newRate
      }, {
        onSuccess: () => {
          setEditingRates(prev => {
            const newRates = { ...prev };
            delete newRates[agreementId];
            return newRates;
          });
        }
      });
    }
  };

  if (!ambassador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Commission Rates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ambassador</Label>
            <div className="text-sm text-muted-foreground">
              {ambassador.user_email} {ambassador.user_name && `(${ambassador.user_name})`}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Commission Agreements</h3>
            
            {isLoading ? (
              <div>Loading commission rates...</div>
            ) : commissionRates && commissionRates.length > 0 ? (
              <div className="space-y-3">
                {commissionRates.map((agreement) => (
                  <Card key={agreement.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Agreement {agreement.id.slice(0, 8)}...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Gym ID:</span> {agreement.gym_id.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">Tier:</span> {agreement.tier}
                        </div>
                        <div>
                          <span className="font-medium">Battle ID:</span> {agreement.battle_id.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span> {new Date(agreement.starts_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`rate-${agreement.id}`} className="min-w-0 flex-shrink-0">
                          Commission Rate (%):
                        </Label>
                        <Input
                          id={`rate-${agreement.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={editingRates[agreement.id] ?? agreement.percent}
                          onChange={(e) => handleRateChange(agreement.id, e.target.value)}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveRate(agreement.id)}
                          disabled={
                            editingRates[agreement.id] === undefined || 
                            editingRates[agreement.id] === agreement.percent ||
                            updateCommissionRate.isPending
                          }
                        >
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No commission agreements found for this ambassador.
                <br />
                Assign them to a gym first to create commission agreements.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}