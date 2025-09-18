import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Calendar, PlayCircle } from 'lucide-react';
import { AIProgram } from '../hooks/useBroAICoach';

interface ProgramPreviewProps {
  program: AIProgram;
  onStartProgram?: () => void;
}

export function ProgramPreview({ program, onStartProgram }: ProgramPreviewProps) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-primary" />
          {program.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            AI Generated
          </div>
          <Badge variant="secondary" className="capitalize">
            {program.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">AI Generated Program</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={program.is_active ? 'default' : 'outline'}>
                  {program.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(program.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {program.description || 'AI generated training program customized for your goals and preferences.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6">
          {onStartProgram && (
            <Button onClick={onStartProgram} size="lg" className="mt-4">
              <PlayCircle className="h-4 w-4 mr-2" />
              Start This Program
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}