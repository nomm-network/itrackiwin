import React from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, NavLink } from "react-router-dom";
import { useCloneTemplateToWorkout, useCreateTemplate, useTemplates, useDeleteTemplate, useCloneTemplate } from "@/features/health/fitness/services/fitness.api";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useTranslations } from "@/hooks/useTranslations";

const Templates: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const navigate = useNavigate();
  const { data: templates } = useTemplates();
  const create = useCreateTemplate();
  const startFrom = useCloneTemplateToWorkout();
  const deleteTemplate = useDeleteTemplate();
  const cloneTemplate = useCloneTemplate();

  const startTemplate = async (templateId: string) => {
    const id = await startFrom.mutateAsync(templateId);
    navigate(`/fitness/session/${id}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(templateId);
    }
  };

  const handleCloneTemplate = async (templateId: string) => {
    const newId = await cloneTemplate.mutateAsync(templateId);
    navigate(`/fitness/templates/${newId}/edit`);
  };

  return (
    <>
      <PageNav current="Templates" />
      <nav className="container pt-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink to="/fitness" end className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Workouts
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/exercises" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Exercises
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/templates" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Templates
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Configure
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Workout Templates</h1>
          <Button onClick={async () => { 
            const name = prompt('Template name', 'Push Day') || 'New Template'; 
            const id = await create.mutateAsync(name); 
            navigate(`/fitness/templates/${id}/edit`);
          }}>New Template</Button>
        </div>

        <div className="grid gap-4 md:gap-6">
          {(templates ?? []).map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium truncate">{t.name || "New Template"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.notes || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/fitness/templates/${t.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleCloneTemplate(t.id)}
                    >
                      Clone
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteTemplate(t.id)}
                    >
                      Delete
                    </Button>
                    <Button size="sm" onClick={() => startTemplate(t.id)}>
                      Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!templates || templates.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No templates yet.</p>
                <Button onClick={async () => { 
                  const name = prompt('Template name', 'Push Day') || 'New Template'; 
                  const id = await create.mutateAsync(name); 
                  navigate(`/fitness/templates/${id}/edit`);
                }}>
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Templates;