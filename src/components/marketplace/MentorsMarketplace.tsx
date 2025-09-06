import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ExternalLink, MapPin } from 'lucide-react';
import { useMarketplaceMentors } from '@/hooks/useMarketplace';
import { Link } from 'react-router-dom';

const mentorCategories = [
  'strength',
  'cardio',
  'yoga',
  'pilates',
  'crossfit',
  'bodybuilding',
  'powerlifting',
  'nutrition',
  'weight-loss',
  'rehabilitation'
];

export function MentorsMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchCity, setSearchCity] = useState('');

  const { data: mentors, isLoading } = useMarketplaceMentors(selectedCategory, searchCity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </Button>
          {mentorCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !mentors || mentors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or category filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.mentor_profile_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="truncate">{mentor.headline || 'Fitness Mentor'}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/m/${mentor.slug || mentor.mentor_profile_id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardTitle>
                {mentor.bio && (
                  <CardDescription className="line-clamp-2">
                    {mentor.bio}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {mentor.categories && mentor.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mentor.categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                    {mentor.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.categories.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link to={`/m/${mentor.slug || mentor.mentor_profile_id}`}>
                    View Mentor Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mentors && mentors.length === 20 && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Showing 20 results. Refine your search to see more specific results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}