import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Dumbbell, 
  Settings,
  UserCheck,
  Database
} from "lucide-react";

const AdminHome: React.FC = () => {
  const adminSections = [
    {
      title: "Setup Flow",
      description: "Configure body taxonomy, equipment, grips, and system setup",
      path: "/admin/setup/body-taxonomy",
      icon: Database,
    },
    {
      title: "Exercise Management",
      description: "Manage exercises, equipment, and exercise configurations", 
      path: "/admin/exercises",
      icon: Dumbbell,
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      path: "/admin/users",
      icon: Users,
    },
    {
      title: "Mentors Management", 
      description: "Add and manage coaches and mentors",
      path: "/admin/mentors",
      icon: UserCheck,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.path} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={section.path}>
                    Open
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHome;
