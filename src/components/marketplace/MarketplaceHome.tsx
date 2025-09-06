import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GymsMarketplace } from './GymsMarketplace';
import { MentorsMarketplace } from './MentorsMarketplace';
import { MapPin, Users, Crown } from 'lucide-react';

export function MarketplaceHome() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Fitness Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover gyms and mentors in your area. Connect with the fitness community.
        </p>
      </div>

      <Tabs defaultValue="gyms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gyms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Gyms
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gyms" className="space-y-6">
          <GymsMarketplace />
        </TabsContent>

        <TabsContent value="mentors" className="space-y-6">
          <MentorsMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  );
}