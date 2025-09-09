import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewSocialFeed } from '@/components/social/NewSocialFeed';
import { PostComposer } from '@/components/social/PostComposer';
import { NewFriendsList } from '@/components/social/NewFriendsList';
import { ChallengesList } from '@/components/social/ChallengesList';
import { Users, Trophy, Share } from 'lucide-react';

const Social: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Social</h1>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" className="flex items-center space-x-2">
            <Share className="h-4 w-4" />
            <span>Feed</span>
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Friends</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Challenges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <PostComposer />
            <NewSocialFeed />
          </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Friends</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Workouts Shared</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Challenges Joined</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <NewFriendsList />
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <ChallengesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Social;