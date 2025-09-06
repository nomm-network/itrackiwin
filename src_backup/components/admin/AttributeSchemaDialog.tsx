import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { 
  useCreateAttributeSchema, 
  useUpdateAttributeSchema, 
  useMovements, 
  useEquipments,
  type AttributeScope 
} from '@/hooks/useAttributeSchemas';
import { AttributeSchemaPreview } from './AttributeSchemaPreview';

interface AttributeSchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSchema?: any;
}

export const AttributeSchemaDialog: React.FC<AttributeSchemaDialogProps> = ({
  open,
  onOpenChange,
  editingSchema
}) => {
  const [scope, setScope] = useState<AttributeScope>('global');
  const [scopeRefId, setScopeRefId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [schemaJson, setSchemaJson] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const { data: movements } = useMovements();
  const { data: equipments } = useEquipments();
  const createMutation = useCreateAttributeSchema();
  const updateMutation = useUpdateAttributeSchema();

  useEffect(() => {
    if (editingSchema) {
      setScope(editingSchema.scope);
      setScopeRefId(editingSchema.scope_ref_id || '');
      setTitle(editingSchema.title);
      setSchemaJson(JSON.stringify(editingSchema.schema_json, null, 2));
    } else {
      // Set default schema template
      const defaultSchema = {
        groups: [
          {
            key: "example_group",
            label: "Example Group",
            attributes: [
              {
                key: "example_enum",
                label: "Example Choice",
                type: "enum",
                values: [
                  { key: "option1", label: "Option 1" },
                  { key: "option2", label: "Option 2" }
                ],
                default: "option1"
              }
            ]
          }
        ]
      };
      setSchemaJson(JSON.stringify(defaultSchema, null, 2));
    }
  }, [editingSchema]);

  const handleSave = () => {
    try {
      const parsedSchema = JSON.parse(schemaJson);
      
      const schemaData = {
        scope,
        scope_ref_id: scope === 'global' ? null : scopeRefId,
        title,
        schema_json: parsedSchema,
        is_active: true,
        version: editingSchema ? editingSchema.version + 1 : 1
      };

      if (editingSchema) {
        updateMutation.mutate({ id: editingSchema.id, ...schemaData });
      } else {
        createMutation.mutate(schemaData);
      }
    } catch (error) {
      alert('Invalid JSON schema. Please check your syntax.');
      return;
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      // Reset form
      setScope('global');
      setScopeRefId('');
      setTitle('');
      setSchemaJson('');
      setActiveTab('editor');
    }
  }, [isSuccess, onOpenChange]);

  const parsedSchema = (() => {
    try {
      return JSON.parse(schemaJson);
    } catch {
      return null;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSchema ? 'Edit Attribute Schema' : 'Create Attribute Schema'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Schema Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={scope} onValueChange={(value: AttributeScope) => setScope(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="movement">Movement</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope !== 'global' && (
                <div className="space-y-2">
                  <Label htmlFor="scope-ref">
                    {scope === 'movement' ? 'Movement' : 'Equipment'}
                  </Label>
                  <Select value={scopeRefId} onValueChange={setScopeRefId}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${scope}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(scope === 'movement' ? movements : equipments)?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter schema title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schema">Schema JSON</Label>
              <Textarea
                id="schema"
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                placeholder="Enter schema JSON"
                className="min-h-[400px] font-mono text-sm"
              />
              <div className="text-sm text-muted-foreground">
                Define your attribute groups and fields in JSON format. See documentation for examples.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {parsedSchema ? (
              <AttributeSchemaPreview schema={parsedSchema} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Invalid JSON schema. Please fix the syntax in the editor.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !title || !schemaJson}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingSchema ? 'Update' : 'Create'} Schema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};