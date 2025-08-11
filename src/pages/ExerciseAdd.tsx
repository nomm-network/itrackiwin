import React from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavLink, Link } from "react-router-dom";

// Basic SEO
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Add Exercise | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create a new exercise in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises/add`);
    document.head.appendChild(link);
  }, []);
};

const ExerciseAdd: React.FC = () => {
  useSEO();
  React.useEffect(() => {
    console.info('[ExerciseAdd] mounted - rendering minimal page');
  }, []);

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

      <main className="container py-12">
        <h1 className="text-2xl font-semibold">Add Exercise</h1>
        <p className="mt-2 text-sm text-muted-foreground">Minimal placeholder page. We will add fields later.</p>
        <p className="mt-6">
          <Link to="/fitness/exercises" className="underline underline-offset-4">Back to Exercises</Link>
        </p>
      </main>
    </>
  );
};

export default ExerciseAdd;
