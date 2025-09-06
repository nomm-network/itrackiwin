import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Copy } from 'lucide-react';
import { useAttributeSchemas, useMovements, useEquipments, useDeleteAttributeSchema } from '@/hooks/useAttributeSchemas';
import { AttributeSchemaDialog } from './AttributeSchemaDialog';
import { useState } from 'react';

export const AttributeSchemasList: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  
  const { data: schemas, isLoading } = useAttributeSchemas();
  const { data: movements } = useMovements();
  const { data: equipments } = useEquipments();
  const deleteMutation = useDeleteAttributeSchema();

  const getScopeReference = (schema: any) => {
    if (schema.scope === 'global') return 'Global';
    if (schema.scope === 'movement') {
      const movement = movements?.find(m => m.id === schema.scope_ref_id);
      return movement ? `Movement: ${movement.name}` : 'Movement: Unknown';
    }
    if (schema.scope === 'equipment') {
      const equipment = equipments?.find(e => e.id === schema.scope_ref_id);
      return equipment ? `Equipment: ${equipment.name}` : 'Equipment: Unknown';
    }
    return 'Unknown';
  };

  const handleEdit = (schema: any) => {
    setEditingSchema(schema);
    setDialogOpen(true);
  };

  const handleDuplicate = (schema: any) => {
    const duplicated = {
      ...schema,
      id: undefined,
      title: `${schema.title} (Copy)`,
      version: 1
    };
    setEditingSchema(duplicated);
    setDialogOpen(true);
  };

  const handleDelete = (schemaId: string) => {
    if (confirm('Are you sure you want to delete this attribute schema?')) {
      deleteMutation.mutate(schemaId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSchema(null);
  };

  if (isLoading) {
    return <div>Loading attribute schemas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Attribute Schemas</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Schema
        </Button>
      </div>

      <div className="grid gap-4">
        {schemas?.map((schema) => (
          <Card key={schema.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{schema.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{getScopeReference(schema)}</Badge>
                    <Badge variant="secondary">v{schema.version}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schema)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(schema)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schema.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Groups: {schema.schema_json?.groups?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Updated: {new Date(schema.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AttributeSchemaDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingSchema={editingSchema}
      />
    </div>
  );
};