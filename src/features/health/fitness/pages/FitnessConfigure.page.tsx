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
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
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
      // This would typically call the Google Places API via an edge function
      // For now, we'll simulate with a placeholder
      toast({ 
        title: 'Search functionality', 
        description: 'Google Places API integration would be implemented here' 
      });
      
      // Placeholder search results
      setSearchResults([]);
    } catch (error: any) {
      toast({ title: 'Search failed', description: error.message });
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
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Search Results</h4>
                {searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h5 className="font-medium">{place.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {place.formatted_address}
                      </p>
                    </div>
                    <Button size="sm">Add Gym</Button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>💡 Tip: You can search for specific gym chains, addresses, or just your city name</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}