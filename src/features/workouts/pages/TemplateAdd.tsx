import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateTemplate } from '@/features/health/fitness/services/fitness.api';
import { toast } from 'sonner';

const TemplateAddPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  const createTemplate = useCreateTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      const templateId = await createTemplate.mutateAsync(name.trim());
      toast.success('Template created successfully! Now go and add exercises to it!');
      navigate(`/fitness/templates/${templateId}/edit`);
    } catch (error) {
      toast.error('Failed to create template');
      console.error('Create template error:', error);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/app/templates')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this template..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Make this template public</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/templates')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplate.isPending || !name.trim()}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {createTemplate.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateAddPage;