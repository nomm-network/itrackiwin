import { Bell } from "lucide-react";
import { MainTopNav } from "./MainTopNav";
import { ProfileAvatarMenu } from "./ProfileAvatarMenu";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">iTrack.iWin.</h1>
          <MainTopNav />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          <ProfileAvatarMenu />
        </div>
      </div>
    </header>
  );
}