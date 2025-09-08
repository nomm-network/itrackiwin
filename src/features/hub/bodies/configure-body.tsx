import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConfigureBody() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6" />
          <h2 className="text-xl font-bold">Configure</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Customize your fitness preferences and settings.
        </p>
        <Button onClick={() => navigate('/fitness/configure')}>
          Open Fitness Configuration
        </Button>
      </CardContent>
    </Card>
  );
}