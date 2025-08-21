import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Rocket } from 'lucide-react';

interface EmptyCategoryProps {
  category: string;
  subcategory?: string;
  icon?: string;
  onGetStarted?: () => void;
}

const EmptyCategory: React.FC<EmptyCategoryProps> = ({ 
  category, 
  subcategory, 
  icon = "🚀",
  onGetStarted 
}) => {
  return (
    <Card className="col-span-full">
      <CardContent className="pt-12 pb-12 text-center space-y-6">
        <div className="text-8xl mb-4">{icon}</div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold capitalize">
            {category} {subcategory && `- ${subcategory}`}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This area is ready for development! Track your progress, set goals, and build habits 
            that matter in your {category} journey.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onGetStarted && (
            <Button onClick={onGetStarted} className="gap-2">
              <Rocket className="h-4 w-4" />
              Get Started
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Coming Soon
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          💡 This modular system allows us to add new features quickly while keeping everything organized
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyCategory;