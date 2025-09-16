import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Trophy, 
  DollarSign, 
  Settings, 
  Dumbbell, 
  Globe, 
  UserCheck, 
  Tags,
  Wrench,
  BarChart3,
  Database,
  Shield
} from "lucide-react";

const AdminHome: React.FC = () => {
  const adminSections = [
    {
      title: "System Management",
      icon: Settings,
      description: "Core system configuration and setup",
      items: [
        { name: "Setup Flow", path: "/admin/setup", description: "Configure initial system setup" },
        { name: "Body Taxonomy", path: "/admin/body-taxonomy", description: "Manage muscle groups and body parts" },
        { name: "Equipment", path: "/admin/equipment", description: "Manage gym equipment catalog" },
        { name: "Grips", path: "/admin/grips", description: "Configure grip types and variations" }
      ]
    },
    {
      title: "Content Management",
      icon: Dumbbell,
      description: "Exercise and training content",
      items: [
        { name: "Exercise Management", path: "/admin/exercises", description: "Create and manage exercises" },
        { name: "Movement Patterns", path: "/admin/movement-patterns", description: "Define exercise movement patterns" },
        { name: "Tags & Aliases", path: "/admin/tags", description: "Organize content with tags" }
      ]
    },
    {
      title: "User & Community",
      icon: Users,
      description: "User management and community features",
      items: [
        { name: "User Management", path: "/admin/users", description: "Manage user accounts and permissions" },
        { name: "Ambassador Management", path: "/admin/ambassadors", description: "Manage ambassador profiles and deals" },
        { name: "Mentors Management", path: "/admin/mentors", description: "Oversee mentor programs" }
      ]
    },
    {
      title: "Business Operations",
      icon: DollarSign,
      description: "Revenue and business management",
      items: [
        { name: "Battles & Competitions", path: "/admin/battles", description: "Manage city battles and competitions" },
        { name: "Payouts & Commissions", path: "/admin/payouts", description: "Handle ambassador payments" },
        { name: "Revenue Analytics", path: "/admin/analytics", description: "Track business performance" }
      ]
    },
    {
      title: "System Tools",
      icon: Wrench,
      description: "Development and maintenance tools",
      items: [
        { name: "Translations", path: "/admin/translations", description: "Manage multi-language content" },
        { name: "Attribute Schemas", path: "/admin/schemas", description: "Configure data structures" },
        { name: "Naming Templates", path: "/admin/templates", description: "Standardize naming conventions" },
        { name: "Apple Secrets", path: "/admin/apple-secrets", description: "Generate Apple Sign In JWT tokens" }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Control Center
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Complete administrative control over all platform systems, users, and business operations.
        </p>
      </div>

      <div className="grid gap-8">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="group p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:bg-accent/5"
                  >
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Quick Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">--</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">--</div>
            <div className="text-sm text-muted-foreground">Active Ambassadors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">--</div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">--</div>
            <div className="text-sm text-muted-foreground">System Health</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
