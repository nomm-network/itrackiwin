import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Copy } from 'lucide-react';
import { useNamingTemplates, useMovements, useEquipments, useDeleteNamingTemplate } from '@/hooks/useNamingTemplates';
import { NamingTemplateDialog } from './NamingTemplateDialog';
import { useState } from 'react';

export const NamingTemplatesList: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const { data: templates, isLoading } = useNamingTemplates();
  const { data: movements } = useMovements();
  const { data: equipments } = useEquipments();
  const deleteMutation = useDeleteNamingTemplate();

  const getScopeReference = (template: any) => {
    if (template.scope === 'global') return 'Global';
    if (template.scope === 'movement') {
      const movement = movements?.find(m => m.id === template.scope_ref_id);
      return movement ? `Movement: ${movement.name}` : 'Movement: Unknown';
    }
    if (template.scope === 'equipment') {
      const equipment = equipments?.find(e => e.id === template.scope_ref_id);
      return equipment ? `Equipment: ${equipment.name}` : 'Equipment: Unknown';
    }
    return 'Unknown';
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDuplicate = (template: any) => {
    const duplicated = {
      ...template,
      id: undefined,
      version: 1
    };
    setEditingTemplate(duplicated);
    setDialogOpen(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this naming template?')) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  if (isLoading) {
    return <div>Loading naming templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Naming Templates</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>Available placeholders:</strong></p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Core fields:</strong> {'{PrimaryMuscle}'}, {'{Movement}'}, {'{Equipment}'}, {'{Handle}'}, {'{Grip}'}</p>
          </div>
          <div>
            <p><strong>Optional (use ? to hide when empty):</strong> {'{AngleDegrees?}'}, {'{Handle?}'}, {'{Grip?}'}</p>
          </div>
        </div>
        <p><strong>Attributes:</strong> Use PascalCase: angle → {'{Angle}'}, grip_type → {'{GripType}'}</p>
      </div>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {getScopeReference(template)} Template
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{template.locale.toUpperCase()}</Badge>
                    <Badge variant="secondary">v{template.version}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Template:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{template.template}</code>
                </div>
                <div className="text-sm text-muted-foreground">
                  Separator: "{template.sep}" | Updated: {new Date(template.updated_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {templates?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No naming templates found. Create your first template to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NamingTemplateDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingTemplate={editingTemplate}
      />
    </div>
  );
};