import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Calendar, Target, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  challenge_type: 'distance' | 'weight' | 'reps' | 'time' | 'workouts';
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  participants_count: number;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
  };
  challenge_participants?: {
    current_value: number;
    joined_at: string;
  }[];
}

export const ChallengesList: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challenge_type: 'workouts' as const,
    target_value: 0,
    target_unit: '',
    start_date: '',
    end_date: '',
    is_public: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchUserChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          profiles!challenges_creator_id_fkey(display_name, username)
        `)
        .eq('is_public', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges((data as any) || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          profiles!challenges_creator_id_fkey(display_name, username),
          challenge_participants!inner(current_value, joined_at)
        `)
        .eq('challenge_participants.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserChallenges((data as any) || []);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          current_value: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined challenge successfully!"
      });

      fetchChallenges();
      fetchUserChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
    }
  };

  const createChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenges')
        .insert({
          creator_id: user.id,
          ...newChallenge
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Challenge created successfully!"
      });

      setCreateDialogOpen(false);
      setNewChallenge({
        title: '',
        description: '',
        challenge_type: 'workouts',
        target_value: 0,
        target_unit: '',
        start_date: '',
        end_date: '',
        is_public: true
      });
      
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive"
      });
    }
  };

  const getChallengeStatus = (challenge: Challenge) => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);

    if (isBefore(now, start)) return 'upcoming';
    if (isAfter(now, end)) return 'ended';
    return 'active';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const renderChallengeCard = (challenge: Challenge, isUserChallenge = false) => {
    const status = getChallengeStatus(challenge);
    const progress = isUserChallenge && challenge.challenge_participants?.[0] 
      ? getProgressPercentage(challenge.challenge_participants[0].current_value, challenge.target_value)
      : 0;

    return (
      <Card key={challenge.id} className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                by {challenge.profiles?.display_name || challenge.profiles?.username}
              </p>
            </div>
            <Badge variant={
              status === 'active' ? 'default' : 
              status === 'upcoming' ? 'secondary' : 'outline'
            }>
              {status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm">{challenge.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{challenge.target_value} {challenge.target_unit || challenge.challenge_type}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{challenge.participants_count}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}</span>
            </div>
          </div>

          {isUserChallenge && challenge.challenge_participants?.[0] && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Progress</span>
                <span>{challenge.challenge_participants[0].current_value} / {challenge.target_value}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {!isUserChallenge && status !== 'ended' && (
            <Button onClick={() => joinChallenge(challenge.id)} className="w-full">
              Join Challenge
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Challenges</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Challenge title"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
              />
              <Select
                value={newChallenge.challenge_type}
                onValueChange={(value: any) => setNewChallenge(prev => ({ ...prev, challenge_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workouts">Workouts</SelectItem>
                  <SelectItem value="weight">Weight Lifted</SelectItem>
                  <SelectItem value="reps">Total Reps</SelectItem>
                  <SelectItem value="time">Time (minutes)</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Target value"
                value={newChallenge.target_value || ''}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, target_value: Number(e.target.value) }))}
              />
              <Input
                placeholder="Unit (optional)"
                value={newChallenge.target_unit}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, target_unit: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={newChallenge.start_date}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, start_date: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newChallenge.end_date}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <Button onClick={createChallenge} className="w-full">
                Create Challenge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Challenges</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges ({userChallenges.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          {challenges.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No active challenges available</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            challenges.map(challenge => renderChallengeCard(challenge))
          )}
        </TabsContent>
        
        <TabsContent value="my-challenges" className="space-y-4">
          {userChallenges.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't joined any challenges yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            userChallenges.map(challenge => renderChallengeCard(challenge, true))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};