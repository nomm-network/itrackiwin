import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Target, Clock } from 'lucide-react';
import { useTemplates, useCloneTemplateToWorkout, useStartWorkout } from '@/features/health/fitness/services/fitness.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReadinessCheckIn, { ReadinessData } from './ReadinessCheckIn';

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showReadinessCheck, setShowReadinessCheck] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Reset state when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSearchQuery('');
      setSelectedTemplate(null);
      setShowReadinessCheck(false);
      setIsStarting(false);
    }
  };
  
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useTemplates();
  const startFromTemplate = useCloneTemplateToWorkout();
  const startFreeWorkout = useStartWorkout();

  // Filter and limit templates based on search query
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) || ''
    );
    
    // Sort user's own templates first, then by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    return filtered.slice(0, 10); // Limit to 10 templates
  }, [templates, searchQuery]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowReadinessCheck(true);
  };

  const handleStartWithoutTemplate = () => {
    setSelectedTemplate(null);
    setShowReadinessCheck(true);
  };

  const handleReadinessSubmit = async (readinessData: ReadinessData) => {
    if (isStarting) return; // Prevent double submissions
    
    setIsStarting(true);
    
    try {
      let workoutId: string;
      
      if (selectedTemplate) {
        workoutId = await startFromTemplate.mutateAsync(selectedTemplate);
      } else {
        // Start a free workout without template
        workoutId = await startFreeWorkout.mutateAsync(null);
      }
      
      // Navigate first, then close dialog and show success message
      navigate(`/fitness/session/${workoutId}`);
      
      // Small delay to ensure navigation starts before closing dialog
      setTimeout(() => {
        onOpenChange(false);
        toast.success('Workout started!');
      }, 100);
      
    } catch (error) {
      console.error('Failed to start workout:', error);
      toast.error('Failed to start workout');
      setIsStarting(false);
    }
  };

  const handleSkipReadiness = async () => {
    await handleReadinessSubmit({
      energy: 7,
      sleep_quality: 7,
      sleep_hours: 8,
      soreness: 3,
      stress: 3,
      illness: false,
      alcohol: false,
      supplements: [],
      notes: ''
    });
  };

  const handleBack = () => {
    setShowReadinessCheck(false);
    setSelectedTemplate(null);
  };

  if (showReadinessCheck) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="w-fit mb-2"
            >
              ← Back to Templates
            </Button>
          </DialogHeader>
          <ReadinessCheckIn 
            onSubmit={handleReadinessSubmit}
            onSkip={handleSkipReadiness}
            isLoading={isStarting}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select a Template
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Start Option */}
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleStartWithoutTemplate}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">Start a free workout without template</p>
                  </div>
                </div>
                <Badge variant="outline">Free</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <Target className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name || 'Unnamed Template'}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                          </div>
                          {template.notes && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {template.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Template</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term or' : 'Create your first template to get started'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  handleOpenChange(false);
                  navigate('/fitness/templates');
                }}
              >
                Create Template
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionDialog;