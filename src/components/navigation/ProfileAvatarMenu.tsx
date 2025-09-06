import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, Building, Shield, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { supabase } from "@/integrations/supabase/client";

export function ProfileAvatarMenu() {
  const adminState = useIsSuperAdmin();
  const [isAmbassador, setIsAmbassador] = useState(false);
  const [invitesCount, setInvitesCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAmbassadorStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) return;

      // Check if user is an ambassador
      const { data: profile } = await supabase
        .from("ambassador_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        setIsAmbassador(true);
        
        // Get pending invites count
        const { data: invites } = await supabase
          .from("battle_invitations")
          .select("id")
          .eq("ambassador_id", profile.id)
          .eq("status", "pending");
        
        setInvitesCount(invites?.length || 0);
      }
    }

    checkAmbassadorStatus();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/gyms" className="cursor-pointer">
            <Building className="mr-2 h-4 w-4" />
            My Gyms
          </Link>
        </DropdownMenuItem>
        
        {isAmbassador && (
          <DropdownMenuItem asChild>
            <Link to="/ambassador" className="cursor-pointer">
              <Crown className="mr-2 h-4 w-4" />
              Ambassador {invitesCount > 0 && `(${invitesCount} invites)`}
            </Link>
          </DropdownMenuItem>
        )}
        
        {adminState.status === "authorized" && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}