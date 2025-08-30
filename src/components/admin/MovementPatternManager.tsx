import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
  translations?: Record<string, { name: string; description?: string }>;
}

interface MovementPatternManagerProps {
  selectedPatternId?: string;
  onPatternSelect?: (patternId: string) => void;
  selectedMovementId?: string;
  onMovementSelect?: (movementId: string) => void;
}

export function MovementPatternManager({ 
  selectedPatternId,
  onPatternSelect,
  selectedMovementId,
  onMovementSelect 
}: MovementPatternManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreatePatternDialogOpen, setIsCreatePatternDialogOpen] = useState(false);
  const [isEditPatternDialogOpen, setIsEditPatternDialogOpen] = useState(false);
  const [isCreateMovementDialogOpen, setIsCreateMovementDialogOpen] = useState(false);
  const [isEditMovementDialogOpen, setIsEditMovementDialogOpen] = useState(false);
  
  const [editingPattern, setEditingPattern] = useState<MovementPattern | null>(null);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  
  const [patternFormData, setPatternFormData] = useState({
    slug: '',
    name_en: '',
    description_en: '',
  });
  
  const [movementFormData, setMovementFormData] = useState({
    slug: '',
    name_en: '',
    description_en: '',
    movement_pattern_id: '',
  });

  // Fetch movement patterns with translations
  const { data: movementPatterns = [] } = useQuery({
    queryKey: ['movement-patterns-with-translations'],
    queryFn: async () => {
      const { data: patternsData, error: patternsError } = await supabase
        .from('movement_patterns')
        .select('*')
        .order('slug');
      if (patternsError) throw patternsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('movement_patterns_translations')
        .select('*');
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
  const { data: movements = [] } = useQuery({
    queryKey: ['movements-with-translations'],
    queryFn: async () => {
      const { data: movementsData, error: movementsError } = await supabase
        .from('movements')
        .select('*')
        .order('slug');
      if (movementsError) throw movementsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('movement_translations')
        .select('*');
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

  // Filtered movements for selected pattern
  const filteredMovements = selectedPatternId 
    ? movements.filter(m => m.movement_pattern_id === selectedPatternId)
    : movements;

  // Pattern mutations
  const createPatternMutation = useMutation({
    mutationFn: async (data: typeof patternFormData) => {
      const { data: pattern, error: patternError } = await supabase
        .from('movement_patterns')
        .insert({ slug: data.slug })
        .select()
        .single();
      if (patternError) throw patternError;

      const { error: translationError } = await supabase
        .from('movement_patterns_translations')
        .insert({
          movement_pattern_id: pattern.id,
          language_code: 'en',
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;

      return pattern;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movement-patterns-with-translations'] });
      toast({ title: 'Success', description: 'Movement pattern created successfully' });
      setIsCreatePatternDialogOpen(false);
      resetPatternForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create pattern: ${error.message}`, variant: 'destructive' });
    },
  });

  const updatePatternMutation = useMutation({
    mutationFn: async (data: typeof patternFormData) => {
      if (!editingPattern) throw new Error('No pattern selected for editing');

      const { error: patternError } = await supabase
        .from('movement_patterns')
        .update({ slug: data.slug })
        .eq('id', editingPattern.id);
      if (patternError) throw patternError;

      const { error: translationError } = await supabase
        .from('movement_patterns_translations')
        .upsert({
          movement_pattern_id: editingPattern.id,
          language_code: 'en',
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movement-patterns-with-translations'] });
      toast({ title: 'Success', description: 'Movement pattern updated successfully' });
      setIsEditPatternDialogOpen(false);
      setEditingPattern(null);
      resetPatternForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update pattern: ${error.message}`, variant: 'destructive' });
    },
  });

  const deletePatternMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('movement_patterns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movement-patterns-with-translations'] });
      toast({ title: 'Success', description: 'Movement pattern deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete pattern: ${error.message}`, variant: 'destructive' });
    },
  });

  // Movement mutations
  const createMovementMutation = useMutation({
    mutationFn: async (data: typeof movementFormData) => {
      const { data: movement, error: movementError } = await supabase
        .from('movements')
        .insert({ 
          slug: data.slug,
          movement_pattern_id: data.movement_pattern_id 
        })
        .select()
        .single();
      if (movementError) throw movementError;

      const { error: translationError } = await supabase
        .from('movement_translations')
        .insert({
          movement_id: movement.id,
          language_code: 'en',
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;

      return movement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements-with-translations'] });
      toast({ title: 'Success', description: 'Movement created successfully' });
      setIsCreateMovementDialogOpen(false);
      resetMovementForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create movement: ${error.message}`, variant: 'destructive' });
    },
  });

  const updateMovementMutation = useMutation({
    mutationFn: async (data: typeof movementFormData) => {
      if (!editingMovement) throw new Error('No movement selected for editing');

      const { error: movementError } = await supabase
        .from('movements')
        .update({ 
          slug: data.slug,
          movement_pattern_id: data.movement_pattern_id 
        })
        .eq('id', editingMovement.id);
      if (movementError) throw movementError;

      const { error: translationError } = await supabase
        .from('movement_translations')
        .upsert({
          movement_id: editingMovement.id,
          language_code: 'en',
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements-with-translations'] });
      toast({ title: 'Success', description: 'Movement updated successfully' });
      setIsEditMovementDialogOpen(false);
      setEditingMovement(null);
      resetMovementForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update movement: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteMovementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements-with-translations'] });
      toast({ title: 'Success', description: 'Movement deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete movement: ${error.message}`, variant: 'destructive' });
    },
  });

  const resetPatternForm = () => {
    setPatternFormData({ slug: '', name_en: '', description_en: '' });
    setEditingPattern(null);
  };

  const resetMovementForm = () => {
    setMovementFormData({ slug: '', name_en: '', description_en: '', movement_pattern_id: selectedPatternId || '' });
    setEditingMovement(null);
  };

  const openEditPatternDialog = (pattern: MovementPattern) => {
    setEditingPattern(pattern);
    setPatternFormData({
      slug: pattern.slug,
      name_en: pattern.translations?.en?.name || '',
      description_en: pattern.translations?.en?.description || '',
    });
    setIsEditPatternDialogOpen(true);
  };

  const openEditMovementDialog = (movement: Movement) => {
    setEditingMovement(movement);
    setMovementFormData({
      slug: movement.slug,
      name_en: movement.translations?.en?.name || '',
      description_en: movement.translations?.en?.description || '',
      movement_pattern_id: movement.movement_pattern_id,
    });
    setIsEditMovementDialogOpen(true);
  };

  const getPatternName = (pattern: MovementPattern) => {
    return pattern.translations?.en?.name || pattern.slug;
  };

  const getMovementName = (movement: Movement) => {
    return movement.translations?.en?.name || movement.slug;
  };

  return (
    <div className="space-y-6">
      {/* Movement Patterns Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Movement Patterns
            </CardTitle>
            <Dialog open={isCreatePatternDialogOpen} onOpenChange={setIsCreatePatternDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pattern
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Movement Pattern</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern-slug">Slug *</Label>
                    <Input
                      id="pattern-slug"
                      value={patternFormData.slug}
                      onChange={(e) => setPatternFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., push, pull, squat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pattern-name">Name (English) *</Label>
                    <Input
                      id="pattern-name"
                      value={patternFormData.name_en}
                      onChange={(e) => setPatternFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="e.g., Push Movement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pattern-description">Description (English)</Label>
                    <Textarea
                      id="pattern-description"
                      value={patternFormData.description_en}
                      onChange={(e) => setPatternFormData(prev => ({ ...prev, description_en: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatePatternDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createPatternMutation.mutate(patternFormData)}
                      disabled={!patternFormData.slug || !patternFormData.name_en}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movementPatterns.map((pattern) => (
                <TableRow 
                  key={pattern.id}
                  className={selectedPatternId === pattern.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted/50'}
                  onClick={() => onPatternSelect?.(pattern.id)}
                >
                  <TableCell className="font-mono text-sm">{pattern.slug}</TableCell>
                  <TableCell className="font-medium">{getPatternName(pattern)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {pattern.translations?.en?.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPatternDialog(pattern);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Movement Pattern</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{getPatternName(pattern)}"? This will also delete all associated movements.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePatternMutation.mutate(pattern.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movements Section */}
      {selectedPatternId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Movements
                <Badge variant="secondary">{filteredMovements.length}</Badge>
              </CardTitle>
              <Dialog open={isCreateMovementDialogOpen} onOpenChange={setIsCreateMovementDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Movement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Movement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="movement-pattern">Movement Pattern</Label>
                      <Input 
                        value={movementPatterns.find(p => p.id === selectedPatternId)?.slug || ''}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement-slug">Slug *</Label>
                      <Input
                        id="movement-slug"
                        value={movementFormData.slug}
                        onChange={(e) => setMovementFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., bench_press, squat, deadlift"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement-name">Name (English) *</Label>
                      <Input
                        id="movement-name"
                        value={movementFormData.name_en}
                        onChange={(e) => setMovementFormData(prev => ({ ...prev, name_en: e.target.value }))}
                        placeholder="e.g., Bench Press, Squat, Deadlift"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement-description">Description (English)</Label>
                      <Textarea
                        id="movement-description"
                        value={movementFormData.description_en}
                        onChange={(e) => setMovementFormData(prev => ({ ...prev, description_en: e.target.value }))}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateMovementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => createMovementMutation.mutate({
                          ...movementFormData,
                          movement_pattern_id: selectedPatternId
                        })}
                        disabled={!movementFormData.slug || !movementFormData.name_en}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow 
                    key={movement.id}
                    className={selectedMovementId === movement.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted/50'}
                    onClick={() => onMovementSelect?.(movement.id)}
                  >
                    <TableCell className="font-mono text-sm">{movement.slug}</TableCell>
                    <TableCell className="font-medium">{getMovementName(movement)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {movement.translations?.en?.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditMovementDialog(movement);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Movement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{getMovementName(movement)}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMovementMutation.mutate(movement.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredMovements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No movements found for this pattern. Add some movements above.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Pattern Dialog */}
      <Dialog open={isEditPatternDialogOpen} onOpenChange={setIsEditPatternDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Movement Pattern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-pattern-slug">Slug *</Label>
              <Input
                id="edit-pattern-slug"
                value={patternFormData.slug}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pattern-name">Name (English) *</Label>
              <Input
                id="edit-pattern-name"
                value={patternFormData.name_en}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, name_en: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pattern-description">Description (English)</Label>
              <Textarea
                id="edit-pattern-description"
                value={patternFormData.description_en}
                onChange={(e) => setPatternFormData(prev => ({ ...prev, description_en: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditPatternDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => updatePatternMutation.mutate(patternFormData)}
                disabled={!patternFormData.slug || !patternFormData.name_en}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Movement Dialog */}
      <Dialog open={isEditMovementDialogOpen} onOpenChange={setIsEditMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Movement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-movement-pattern">Movement Pattern</Label>
              <Input 
                value={movementPatterns.find(p => p.id === movementFormData.movement_pattern_id)?.slug || ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-movement-slug">Slug *</Label>
              <Input
                id="edit-movement-slug"
                value={movementFormData.slug}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-movement-name">Name (English) *</Label>
              <Input
                id="edit-movement-name"
                value={movementFormData.name_en}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, name_en: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-movement-description">Description (English)</Label>
              <Textarea
                id="edit-movement-description"
                value={movementFormData.description_en}
                onChange={(e) => setMovementFormData(prev => ({ ...prev, description_en: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditMovementDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => updateMovementMutation.mutate(movementFormData)}
                disabled={!movementFormData.slug || !movementFormData.name_en}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}