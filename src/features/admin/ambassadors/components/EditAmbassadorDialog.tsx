import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateAmbassador, AmbassadorSummary } from '../hooks/useAdminAmbassadors';

interface EditAmbassadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: AmbassadorSummary | null;
}

export function EditAmbassadorDialog({ open, onOpenChange, ambassador }: EditAmbassadorDialogProps) {
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('eligible');
  
  const updateAmbassador = useUpdateAmbassador();

  useEffect(() => {
    if (ambassador) {
      setBio(ambassador.bio || '');
      setStatus(ambassador.status || 'eligible');
    }
  }, [ambassador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ambassador) return;

    updateAmbassador.mutate({
      ambassadorId: ambassador.ambassador_id,
      updates: { bio, status: status as 'eligible' | 'active' | 'suspended' | 'terminated' }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  if (!ambassador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ambassador Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ambassador</Label>
            <div className="text-sm text-muted-foreground">
              {ambassador.user_email} {ambassador.user_name && `(${ambassador.user_name})`}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ambassador bio and background..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateAmbassador.isPending}
            >
              {updateAmbassador.isPending ? 'Updating...' : 'Update Ambassador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}