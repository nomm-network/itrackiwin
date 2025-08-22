import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">I Track</h1>
            <h2 className="text-3xl font-bold text-primary">I Win</h2>
            <p className="text-muted-foreground text-sm">
              Your personal fitness journey starts here
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/fitness/onboarding/settings')}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;