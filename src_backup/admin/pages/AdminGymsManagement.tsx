import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, MapPin } from "lucide-react";
import AdminMenu from "../components/AdminMenu";
import PageNav from "@/components/PageNav";

interface Gym {
  id: string;
  name: string;
  provider: string;
  provider_place_id?: string;
  location?: any;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  tz?: string;
  equipment_profile?: any;
  verified: boolean;
  created_at: string;
}

interface GymFormData {
  name: string;
  provider: string;
  provider_place_id?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  tz?: string;
  equipment_profile?: string;
  verified: boolean;
}

const AdminGymsManagement: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<Gym | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch gyms data
  const { data: gyms = [], isLoading: gymsLoading } = useQuery({
    queryKey: ['admin-gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Gym[];
    },
  });

  // Form
  const gymForm = useForm<GymFormData>({
    defaultValues: { 
      name: '', 
      provider: 'manual',
      verified: false,
      equipment_profile: ''
    }
  });

  // Mutations
  const createGymMutation = useMutation({
    mutationFn: async (data: GymFormData) => {
      const gymData: any = {
        name: data.name,
        provider: data.provider,
        provider_place_id: data.provider_place_id || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        phone: data.phone || null,
        website: data.website || null,
        tz: data.tz || null,
        verified: data.verified,
        equipment_profile: data.equipment_profile ? JSON.parse(data.equipment_profile) : {}
      };

      const { data: gym, error } = await supabase
        .from('gyms')
        .insert([gymData])
        .select()
        .single();
      
      if (error) throw error;
      return gym;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast.success('Gym created successfully');
      setIsDialogOpen(false);
      gymForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create gym: ' + error.message);
    }
  });

  const updateGymMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GymFormData }) => {
      const gymData: any = {
        name: data.name,
        provider: data.provider,
        provider_place_id: data.provider_place_id || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        phone: data.phone || null,
        website: data.website || null,
        tz: data.tz || null,
        verified: data.verified,
        equipment_profile: data.equipment_profile ? JSON.parse(data.equipment_profile) : {}
      };

      const { error } = await supabase
        .from('gyms')
        .update(gymData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast.success('Gym updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      gymForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update gym: ' + error.message);
    }
  });

  const deleteGymMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast.success('Gym deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete gym: ' + error.message);
    }
  });

  const handleEdit = (item: Gym) => {
    setEditingItem(item);
    gymForm.reset({
      name: item.name,
      provider: item.provider,
      provider_place_id: item.provider_place_id || '',
      address: item.address || '',
      city: item.city || '',
      country: item.country || '',
      phone: item.phone || '',
      website: item.website || '',
      tz: item.tz || '',
      verified: item.verified,
      equipment_profile: item.equipment_profile ? JSON.stringify(item.equipment_profile, null, 2) : ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: GymFormData) => {
    if (editingItem) {
      updateGymMutation.mutate({ id: editingItem.id, data });
    } else {
      createGymMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this gym?')) {
      deleteGymMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    gymForm.reset({ 
      name: '', 
      provider: 'manual',
      verified: false,
      equipment_profile: ''
    });
    setIsDialogOpen(true);
  };

  return (
    <main className="container py-8">
      <PageNav current="Admin / Others / Gyms" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gyms Management</h1>
        <p className="text-muted-foreground">Manage global gym database with custom equipment profiles</p>
      </div>

      <AdminMenu />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gyms</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gym
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Gym' : 'Create Gym'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...gymForm}>
                    <form onSubmit={gymForm.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={gymForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gym Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Gym name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gymForm.control}
                          name="provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="google">Google Places</SelectItem>
                                  <SelectItem value="foursquare">Foursquare</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={gymForm.control}
                          name="provider_place_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Place ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Place ID (if from provider)" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={gymForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gymForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={gymForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Country" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gymForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={gymForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={gymForm.control}
                        name="tz"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., America/New_York" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={gymForm.control}
                        name="equipment_profile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Profile (JSON)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={`{
  "dumbbells": [5, 10, 15, 20, 25, 30],
  "plates": [1.25, 2.5, 5, 10, 15, 20, 25],
  "machines": {
    "lat_pulldown": {"min": 10, "max": 100, "increment": 5},
    "leg_press": {"min": 20, "max": 300, "increment": 10}
  }
}`}
                                rows={8}
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={gymForm.control}
                        name="verified"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="verified"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-border"
                              />
                              <FormLabel htmlFor="verified" className="text-sm font-normal">
                                Verified gym
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button type="submit" disabled={createGymMutation.isPending || updateGymMutation.isPending}>
                          {createGymMutation.isPending || updateGymMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {gymsLoading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gyms.map((gym) => (
                    <TableRow key={gym.id}>
                      <TableCell className="font-medium">
                        {gym.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {gym.city && gym.country ? `${gym.city}, ${gym.country}` : gym.address || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{gym.provider}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          gym.verified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {gym.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(gym.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(gym)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(gym.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AdminGymsManagement;