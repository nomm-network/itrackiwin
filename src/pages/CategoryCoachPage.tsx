import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const CATEGORY_INFO: Record<string, { name: string; icon: string; description: string }> = {
  health: {
    name: "Health",
    icon: "💪",
    description: "Your fitness and wellness journey starts here"
  },
  wealth: {
    name: "Wealth", 
    icon: "💰",
    description: "Build financial freedom and security"
  },
  productivity: {
    name: "Productivity",
    icon: "⚡",
    description: "Optimize your time and achieve more"
  },
  spirituality: {
    name: "Spirituality",
    icon: "🧘",
    description: "Connect with your inner self and purpose"
  },
  purpose: {
    name: "Purpose",
    icon: "🎯", 
    description: "Discover and pursue your life's mission"
  },
  relationships: {
    name: "Relationships",
    icon: "❤️",
    description: "Build meaningful connections with others"
  }
};

export default function CategoryCoachPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const category = slug ? CATEGORY_INFO[slug] : null;
  
  if (!category) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Category not found</p>
            <Button onClick={() => navigate('/planets')}>
              Back to Atlas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/planets')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Atlas
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">{category.icon}</div>
          <CardTitle className="text-2xl">{category.name} Coach</CardTitle>
          <p className="text-muted-foreground">{category.description}</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">AI Coach Coming Soon</span>
            <Sparkles className="h-5 w-5" />
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your personalized {category.name.toLowerCase()} coach is being prepared. 
              Soon you'll be able to get tailored advice, set goals, and track your progress.
            </p>
            
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-2">What to expect:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Personalized coaching conversations</li>
                <li>• Goal setting and progress tracking</li>
                <li>• Daily insights and recommendations</li>
                <li>• Integration with your other life areas</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => navigate('/planets')}
              className="w-full"
            >
              Explore Other Areas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}