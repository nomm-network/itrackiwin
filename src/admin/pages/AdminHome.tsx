import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Dumbbell, 
  Settings,
  UserCheck,
  BarChart3,
  Database
} from "lucide-react";

const AdminHome: React.FC = () => {
  const adminSections = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      path: "/admin/users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Mentors Management", 
      description: "Add and manage coaches and mentors",
      path: "/admin/mentors",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Exercise Management",
      description: "Manage exercises, equipment, and configurations", 
      path: "/admin/exercises",
      icon: Dumbbell,
      color: "text-purple-600"
    },
    {
      title: "Analytics",
      description: "View usage statistics and reports",
      path: "/admin/analytics", 
      icon: BarChart3,
      color: "text-orange-600"
    },
    {
      title: "Setup Flow",
      description: "Configure body taxonomy, equipment, and grips",
      path: "/admin/setup/body-taxonomy",
      icon: Database,
      color: "text-cyan-600"
    },
    {
      title: "Settings",
      description: "Configure system settings and translations",
      path: "/admin/settings",
      icon: Settings,
      color: "text-gray-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your fitness platform</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.path} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={section.path}>
                    Open {section.title}
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
