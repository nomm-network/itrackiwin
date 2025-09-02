import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, MapPin, Star, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Mentor {
  user_id: string;
  mentor_type: 'mentor' | 'coach';
  bio?: string;
  avatar_url?: string;
  created_at: string;
  email?: string;
  categories?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  followed?: boolean;
}

const MentorsPage: React.FC = () => {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'mentor' | 'coach'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch mentors with categories
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select('user_id, mentor_type, bio, avatar_url, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((mentor: any) => ({
        ...mentor,
        email: 'anonymous@example.com',
        categories: [],
        followed: false
      }));
    }
  });

  // Fetch life categories for filtering
  const { data: lifeCategories } = useQuery({
    queryKey: ['life-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_categories')
        .select('id, slug, icon, display_order')
        .order('display_order');
      
      if (error) throw error;
      return data.map(cat => ({ ...cat, name: cat.slug }));
    }
  });

  // Follow mentor mutation (placeholder for future implementation)
  const followMentorMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      // TODO: Implement following system
      // For now, just show success message
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Following mentor (feature coming soon!)' });
    }
  });

  // Hire mentor mutation (placeholder for future implementation)
  const hireMentorMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      // TODO: Implement hiring system
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: 'Hire functionality coming soon!' });
    }
  });

  const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mentor.avatar_url} />
            <AvatarFallback className="text-lg">
              {mentor.email?.charAt(0).toUpperCase() || 'M'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{mentor.email?.split('@')[0] || 'Anonymous'}</h3>
                <Badge variant="default" className="capitalize mb-2">
                  {mentor.mentor_type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="text-sm">4.8</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {mentor.categories?.slice(0, 3).map(category => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.icon} {category.name}
                </Badge>
              ))}
              {mentor.categories && mentor.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.categories.length - 3} more
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {mentor.bio || 'No bio available. This mentor has not yet added a description of their services.'}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => followMentorMutation.mutate(mentor.user_id)}
                disabled={!user}
              >
                <Heart className="w-4 h-4 mr-1" />
                Follow
              </Button>
              <Button
                size="sm"
                onClick={() => hireMentorMutation.mutate(mentor.user_id)}
                disabled={!user}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Hire
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMentor(mentor)}>
                    View Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Mentor Profile</DialogTitle>
                  </DialogHeader>
                  {selectedMentor && <MentorProfile mentor={selectedMentor} />}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MentorProfile = ({ mentor }: { mentor: Mentor }) => (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={mentor.avatar_url} />
          <AvatarFallback className="text-xl">
            {mentor.email?.charAt(0).toUpperCase() || 'M'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{mentor.email?.split('@')[0] || 'Anonymous'}</h2>
          <Badge variant="default" className="capitalize mb-2">
            {mentor.mentor_type}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>4.8 (124 reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>89 clients</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Available globally</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {mentor.categories?.map(category => (
            <Badge key={category.id} variant="outline">
              {category.icon} {category.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">About</h3>
        <p className="text-muted-foreground leading-relaxed">
          {mentor.bio || 'This mentor has not yet added a detailed description of their background and services. Contact them directly to learn more about how they can help you achieve your goals.'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => followMentorMutation.mutate(mentor.user_id)}
          disabled={!user}
        >
          <Heart className="w-4 h-4 mr-2" />
          Follow
        </Button>
        <Button
          onClick={() => hireMentorMutation.mutate(mentor.user_id)}
          disabled={!user}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Hire Mentor
        </Button>
      </div>
    </div>
  );

  const filteredMentors = mentors?.filter(mentor => {
    const matchesSearch = mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || mentor.mentor_type === filterType;
    const matchesCategory = filterCategory === 'all' || 
                           mentor.categories?.some(cat => cat.id === filterCategory);
    
    return matchesSearch && matchesType && matchesCategory;
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sign in to Browse Mentors</h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to connect with experienced mentors and coaches
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Your Mentor</h1>
        <p className="text-muted-foreground">
          Connect with experienced mentors and coaches to accelerate your growth
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {lifeCategories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading mentors...</div>
      ) : filteredMentors && filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map(mentor => (
            <MentorCard key={mentor.user_id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MentorsPage;