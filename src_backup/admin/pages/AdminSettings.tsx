import React from "react";
import PageNav from "@/components/PageNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarouselImagesList } from "@/components/admin/CarouselImagesList";

const AdminSettings: React.FC = () => {
  return (
    <main className="container py-6">
      <PageNav current="Admin / Settings" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage application settings and configurations.
          </p>
        </div>

        <Tabs defaultValue="carousel" className="w-full">
          <TabsList>
            <TabsTrigger value="carousel">Carousel Images</TabsTrigger>
            <TabsTrigger value="fitness">Fitness Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="carousel" className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Carousel Images</h2>
              <p className="text-muted-foreground">
                Manage the carousel images displayed on the landing page.
              </p>
            </div>
            <CarouselImagesList />
          </TabsContent>
          
          <TabsContent value="fitness" className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Fitness Settings</h2>
              <p className="text-muted-foreground">
                Configure fitness-related settings and preferences.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Fitness settings will be added here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminSettings;