import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Save, Eye } from 'lucide-react';
import { useTemplateGenerator, useSaveGeneratedTemplate } from '../hooks/useTemplateGenerator.hook';
import { useEquipmentCapabilities } from '../hooks/useEquipmentCapabilities.hook';
import { type TemplateGeneratorInputs, type GeneratedTemplate } from '../services/templateGenerator.service';
import { toast } from 'sonner';

interface TemplateGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function TemplateGeneratorDialog({ isOpen, onClose, userId }: TemplateGeneratorDialogProps) {
  const [inputs, setInputs] = useState<TemplateGeneratorInputs>({
    userId,
    goal: 'general_fitness',
    experienceLevel: 'beginner',
    daysPerWeek: 3,
    sessionLengthMinutes: 60,
    prioritizedMuscles: [],
    injuries: []
  });

  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: equipmentCaps } = useEquipmentCapabilities(userId);
  const generateMutation = useTemplateGenerator();
  const saveMutation = useSaveGeneratedTemplate();

  const handleGenerate = async () => {
    try {
      const template = await generateMutation.mutateAsync({
        ...inputs,
        equipmentCapabilities: equipmentCaps
      });
      setGeneratedTemplate(template);
      setShowPreview(true);
      toast.success('Template generated successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleSave = async () => {
    if (!generatedTemplate) return;

    try {
      await saveMutation.mutateAsync({
        template: generatedTemplate.template,
        exercises: generatedTemplate.exercises,
        userId
      });
      onClose();
      setGeneratedTemplate(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const updateInput = <K extends keyof TemplateGeneratorInputs>(
    key: K,
    value: TemplateGeneratorInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  if (showPreview && generatedTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview: {generatedTemplate.template.name}
            </DialogTitle>
            <DialogDescription>
              {generatedTemplate.template.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <Badge variant="secondary">
                    {generatedTemplate.template.estimated_duration_minutes} min
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Difficulty:</span>
                  <Badge variant="outline">
                    {generatedTemplate.template.difficulty_level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Exercises:</span>
                  <Badge>{generatedTemplate.exercises.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercise Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedTemplate.exercises.map((exercise, index) => (
                    <div key={exercise.exerciseId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">Exercise #{exercise.orderIndex}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.defaultSets} sets × {exercise.repRangeMin}-{exercise.repRangeMax} reps
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline">{exercise.restSeconds}s rest</Badge>
                        <div className="text-xs text-muted-foreground">{exercise.setType}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {generatedTemplate.template.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Training Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {generatedTemplate.template.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Back to Generator
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Workout Template
          </DialogTitle>
          <DialogDescription>
            Create a personalized workout template based on your goals and available equipment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Training Goal</Label>
              <Select
                value={inputs.goal}
                onValueChange={(value: any) => updateInput('goal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="powerlifting">Powerlifting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={inputs.experienceLevel}
                onValueChange={(value: any) => updateInput('experienceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Training Frequency: {inputs.daysPerWeek} days per week</Label>
            <Slider
              value={[inputs.daysPerWeek]}
              onValueChange={([value]) => updateInput('daysPerWeek', value)}
              min={3}
              max={6}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 days</span>
              <span>6 days</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Session Length: {inputs.sessionLengthMinutes} minutes</Label>
            <Slider
              value={[inputs.sessionLengthMinutes]}
              onValueChange={([value]) => updateInput('sessionLengthMinutes', value)}
              min={30}
              max={120}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 min</span>
              <span>120 min</span>
            </div>
          </div>

          {equipmentCaps && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {equipmentCaps.bars.available && (
                    <Badge variant="outline">Barbells</Badge>
                  )}
                  {equipmentCaps.dumbbells.available && (
                    <Badge variant="outline">Dumbbells</Badge>
                  )}
                  {equipmentCaps.machines.available && (
                    <Badge variant="outline">Machines</Badge>
                  )}
                  {equipmentCaps.cables.available && (
                    <Badge variant="outline">Cables</Badge>
                  )}
                  {!equipmentCaps.bars.available && 
                   !equipmentCaps.dumbbells.available && 
                   !equipmentCaps.machines.available && 
                   !equipmentCaps.cables.available && (
                    <Badge variant="secondary">Bodyweight Only</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}