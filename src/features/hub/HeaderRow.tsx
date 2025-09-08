import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

import type { HubMeta } from "./useHubMeta";

export default function HeaderRow({ hub }: { hub?: HubMeta }) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useUserRole();

  return (
    <div className="space-y-1 sm:space-y-2">
      {/* Keep the exact markup/classes v64 uses for "Dashboard" + Admin + Explore by Planets */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">{hub?.name ? `${hub.name} Hub` : "Dashboard"}</h1>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button 
              variant="default" 
              onClick={() => navigate('/admin')}
              className="text-sm"
            >
              Admin
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate("/explore")}
            className="text-sm"
          >
            All Categories
          </Button>
        </div>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground">
        Track your progress across all areas of life.
      </p>
    </div>
  );
}
