import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminMenu from "../components/AdminMenu";

interface BodyPart {
  id: string;
  name: string;
  slug?: string;
  created_at: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  slug?: string;
  body_part_id: string;
  created_at: string;
}

interface Muscle {
  id: string;
  name: string;
  slug?: string;
  muscle_group_id: string;
  created_at: string;
}

const AdminMusclesManagement: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("body-parts");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data
  const { data: bodyParts = [], isLoading: bodyPartsLoading } = useQuery({
    queryKey: ['admin-body-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_parts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as BodyPart[];
    },
  });

  const { data: muscleGroups = [], isLoading: muscleGroupsLoading } = useQuery({
    queryKey: ['admin-muscle-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select('*, body_parts(name)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: muscles = [], isLoading: musclesLoading } = useQuery({
    queryKey: ['admin-muscles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscles')
        .select('*, muscle_groups(name, body_parts(name))')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Forms
  const bodyPartForm = useForm({
    defaultValues: { name: '', slug: '' }
  });

  const muscleGroupForm = useForm({
    defaultValues: { name: '', slug: '', body_part_id: '' }
  });

  const muscleForm = useForm({
    defaultValues: { name: '', slug: '', muscle_group_id: '' }
  });

  // Mutations
  const createBodyPartMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string }) => {
      const { error } = await supabase
        .from('body_parts')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-body-parts'] });
      toast.success('Body part created successfully');
      setIsDialogOpen(false);
      bodyPartForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create body part: ' + error.message);
    }
  });

  const updateBodyPartMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug?: string } }) => {
      const { error } = await supabase
        .from('body_parts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-body-parts'] });
      toast.success('Body part updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      bodyPartForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update body part: ' + error.message);
    }
  });

  const deleteBodyPartMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('body_parts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-body-parts'] });
      toast.success('Body part deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete body part: ' + error.message);
    }
  });

  const createMuscleGroupMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string; body_part_id: string }) => {
      const { error } = await supabase
        .from('muscle_groups')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscle-groups'] });
      toast.success('Muscle group created successfully');
      setIsDialogOpen(false);
      muscleGroupForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create muscle group: ' + error.message);
    }
  });

  const updateMuscleGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug?: string; body_part_id: string } }) => {
      const { error } = await supabase
        .from('muscle_groups')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscle-groups'] });
      toast.success('Muscle group updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      muscleGroupForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update muscle group: ' + error.message);
    }
  });

  const deleteMuscleGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('muscle_groups')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscle-groups'] });
      toast.success('Muscle group deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete muscle group: ' + error.message);
    }
  });

  const createMuscleMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string; muscle_group_id: string }) => {
      const { error } = await supabase
        .from('muscles')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscles'] });
      toast.success('Muscle created successfully');
      setIsDialogOpen(false);
      muscleForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create muscle: ' + error.message);
    }
  });

  const updateMuscleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug?: string; muscle_group_id: string } }) => {
      const { error } = await supabase
        .from('muscles')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscles'] });
      toast.success('Muscle updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      muscleForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update muscle: ' + error.message);
    }
  });

  const deleteMuscleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('muscles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-muscles'] });
      toast.success('Muscle deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete muscle: ' + error.message);
    }
  });

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    if (type === 'body-part') {
      bodyPartForm.reset({ name: item.name, slug: item.slug || '' });
    } else if (type === 'muscle-group') {
      muscleGroupForm.reset({ name: item.name, slug: item.slug || '', body_part_id: item.body_part_id });
    } else if (type === 'muscle') {
      muscleForm.reset({ name: item.name, slug: item.slug || '', muscle_group_id: item.muscle_group_id });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: any, type: string) => {
    if (editingItem) {
      if (type === 'body-part') {
        updateBodyPartMutation.mutate({ id: editingItem.id, data });
      } else if (type === 'muscle-group') {
        updateMuscleGroupMutation.mutate({ id: editingItem.id, data });
      } else if (type === 'muscle') {
        updateMuscleMutation.mutate({ id: editingItem.id, data });
      }
    } else {
      if (type === 'body-part') {
        createBodyPartMutation.mutate(data);
      } else if (type === 'muscle-group') {
        createMuscleGroupMutation.mutate(data);
      } else if (type === 'muscle') {
        createMuscleMutation.mutate(data);
      }
    }
  };

  const handleDelete = (id: string, type: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (type === 'body-part') {
        deleteBodyPartMutation.mutate(id);
      } else if (type === 'muscle-group') {
        deleteMuscleGroupMutation.mutate(id);
      } else if (type === 'muscle') {
        deleteMuscleMutation.mutate(id);
      }
    }
  };

  const openCreateDialog = (type: string) => {
    setEditingItem(null);
    setActiveTab(type === 'body-parts' ? 'body-parts' : type === 'muscle-groups' ? 'muscle-groups' : 'muscles');
    setIsDialogOpen(true);
  };

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Muscles Management</h1>
        <p className="text-muted-foreground">Manage body parts, muscle groups, and muscles</p>
      </div>

      <AdminMenu />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="body-parts">Body Parts</TabsTrigger>
          <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
          <TabsTrigger value="muscles">Muscles</TabsTrigger>
        </TabsList>

        <TabsContent value="body-parts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Body Parts</CardTitle>
                <Dialog open={isDialogOpen && activeTab === 'body-parts'} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openCreateDialog('body-parts')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Body Part
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit' : 'Create'} Body Part</DialogTitle>
                    </DialogHeader>
                    <Form {...bodyPartForm}>
                      <form onSubmit={bodyPartForm.handleSubmit((data) => handleSubmit(data, 'body-part'))} className="space-y-4">
                        <FormField
                          control={bodyPartForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} required />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bodyPartForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bodyPartsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>Loading...</TableCell>
                    </TableRow>
                  ) : bodyParts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No body parts found</TableCell>
                    </TableRow>
                  ) : (
                    bodyParts.map((bodyPart) => (
                      <TableRow key={bodyPart.id}>
                        <TableCell>{bodyPart.name}</TableCell>
                        <TableCell>{bodyPart.slug || '-'}</TableCell>
                        <TableCell>{new Date(bodyPart.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(bodyPart, 'body-part')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(bodyPart.id, 'body-part')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscle-groups" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Muscle Groups</CardTitle>
                <Dialog open={isDialogOpen && activeTab === 'muscle-groups'} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openCreateDialog('muscle-groups')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Muscle Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit' : 'Create'} Muscle Group</DialogTitle>
                    </DialogHeader>
                    <Form {...muscleGroupForm}>
                      <form onSubmit={muscleGroupForm.handleSubmit((data) => handleSubmit(data, 'muscle-group'))} className="space-y-4">
                        <FormField
                          control={muscleGroupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} required />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={muscleGroupForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={muscleGroupForm.control}
                          name="body_part_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Body Part</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a body part" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bodyParts.map((bodyPart) => (
                                    <SelectItem key={bodyPart.id} value={bodyPart.id}>
                                      {bodyPart.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Body Part</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {muscleGroupsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading...</TableCell>
                    </TableRow>
                  ) : muscleGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>No muscle groups found</TableCell>
                    </TableRow>
                  ) : (
                    muscleGroups.map((muscleGroup) => (
                      <TableRow key={muscleGroup.id}>
                        <TableCell>{muscleGroup.name}</TableCell>
                        <TableCell>{muscleGroup.slug || '-'}</TableCell>
                        <TableCell>{muscleGroup.body_parts?.name || '-'}</TableCell>
                        <TableCell>{new Date(muscleGroup.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(muscleGroup, 'muscle-group')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(muscleGroup.id, 'muscle-group')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muscles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Muscles</CardTitle>
                <Dialog open={isDialogOpen && activeTab === 'muscles'} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openCreateDialog('muscles')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Muscle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit' : 'Create'} Muscle</DialogTitle>
                    </DialogHeader>
                    <Form {...muscleForm}>
                      <form onSubmit={muscleForm.handleSubmit((data) => handleSubmit(data, 'muscle'))} className="space-y-4">
                        <FormField
                          control={muscleForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} required />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={muscleForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={muscleForm.control}
                          name="muscle_group_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Muscle Group</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a muscle group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {muscleGroups.map((muscleGroup) => (
                                    <SelectItem key={muscleGroup.id} value={muscleGroup.id}>
                                      {muscleGroup.name} ({muscleGroup.body_parts?.name})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingItem ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Muscle Group</TableHead>
                    <TableHead>Body Part</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {musclesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>Loading...</TableCell>
                    </TableRow>
                  ) : muscles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>No muscles found</TableCell>
                    </TableRow>
                  ) : (
                    muscles.map((muscle) => (
                      <TableRow key={muscle.id}>
                        <TableCell>{muscle.name}</TableCell>
                        <TableCell>{muscle.slug || '-'}</TableCell>
                        <TableCell>{muscle.muscle_groups?.name || '-'}</TableCell>
                        <TableCell>{muscle.muscle_groups?.body_parts?.name || '-'}</TableCell>
                        <TableCell>{new Date(muscle.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(muscle, 'muscle')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(muscle.id, 'muscle')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminMusclesManagement;