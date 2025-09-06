import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGyms, useCreateGym } from '@/hooks/useGyms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Building2, Users } from 'lucide-react';
import PageNav from '@/components/PageNav';

export default function GymsListPage() {
  const navigate = useNavigate();
  const { data: gyms, isLoading, error } = useGyms();
  const createGym = useCreateGym();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: ''
  });

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gymId = await createGym.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', city: '', country: '' });
      navigate(`/gyms/${gymId}`);
    } catch (error) {
      console.error('Failed to create gym:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="container py-12">
      <PageNav current="Gyms" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gym Management</h1>
            <p className="text-muted-foreground mt-1">Manage gyms, coaches, and equipment</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Gym
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gym</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGym} className="space-y-4">
                <div>
                  <Label htmlFor="name">Gym Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter gym name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Enter country"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createGym.isPending}>
                    {createGym.isPending ? 'Creating...' : 'Create Gym'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading gyms...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Gyms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && gyms && (
          <>
            <div className="grid gap-4">
              {gyms.map((gym) => (
                <Card key={gym.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/gyms/${gym.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{gym.name}</h3>
                          <Badge variant="outline" className={getStatusColor(gym.status)}>
                            {gym.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {gym.city && gym.country && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{gym.city}, {gym.country}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Created {new Date(gym.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {gym.address && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Address:</span> {gym.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {gyms.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-3">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">No gyms yet</h3>
                    <p className="text-muted-foreground">Get started by creating your first gym.</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Gym
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}