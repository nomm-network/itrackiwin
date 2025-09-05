import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dumbbell, Plus, Edit, Trash2, Play, Globe, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMyTemplates, setShowOnlyMyTemplates] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch all templates (user's own + public)
  const { data: allTemplates, isLoading } = useQuery({
    queryKey: ['all-workout-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          notes,
          is_public,
          created_at,
          user_id
        `)
        .or(`user_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId);
        
      if (error) throw error;
      
      // Invalidate templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['all-workout-templates'] });
      
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Delete error:', error);
    }
  };

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    if (!allTemplates || !user) return [];
    
    let filtered = allTemplates;
    
    // Filter by ownership if toggle is on
    if (showOnlyMyTemplates) {
      filtered = filtered.filter(template => template.user_id === user.id);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        (template.notes && template.notes.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [allTemplates, user, showOnlyMyTemplates, searchQuery]);

  const renderTemplateCard = (template: any) => {
    const isOwner = template.user_id === user?.id;
    const isPublic = template.is_public;
    
    return (
      <Card key={template.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={isPublic ? "default" : "secondary"} className="text-xs">
                  {isPublic ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
                {!isOwner && (
                  <Badge variant="outline" className="text-xs">
                    Community
                  </Badge>
                )}
              </div>
              {template.notes && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {template.notes}
                </p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/fitness/templates/${template.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Created {new Date(template.created_at).toLocaleDateString()}
            </div>
            <Button
              onClick={() => {
                // Use the start_workout RPC function like in the Training Center
                const startWorkout = async () => {
                  try {
                    const { data, error } = await supabase.rpc('start_workout', { 
                      p_template_id: template.id 
                    });
                    
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    
                    if (data) {
                      navigate(`/app/workouts/${data}`);
                      toast.success('Workout started!');
                    }
                  } catch (e: any) {
                    toast.error('Failed to start workout');
                  }
                };
                startWorkout();
              }}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-6 pb-nav-safe">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workout Templates</h1>
          <p className="text-muted-foreground">Create and manage your workout templates</p>
        </div>
        <Button onClick={() => navigate('/fitness/templates/create/edit')}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-only-mine"
              checked={showOnlyMyTemplates}
              onCheckedChange={setShowOnlyMyTemplates}
            />
            <label
              htmlFor="show-only-mine"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only my templates
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => renderTemplateCard(template))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery.trim() ? 'No templates found' : showOnlyMyTemplates ? 'No templates yet' : 'No templates available'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery.trim() 
                ? 'Try adjusting your search terms or filters'
                : showOnlyMyTemplates 
                  ? 'Create your first workout template to get started'
                  : 'Check back later as more templates become available'
              }
            </p>
            {(!searchQuery.trim() && showOnlyMyTemplates) && (
              <Button onClick={() => navigate('/fitness/templates/create/edit')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplatesPage;