import React, { useState, useEffect } from 'react';
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit3, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NavLink } from "react-router-dom";

interface UserGym {
  id: string;
  name: string;
  is_default: boolean;
}

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  location?: {
    lat: number;
    lng: number;
  };
  photos?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
  website?: string;
  phone?: string;
}

export default function FitnessConfigure() {
  const [userGyms, setUserGyms] = useState<UserGym[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserGyms = async () => {
    try {
      const { data, error } = await supabase
        .from('user_gyms')
        .select(`
          id,
          name,
          is_default
        `)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setUserGyms(data || []);
    } catch (error: any) {
      toast({ title: 'Failed to load gyms', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserGyms();
  }, []);

  const searchNearbyGyms = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-gyms', {
        body: { 
          query: searchQuery.trim()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.results) {
        setSearchResults(data.results);
        toast({ 
          title: `Found ${data.results.length} gyms`, 
          description: `Showing results for "${searchQuery}"` 
        });
      } else {
        setSearchResults([]);
        toast({ 
          title: 'No gyms found', 
          description: 'Try a different search term or location' 
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({ 
        title: 'Search failed', 
        description: error.message || 'Unable to search for gyms' 
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchNearbyGymsByLocation = async () => {
    if (!navigator.geolocation) {
      toast({ 
        title: 'Location not supported', 
        description: 'Your browser does not support geolocation' 
      });
      return;
    }

    setIsSearching(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.functions.invoke('search-gyms', {
        body: { 
          lat: latitude,
          lng: longitude,
          radius: 5000 // 5km radius
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.results) {
        setSearchResults(data.results);
        toast({ 
          title: `Found ${data.results.length} nearby gyms`, 
          description: 'Gyms within 5km of your location' 
        });
      } else {
        setSearchResults([]);
        toast({ 
          title: 'No nearby gyms found', 
          description: 'Try expanding your search area' 
        });
      }
    } catch (error: any) {
      if (error.code === error.PERMISSION_DENIED) {
        toast({ 
          title: 'Location access denied', 
          description: 'Please allow location access to find nearby gyms' 
        });
      } else {
        console.error('Location search error:', error);
        toast({ 
          title: 'Search failed', 
          description: error.message || 'Unable to get your location' 
        });
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const setDefaultGym = async (gymId: string) => {
    try {
      // First, unset all default gyms for this user
      const { error: unsetError } = await supabase
        .from('user_gyms')
        .update({ is_default: false })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (unsetError) throw unsetError;

      // Then set the selected gym as default
      const { error } = await supabase
        .from('user_gyms')
        .update({ is_default: true })
        .eq('id', gymId);

      if (error) throw error;

      await loadUserGyms();
      toast({ title: 'Default gym updated' });
    } catch (error: any) {
      toast({ title: 'Failed to update default gym', description: error.message });
    }
  };

  const removeGym = async (gymId: string) => {
    if (!confirm('Are you sure you want to remove this gym?')) return;

    try {
      const { error } = await supabase
        .from('user_gyms')
        .delete()
        .eq('id', gymId);

      if (error) throw error;

      await loadUserGyms();
      toast({ title: 'Gym removed' });
    } catch (error: any) {
      toast({ title: 'Failed to remove gym', description: error.message });
    }
  };

  const addGymFromPlace = async (place: PlaceResult) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({ title: 'Authentication required', description: 'Please log in to add gyms' });
        return;
      }

      // Check if user already has this gym
      const { data: existingGyms, error: checkError } = await supabase
        .from('user_gyms')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', place.name);

      if (checkError) throw checkError;

      if (existingGyms && existingGyms.length > 0) {
        toast({ 
          title: 'Gym already added', 
          description: `${place.name} is already in your gym list` 
        });
        return;
      }

      // Add the gym to user's list
      const { error } = await supabase
        .from('user_gyms')
        .insert([{
          user_id: user.id,
          name: place.name,
          is_default: userGyms.length === 0 // Set as default if it's the first gym
        }]);

      if (error) throw error;

      await loadUserGyms();
      toast({ 
        title: 'Gym added successfully', 
        description: `${place.name} has been added to your gym list${userGyms.length === 0 ? ' and set as default' : ''}` 
      });

      // Clear search results after successful add
      setSearchResults([]);
      setSearchQuery("");
    } catch (error: any) {
      console.error('Error adding gym:', error);
      toast({ 
        title: 'Failed to add gym', 
        description: error.message || 'Unable to add gym to your list' 
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <PageNav current="Fitness" />
        <div className="container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageNav current="Fitness" />
      <nav className="container pt-4" aria-label="Fitness navigation">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink to="/fitness" end className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Workouts
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/exercises" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Exercises
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/templates" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Templates
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Configure
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Fitness Configuration</h1>
          <p className="text-muted-foreground">Manage your gym settings and preferences</p>
        </div>

        {/* Current Gyms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Gyms
            </CardTitle>
            <CardDescription>
              Manage your gym locations and set your default gym
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userGyms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No gyms configured yet</p>
                <p className="text-sm">Add a gym to get started with your workouts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userGyms.map((userGym) => (
                  <div
                    key={userGym.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      userGym.is_default ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {userGym.name}
                        </h3>
                        {userGym.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!userGym.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultGym(userGym.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit functionality would go here
                          toast({ title: 'Edit gym functionality coming soon' });
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeGym(userGym.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Find New Gym */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Nearby Gyms
            </CardTitle>
            <CardDescription>
              Search for gyms near your location using Google Places
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="gym-search">Search location</Label>
                <Input
                  id="gym-search"
                  placeholder="Enter city, address, or gym name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchNearbyGyms()}
                />
              </div>
              <div className="flex items-end">
                  <Button 
                    onClick={searchNearbyGyms}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={searchNearbyGymsByLocation}
                    disabled={isSearching}
                    className="whitespace-nowrap"
                  >
                    📍 Near Me
                  </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Search Results ({searchResults.length} gyms found)</h4>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {searchResults.map((place) => (
                    <div
                      key={place.place_id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {place.photos?.[0] && (
                            <img 
                              src={place.photos[0].url}
                              alt={place.name}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{place.name}</h5>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {place.address}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {place.rating && (
                                <span className="flex items-center gap-1">
                                  ⭐ {place.rating}
                                  {place.user_ratings_total && (
                                    <span>({place.user_ratings_total})</span>
                                  )}
                                </span>
                              )}
                              {place.opening_hours?.open_now !== undefined && (
                                <span className={place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                                  {place.opening_hours.open_now ? 'Open' : 'Closed'}
                                </span>
                              )}
                            </div>
                            {(place.website || place.phone) && (
                              <div className="flex gap-3 mt-2">
                                {place.website && (
                                  <a 
                                    href={place.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Website
                                  </a>
                                )}
                                {place.phone && (
                                  <a 
                                    href={`tel:${place.phone}`}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    {place.phone}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => addGymFromPlace(place)}
                        className="ml-3 flex-shrink-0"
                      >
                        Add Gym
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Search Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Search for specific gym chains like "Planet Fitness", "LA Fitness"</li>
                <li>Enter your city name like "gyms in New York"</li>
                <li>Use the "📍 Near Me" button to find gyms close to your location</li>
                <li>Try broader terms like "fitness center" or "health club"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}