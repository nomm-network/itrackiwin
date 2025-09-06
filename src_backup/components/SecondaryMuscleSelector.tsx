import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }
interface Muscle { id: string; name: string; muscle_group_id: string }

interface SecondaryMuscleSelectorProps {
  bodyParts: BodyPart[];
  muscleGroups: MuscleGroup[];
  muscles: Muscle[];
  selectedMuscleIds: string[];
  onChange: (ids: string[]) => void;
}

const SecondaryMuscleSelector: React.FC<SecondaryMuscleSelectorProps> = ({
  bodyParts,
  muscleGroups,
  muscles,
  selectedMuscleIds,
  onChange,
}) => {
  const [bpId, setBpId] = React.useState<string>("");
  const [groupId, setGroupId] = React.useState<string>("");
  const [muscleId, setMuscleId] = React.useState<string>("");

  const groups = React.useMemo(() => {
    if (!bpId) return [] as MuscleGroup[];
    return muscleGroups.filter((g) => g.body_part_id === bpId);
  }, [muscleGroups, bpId]);

  const musclesFiltered = React.useMemo(() => {
    if (!groupId) return [] as Muscle[];
    return muscles.filter((m) => m.muscle_group_id === groupId);
  }, [muscles, groupId]);

  const muscleById = React.useMemo(() => {
    const map = new Map<string, Muscle>();
    muscles.forEach((m) => map.set(m.id, m));
    return map;
  }, [muscles]);

  const selectedList = React.useMemo(() => {
    return selectedMuscleIds
      .map((id) => muscleById.get(id))
      .filter(Boolean) as Muscle[];
  }, [selectedMuscleIds, muscleById]);

  const add = () => {
    if (!muscleId) return;
    if (!selectedMuscleIds.includes(muscleId)) {
      onChange([...selectedMuscleIds, muscleId]);
    }
    setMuscleId("");
  };

  const remove = (id: string) => {
    onChange(selectedMuscleIds.filter((x) => x !== id));
  };

  const reset = () => {
    setBpId("");
    setGroupId("");
    setMuscleId("");
  };

  return (
    <section className="space-y-3">
      <Label>Secondary Muscles</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Select
            value={bpId}
            onValueChange={(v) => {
              setBpId(v);
              setGroupId("");
              setMuscleId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select body part" />
            </SelectTrigger>
            <SelectContent>
              {bodyParts.map((bp) => (
                <SelectItem key={bp.id} value={bp.id}>
                  {bp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Select
            value={groupId}
            onValueChange={(v) => {
              setGroupId(v);
              setMuscleId("");
            }}
            disabled={!bpId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Select
            value={muscleId}
            onValueChange={setMuscleId}
            disabled={!groupId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select muscle" />
            </SelectTrigger>
            <SelectContent>
              {musclesFiltered.map((mu) => (
                <SelectItem key={mu.id} value={mu.id}>
                  {mu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={add} disabled={!muscleId}>
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Clear
        </Button>
      </div>
      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedList.map((mu) => (
            <Badge key={mu.id} variant="secondary" className="flex items-center gap-1">
              {mu.name}
              <button
                type="button"
                aria-label={`Remove ${mu.name}`}
                onClick={() => remove(mu.id)}
                className="inline-flex"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
};

export default SecondaryMuscleSelector;
