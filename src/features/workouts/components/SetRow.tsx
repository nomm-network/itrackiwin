import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SetRowProps {
  setNumber: number;
  onLogSet: (weight: number, reps: number) => void;
  lastSet?: { weight: number; reps: number };
}

export default function SetRow({ setNumber, onLogSet, lastSet }: SetRowProps) {
  const [weight, setWeight] = useState(lastSet?.weight || 0);
  const [reps, setReps] = useState(lastSet?.reps || 0);

  const handleLogSet = () => {
    onLogSet(weight, reps);
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <span className="text-sm font-medium w-8">{setNumber}</span>
      <Input
        type="number"
        placeholder="Weight"
        value={weight || ''}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="w-20"
      />
      <span className="text-xs">kg</span>
      <Input
        type="number"
        placeholder="Reps"
        value={reps || ''}
        onChange={(e) => setReps(Number(e.target.value))}
        className="w-16"
      />
      <Button size="sm" onClick={handleLogSet}>
        ✓
      </Button>
    </div>
  );
}