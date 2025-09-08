import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAmbassador } from '../hooks/useAdminAmbassadors';
import { useAdminUsers } from '@/admin/users/hooks/useAdminUsers';

interface CreateAmbassadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAmbassadorDialog({ open, onOpenChange }: CreateAmbassadorDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('eligible');
  
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const createAmbassador = useCreateAmbassador();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      return;
    }

    createAmbassador.mutate({
      user_id: selectedUserId,
      bio,
      status
    }, {
      onSuccess: () => {
        setSelectedUserId('');
        setBio('');
        setStatus('eligible');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Ambassador</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to make ambassador" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={!selectedUserId || createAmbassador.isPending}
            >
              {createAmbassador.isPending ? 'Creating...' : 'Create Ambassador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}