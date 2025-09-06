import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown, Star, Dumbbell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const FavoritesDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('workout_templates')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('favorite', true)
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (favorites.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/app/templates')}
      >
        <Dumbbell className="h-4 w-4 mr-2" />
        Browse Templates
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-0">
          <Star className="h-4 w-4 mr-2" />
          Favorites
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-card border shadow-lg z-50"
      >
        {favorites.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => navigate(`/app/workouts/start?template=${template.id}`)}
            className="cursor-pointer hover:bg-muted"
          >
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            {template.name}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuItem
          onClick={() => navigate('/app/templates')}
          className="cursor-pointer hover:bg-muted border-t mt-1 pt-2"
        >
          <Dumbbell className="h-4 w-4 mr-2" />
          Explore More...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FavoritesDropdown;