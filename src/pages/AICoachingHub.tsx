import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, CheckCircle, BarChart3, MessageCircle } from "lucide-react";
import AICoach from "@/components/ai/AICoach";
import FormCoach from "@/components/ai/FormCoach";
import ProgressInsights from "@/components/ai/ProgressInsights";
import DebugPanel from "@/components/debug/DebugPanel";

const AICoachingHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AI Coaching</h1>
          </div>
          
          <Tabs defaultValue="coach" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coach" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Coach</span>
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Form</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="coach" className="mt-0">
              <AICoach />
            </TabsContent>
            
            <TabsContent value="form" className="mt-0">
              <FormCoach />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-0">
              <ProgressInsights />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <DebugPanel forceOpen={true} />
    </div>
  );
};

export default AICoachingHub;