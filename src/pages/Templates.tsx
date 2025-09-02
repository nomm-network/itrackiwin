import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Plus, Edit, Trash2, Play, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

const TemplatesPage = () => {
  const navigate = useNavigate();
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['workout-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          notes,
          is_public,
          created_at,
          updated_at
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: publicTemplates, isLoading: publicLoading } = useQuery({
    queryKey: ['public-workout-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          notes,
          is_public,
          created_at,
          updated_at,
          user_id
        `)
        .eq('is_public', true)
        .neq('user_id', user?.id || '')
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
      
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Delete error:', error);
    }
  };

  const renderTemplateCard = (template: any, isPublic = false) => (
    <Card key={template.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {isPublic && <Globe className="h-4 w-4 text-muted-foreground" />}
              {!isPublic && (
                <Badge variant={template.is_public ? "default" : "secondary"} className="text-xs">
                  {template.is_public ? (
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
              )}
            </div>
            {template.notes && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {template.notes}
              </p>
            )}
          </div>
          {!isPublic && (
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
            onClick={() => navigate(`/fitness/workout/start?template=${template.id}`)}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workout Templates</h1>
          <p className="text-muted-foreground">Create and manage your workout templates</p>
        </div>
        <Button onClick={() => navigate('/fitness/templates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="my-templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="public-templates">Public Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-templates" className="mt-6">
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
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => renderTemplateCard(template, false))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workout template to get started
                </p>
                <Button onClick={() => navigate('/fitness/templates/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="public-templates" className="mt-6">
          {publicLoading ? (
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
          ) : publicTemplates && publicTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicTemplates.map((template) => renderTemplateCard(template, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No public templates available</h3>
                <p className="text-muted-foreground mb-4">
                  Check back later as more users share their templates publicly
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatesPage;