import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

interface MovementPattern {
  id: string;
  slug: string;
  created_at: string;
  translations?: Record<string, { name: string; description?: string }>;
}

interface Movement {
  id: string;
  slug: string;
  movement_pattern_id: string;
  created_at: string;
  translations?: Record<string, { name: string; description?: string }>;
}

const AdminMovementsManagement: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const [activeTab, setActiveTab] = useState<'patterns' | 'movements'>('patterns');
  
  // Pattern form state
  const [isCreatePatternDialogOpen, setIsCreatePatternDialogOpen] = useState(false);
  const [isEditPatternDialogOpen, setIsEditPatternDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<MovementPattern | null>(null);
  const [patternFormData, setPatternFormData] = useState({
    slug: "",
    name_en: "",
    description_en: "",
  });

  // Movement form state
  const [isCreateMovementDialogOpen, setIsCreateMovementDialogOpen] = useState(false);
  const [isEditMovementDialogOpen, setIsEditMovementDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string>('');
  const [movementFormData, setMovementFormData] = useState({
    slug: "",
    name_en: "",
    description_en: "",
    movement_pattern_id: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Movements & Patterns | Admin";
  }, []);

  // Fetch movement patterns with translations
  const { data: patterns = [], isLoading: isPatternsLoading } = useQuery({
    queryKey: ["movement-patterns-with-translations"],
    queryFn: async () => {
      const { data: patternsData, error: patternsError } = await supabase
        .from("movement_patterns")
        .select("*")
        .order("slug");
      if (patternsError) throw patternsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("movement_patterns_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return patternsData.map(pattern => {
        const translations = translationsData
          .filter(t => t.movement_pattern_id === pattern.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...pattern, translations };
      });
    },
  });

  // Fetch movements with translations
  const { data: movements = [], isLoading: isMovementsLoading } = useQuery({
    queryKey: ["movements-with-translations", selectedPatternId],
    queryFn: async () => {
      let query = supabase
        .from("movements")
        .select("*")
        .order("slug");
      
      if (selectedPatternId && selectedPatternId !== 'all') {
        query = query.eq("movement_pattern_id", selectedPatternId);
      }
      
      const { data: movementsData, error: movementsError } = await query;
      if (movementsError) throw movementsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("movements_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return movementsData.map(movement => {
        const translations = translationsData
          .filter(t => t.movement_id === movement.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...movement, translations };
      });
    },
  });

  const resetPatternForm = () => {
    setPatternFormData({ slug: "", name_en: "", description_en: "" });
    setEditingPattern(null);
  };

  const resetMovementForm = () => {
    setMovementFormData({ slug: "", name_en: "", description_en: "", movement_pattern_id: "" });
    setEditingMovement(null);
  };

  const openCreatePatternDialog = () => {
    resetPatternForm();
    setIsCreatePatternDialogOpen(true);
  };

  const openEditPatternDialog = (pattern: MovementPattern) => {
    setEditingPattern(pattern);
    setPatternFormData({
      slug: pattern.slug,
      name_en: pattern.translations?.en?.name || "",
      description_en: pattern.translations?.en?.description || "",
    });
    setIsEditPatternDialogOpen(true);
  };

  const openCreateMovementDialog = () => {
    if (!selectedPatternId) {
      toast({
        title: "Pattern Required",
        description: "Please select a movement pattern first.",
        variant: "destructive",
      });
      return;
    }
    resetMovementForm();
    setMovementFormData(prev => ({ ...prev, movement_pattern_id: selectedPatternId }));
    setIsCreateMovementDialogOpen(true);
  };

  const openEditMovementDialog = (movement: Movement) => {
    setEditingMovement(movement);
    setMovementFormData({
      slug: movement.slug,
      name_en: movement.translations?.en?.name || "",
      description_en: movement.translations?.en?.description || "",
      movement_pattern_id: movement.movement_pattern_id,
    });
    setIsEditMovementDialogOpen(true);
  };

  // Create movement pattern
  const createPatternMutation = useMutation({
    mutationFn: async (data: typeof patternFormData) => {
      // Create movement pattern
      const { data: patternData, error: patternError } = await supabase
        .from("movement_patterns")
        .insert({ slug: data.slug })
        .select()
        .single();
      if (patternError) throw patternError;

      // Create English translation
      const { error: translationError } = await supabase
        .from("movement_patterns_translations")
        .insert({
          movement_pattern_id: patternData.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern created",
        description: "Movement pattern has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
      setIsCreatePatternDialogOpen(false);
      resetPatternForm();
    },
    onError: (error: any) => {
      console.error("Create pattern error:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create movement
  const createMovementMutation = useMutation({
    mutationFn: async (data: typeof movementFormData) => {
      // Create movement
      const { data: movementData, error: movementError } = await supabase
        .from("movements")
        .insert({ 
          slug: data.slug,
          movement_pattern_id: data.movement_pattern_id 
        })
        .select()
        .single();
      if (movementError) throw movementError;

      // Create English translation
      const { error: translationError } = await supabase
        .from("movements_translations")
        .insert({
          movement_id: movementData.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement created",
        description: "Movement has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movements-with-translations"] });
      setIsCreateMovementDialogOpen(false);
      resetMovementForm();
    },
    onError: (error: any) => {
      console.error("Create movement error:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create movement. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update movement pattern
  const updatePatternMutation = useMutation({
    mutationFn: async (data: typeof patternFormData) => {
      if (!editingPattern) return;

      // Update movement pattern
      const { error: patternError } = await supabase
        .from("movement_patterns")
        .update({ slug: data.slug })
        .eq("id", editingPattern.id);
      if (patternError) throw patternError;

      // Update English translation
      const { error: translationError } = await supabase
        .from("movement_patterns_translations")
        .upsert({
          movement_pattern_id: editingPattern.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern updated",
        description: "Movement pattern has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
      setIsEditPatternDialogOpen(false);
      resetPatternForm();
    },
    onError: (error: any) => {
      console.error("Update pattern error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update movement
  const updateMovementMutation = useMutation({
    mutationFn: async (data: typeof movementFormData) => {
      if (!editingMovement) return;

      // Update movement
      const { error: movementError } = await supabase
        .from("movements")
        .update({ 
          slug: data.slug,
          movement_pattern_id: data.movement_pattern_id 
        })
        .eq("id", editingMovement.id);
      if (movementError) throw movementError;

      // Update English translation
      const { error: translationError } = await supabase
        .from("movements_translations")
        .upsert({
          movement_id: editingMovement.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement updated",
        description: "Movement has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movements-with-translations"] });
      setIsEditMovementDialogOpen(false);
      resetMovementForm();
    },
    onError: (error: any) => {
      console.error("Update movement error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update movement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePatternMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movement_patterns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern deleted",
        description: "Movement pattern has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
    },
    onError: (error: any) => {
      console.error("Delete pattern error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMovementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Movement deleted",
        description: "Movement has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movements-with-translations"] });
    },
    onError: (error: any) => {
      console.error("Delete movement error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete movement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternFormData.slug || !patternFormData.name_en) {
      toast({
        title: "Validation Error",
        description: "Please fill in slug and English name.",
        variant: "destructive",
      });
      return;
    }

    if (editingPattern) {
      updatePatternMutation.mutate(patternFormData);
    } else {
      createPatternMutation.mutate(patternFormData);
    }
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementFormData.slug || !movementFormData.name_en || !movementFormData.movement_pattern_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in slug, English name, and select a movement pattern.",
        variant: "destructive",
      });
      return;
    }

    if (editingMovement) {
      updateMovementMutation.mutate(movementFormData);
    } else {
      createMovementMutation.mutate(movementFormData);
    }
  };

  if (isPatternsLoading || isMovementsLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Movements & Patterns" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Movements & Patterns" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <CardTitle>Movements & Patterns Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'patterns' | 'movements')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patterns">Movement Patterns</TabsTrigger>
              <TabsTrigger value="movements">Movements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patterns" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Movement Patterns</h3>
                  <p className="text-sm text-muted-foreground">
                    Fundamental movement types used to categorize exercises.
                  </p>
                </div>
                <Dialog open={isCreatePatternDialogOpen} onOpenChange={setIsCreatePatternDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreatePatternDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pattern
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Movement Pattern</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePatternSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={patternFormData.slug}
                          onChange={(e) => setPatternFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="press, row, squat..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="name_en">English Name</Label>
                        <Input
                          id="name_en"
                          value={patternFormData.name_en}
                          onChange={(e) => setPatternFormData(prev => ({ ...prev, name_en: e.target.value }))}
                          placeholder="Press, Row, Squat..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="description_en">English Description</Label>
                        <Textarea
                          id="description_en"
                          value={patternFormData.description_en}
                          onChange={(e) => setPatternFormData(prev => ({ ...prev, description_en: e.target.value }))}
                          placeholder="Description of the movement pattern..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreatePatternDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPatternMutation.isPending}>
                          {createPatternMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patterns.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell className="font-mono text-sm">{pattern.slug}</TableCell>
                      <TableCell className="font-medium">
                        {getTranslatedName(pattern) || pattern.slug}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {pattern.translations?.en?.description || "-"}
                      </TableCell>
                      <TableCell>{new Date(pattern.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditPatternDialog(pattern)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Movement Pattern</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this movement pattern? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePatternMutation.mutate(pattern.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patterns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No movement patterns found. Add some to categorize exercises by movement type.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Movements</h3>
                  <p className="text-sm text-muted-foreground">
                    Specific movements within movement patterns.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pattern-filter">Filter by Pattern:</Label>
                    <Select value={selectedPatternId} onValueChange={setSelectedPatternId}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All patterns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All patterns</SelectItem>
                        {patterns.map((pattern) => (
                          <SelectItem key={pattern.id} value={pattern.id}>
                            {getTranslatedName(pattern) || pattern.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isCreateMovementDialogOpen} onOpenChange={setIsCreateMovementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateMovementDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Movement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Movement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleMovementSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="movement-pattern">Movement Pattern</Label>
                          <Select 
                            value={movementFormData.movement_pattern_id} 
                            onValueChange={(value) => setMovementFormData(prev => ({ ...prev, movement_pattern_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              {patterns.map((pattern) => (
                                <SelectItem key={pattern.id} value={pattern.id}>
                                  {getTranslatedName(pattern) || pattern.slug}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="movement-slug">Slug</Label>
                          <Input
                            id="movement-slug"
                            value={movementFormData.slug}
                            onChange={(e) => setMovementFormData(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="chest-press, lat-pulldown..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="movement-name_en">English Name</Label>
                          <Input
                            id="movement-name_en"
                            value={movementFormData.name_en}
                            onChange={(e) => setMovementFormData(prev => ({ ...prev, name_en: e.target.value }))}
                            placeholder="Chest Press, Lat Pulldown..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="movement-description_en">English Description</Label>
                          <Textarea
                            id="movement-description_en"
                            value={movementFormData.description_en}
                            onChange={(e) => setMovementFormData(prev => ({ ...prev, description_en: e.target.value }))}
                            placeholder="Description of the movement..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateMovementDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createMovementMutation.isPending}>
                            {createMovementMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => {
                    const pattern = patterns.find(p => p.id === movement.movement_pattern_id);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {pattern ? (getTranslatedName(pattern) || pattern.slug) : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{movement.slug}</TableCell>
                        <TableCell className="font-medium">
                          {getTranslatedName(movement) || movement.slug}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {movement.translations?.en?.description || "-"}
                        </TableCell>
                        <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditMovementDialog(movement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Movement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this movement? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMovementMutation.mutate(movement.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {movements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {selectedPatternId 
                          ? "No movements found for this pattern. Add some movements to get started."
                          : "No movements found. Select a pattern and add movements to get started."
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Pattern Dialog */}
      <Dialog open={isEditPatternDialogOpen} onOpenChange={setIsEditPatternDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Movement Pattern</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePatternSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_pattern_slug">Slug</Label>
              <Input
                id="edit_pattern_slug"
                value={patternFormData.slug}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="press, row, squat..."
              />
            </div>
            <div>
              <Label htmlFor="edit_pattern_name_en">English Name</Label>
              <Input
                id="edit_pattern_name_en"
                value={patternFormData.name_en}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="Press, Row, Squat..."
              />
            </div>
            <div>
              <Label htmlFor="edit_pattern_description_en">English Description</Label>
              <Textarea
                id="edit_pattern_description_en"
                value={patternFormData.description_en}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, description_en: e.target.value }))}
                placeholder="Description of the movement pattern..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditPatternDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePatternMutation.isPending}>
                {updatePatternMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Movement Dialog */}
      <Dialog open={isEditMovementDialogOpen} onOpenChange={setIsEditMovementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_movement_pattern">Movement Pattern</Label>
              <Select 
                value={movementFormData.movement_pattern_id} 
                onValueChange={(value) => setMovementFormData(prev => ({ ...prev, movement_pattern_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {getTranslatedName(pattern) || pattern.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_movement_slug">Slug</Label>
              <Input
                id="edit_movement_slug"
                value={movementFormData.slug}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="chest-press, lat-pulldown..."
              />
            </div>
            <div>
              <Label htmlFor="edit_movement_name_en">English Name</Label>
              <Input
                id="edit_movement_name_en"
                value={movementFormData.name_en}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="Chest Press, Lat Pulldown..."
              />
            </div>
            <div>
              <Label htmlFor="edit_movement_description_en">English Description</Label>
              <Textarea
                id="edit_movement_description_en"
                value={movementFormData.description_en}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, description_en: e.target.value }))}
                placeholder="Description of the movement..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditMovementDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMovementMutation.isPending}>
                {updateMovementMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminMovementsManagement;