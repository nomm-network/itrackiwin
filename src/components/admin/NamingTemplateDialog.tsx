import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { 
  useCreateNamingTemplate, 
  useUpdateNamingTemplate, 
  useMovements, 
  useEquipments,
  buildExerciseName,
  type NamingTemplate 
} from '@/hooks/useNamingTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NamingTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate?: any;
}

export const NamingTemplateDialog: React.FC<NamingTemplateDialogProps> = ({
  open,
  onOpenChange,
  editingTemplate
}) => {
  const [scope, setScope] = useState<'global' | 'movement' | 'equipment'>('global');
  const [scopeRefId, setScopeRefId] = useState<string>('');
  const [locale, setLocale] = useState('en');
  const [template, setTemplate] = useState('');
  const [separator, setSeparator] = useState(' – ');

  const { data: movements } = useMovements();
  const { data: equipments } = useEquipments();
  const createMutation = useCreateNamingTemplate();
  const updateMutation = useUpdateNamingTemplate();

  useEffect(() => {
    if (editingTemplate) {
      setScope(editingTemplate.scope);
      setScopeRefId(editingTemplate.scope_ref_id || '');
      setLocale(editingTemplate.locale);
      setTemplate(editingTemplate.template);
      setSeparator(editingTemplate.sep);
    } else {
      // Set default template
      setTemplate('{PrimaryMuscle} – {Angle?}{AngleDegrees?} {Equipment} {Movement} {Handle?} {Grip?}');
    }
  }, [editingTemplate]);

  const handleSave = () => {
    const templateData = {
      scope,
      scope_ref_id: scope === 'global' ? null : scopeRefId,
      locale,
      template,
      sep: separator,
      is_active: true,
      version: editingTemplate ? editingTemplate.version + 1 : 1
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, ...templateData });
    } else {
      createMutation.mutate(templateData);
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
      setLocale('en');
      setTemplate('{PrimaryMuscle} – {Angle?}{AngleDegrees?} {Equipment} {Movement} {Handle?} {Grip?}');
      setSeparator(' – ');
    }
  }, [isSuccess, onOpenChange]);

  // Preview example
  const previewName = buildExerciseName({
    template,
    primaryMuscle: 'Chest',
    movement: 'Press',
    equipment: 'Barbell',
    attrs: { angle: 'incline', angle_degrees: '30' },
    handle: '',
    grip: 'pronated',
    separator
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? 'Edit Naming Template' : 'Create Naming Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={scope} onValueChange={(value: 'global' | 'movement' | 'equipment') => setScope(value)}>
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

              <div className="space-y-2">
                <Label htmlFor="locale">Language</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ro">Romanian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="separator">Separator</Label>
              <Input
                id="separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                placeholder="e.g., ' – '"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Enter template with placeholders"
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="text-sm text-muted-foreground">
                Use placeholders like {'{PrimaryMuscle}'}, {'{Movement}'}, {'{Equipment}'}. Add ? for optional: {'{Handle?}'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Generated Name:</Label>
                    <div className="mt-1 p-3 bg-muted rounded text-sm font-mono">
                      {previewName || 'Empty template'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Example data used:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Primary Muscle: "Chest"</li>
                      <li>Movement: "Press"</li>
                      <li>Equipment: "Barbell"</li>
                      <li>Angle: "incline"</li>
                      <li>Angle Degrees: "30"</li>
                      <li>Grip: "pronated"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Placeholders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Core Fields:</strong>
                    <ul className="list-disc list-inside ml-2 text-xs">
                      <li>{'{PrimaryMuscle}'}</li>
                      <li>{'{Movement}'}</li>
                      <li>{'{Equipment}'}</li>
                      <li>{'{Handle}'}</li>
                      <li>{'{Grip}'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Attributes (PascalCase):</strong>
                    <ul className="list-disc list-inside ml-2 text-xs">
                      <li>angle → {'{Angle}'}</li>
                      <li>angle_degrees → {'{AngleDegrees}'}</li>
                      <li>grip_type → {'{GripType}'}</li>
                      <li>stance → {'{Stance}'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Optional (append ?):</strong>
                    <ul className="list-disc list-inside ml-2 text-xs">
                      <li>{'{Handle?}'} - hidden if empty</li>
                      <li>{'{AngleDegrees?}'} - hidden if empty</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !template}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingTemplate ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};