import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Dumbbell, Target, Clock, Settings } from 'lucide-react';
import { useTemplates } from '@/features/health/fitness/services/fitness.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStartWorkout } from '@/workouts-sot/hooks';
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from '@/components/fitness/EnhancedReadinessCheckIn';

interface WorkoutSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkoutSelectionModal: React.FC<WorkoutSelectionModalProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showReadinessCheck, setShowReadinessCheck] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSearchQuery('');
      setIsStarting(false);
      setSelectedTemplateId(null);
      setShowReadinessCheck(false);
    }
  };
  
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useTemplates();
  const startWorkout = useStartWorkout();

  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) || ''
    );
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    return filtered.slice(0, 12);
  }, [templates, searchQuery]);

  const handleTemplateSelect = (templateId: string) => {
    if (isStarting) return;
    setSelectedTemplateId(templateId);
    setShowReadinessCheck(true);
  };

  const handleCreateProgram = () => {
    handleOpenChange(false);
    navigate('/app/programs');
  };

  const handleCreateTemplate = () => {
    handleOpenChange(false);
    navigate('/fitness/templates');
  };

  const handleReadinessSubmit = async (data: EnhancedReadinessData) => {
    if (!selectedTemplateId) return;
    
    try {
      setIsStarting(true);
      const result = await startWorkout.mutateAsync({ templateId: selectedTemplateId });
      
      // Navigate to workout with readiness data
      navigate(`/app/workouts/${result.workoutId}`);
      toast.success('Training session started!');
      handleOpenChange(false);
    } catch (error) {
      console.error('Failed to start workout:', error);
      toast.error('Failed to start training session');
      setIsStarting(false);
    }
  };

  if (showReadinessCheck && selectedTemplateId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <EnhancedReadinessCheckIn
              workoutId={selectedTemplateId}
              onSubmit={handleReadinessSubmit}
              onAbort={() => setShowReadinessCheck(false)}
              isLoading={isStarting || startWorkout.isPending}
            />
          </div>
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
            Choose Training Method
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Program Option */}
          <Card 
            className={`cursor-pointer hover:bg-accent/50 transition-colors ${isStarting ? 'pointer-events-none opacity-50' : ''}`} 
            onClick={handleCreateProgram}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Training Programs</h3>
                    <p className="text-sm text-muted-foreground">Follow structured progression plans</p>
                  </div>
                </div>
                <Badge variant="default">Programs</Badge>
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
              <h4 className="text-sm font-medium text-muted-foreground">Custom Templates</h4>
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${isStarting ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <Dumbbell className="h-5 w-5 text-secondary-foreground" />
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
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term or create your first template' : 'Create your first template to get started'}
              </p>
              <Button 
                variant="outline" 
                onClick={handleCreateTemplate}
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

export default WorkoutSelectionModal;