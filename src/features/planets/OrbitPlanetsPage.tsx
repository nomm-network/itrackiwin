import { useNavigate } from "react-router-dom";
import OrbitNavigation from "@/components/OrbitNavigation";

export default function OrbitPlanetsPage() {
  const nav = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Life Planets Hub</h1>
        <p className="text-muted-foreground text-sm">
          Tap the orbiting planets to explore different life areas.
        </p>
      </div>
      
      <div className="w-full">
        <OrbitNavigation centerImageSrc="/lovable-uploads/e7a0d714-f7f9-435b-9d3d-5cbdc1381b54.png" />
      </div>
    </div>
  );
}