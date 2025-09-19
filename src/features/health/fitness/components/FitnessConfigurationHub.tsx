import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FitnessProfile from './FitnessProfile';
import { BodyMetricsForm } from '@/components/health/BodyMetricsForm';

export const FitnessConfigurationHub = () => {
  return (
    <div className="container py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Fitness Configuration Hub</h1>
          <p className="text-muted-foreground">
            Set up your fitness profile, body tracking, and training preferences.
          </p>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Fitness Profile</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <FitnessProfile />
          </TabsContent>
          
          <TabsContent value="body">
            <Card>
              <CardHeader>
                <CardTitle>Body Metrics Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <BodyMetricsForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Equipment configuration coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};