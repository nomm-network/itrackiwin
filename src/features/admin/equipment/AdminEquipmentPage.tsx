import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatesDefaultsTab } from './tabs/PlatesDefaultsTab';
import { DumbbellsDefaultsTab } from './tabs/DumbbellsDefaultsTab';
import { BarsDefaultsTab } from './tabs/BarsDefaultsTab';
import { StacksDefaultsTab } from './tabs/StacksDefaultsTab';

export const AdminEquipmentPage = () => {
  const [activeTab, setActiveTab] = useState('plates');

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Global Equipment Defaults</h1>
        <p className="text-muted-foreground mt-2">
          Configure global defaults for plates, dumbbells, bars, and machine stacks. 
          Gyms can override these settings with their specific equipment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Configuration</CardTitle>
          <CardDescription>
            Manage the default equipment profiles that serve as fallbacks for all gyms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="plates">Plates</TabsTrigger>
              <TabsTrigger value="dumbbells">Dumbbells</TabsTrigger>
              <TabsTrigger value="bars">Bars</TabsTrigger>
              <TabsTrigger value="stacks">Machine Stacks</TabsTrigger>
            </TabsList>

            <TabsContent value="plates" className="mt-6">
              <PlatesDefaultsTab />
            </TabsContent>

            <TabsContent value="dumbbells" className="mt-6">
              <DumbbellsDefaultsTab />
            </TabsContent>

            <TabsContent value="bars" className="mt-6">
              <BarsDefaultsTab />
            </TabsContent>

            <TabsContent value="stacks" className="mt-6">
              <StacksDefaultsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};