import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }

interface SecondaryMuscleGroupSelectorProps {
  bodyParts: BodyPart[];
  muscleGroups: MuscleGroup[];
  selectedMuscleGroupIds: string[];
  excludedMuscleGroupId?: string; // The primary muscle's group to exclude
  onChange: (ids: string[]) => void;
}

const SecondaryMuscleGroupSelector: React.FC<SecondaryMuscleGroupSelectorProps> = ({
  bodyParts,
  muscleGroups,
  selectedMuscleGroupIds,
  excludedMuscleGroupId,
  onChange,
}) => {
  const [bpId, setBpId] = React.useState<string>("");
  const [groupId, setGroupId] = React.useState<string>("");

  const groups = React.useMemo(() => {
    if (!bpId) return [] as MuscleGroup[];
    return muscleGroups.filter((g) => g.body_part_id === bpId);
  }, [muscleGroups, bpId]);

  const groupById = React.useMemo(() => {
    const map = new Map<string, MuscleGroup>();
    muscleGroups.forEach((g) => map.set(g.id, g));
    return map;
  }, [muscleGroups]);

  const selectedList = React.useMemo(() => {
    return selectedMuscleGroupIds
      .map((id) => groupById.get(id))
      .filter(Boolean) as MuscleGroup[];
  }, [selectedMuscleGroupIds, groupById]);

  const add = () => {
    if (!groupId) return;
    if (!selectedMuscleGroupIds.includes(groupId)) {
      onChange([...selectedMuscleGroupIds, groupId]);
    }
    setGroupId("");
  };

  const remove = (id: string) => {
    onChange(selectedMuscleGroupIds.filter((x) => x !== id));
  };

  const reset = () => {
    setBpId("");
    setGroupId("");
  };

  // Filter out already selected groups and the excluded group
  const availableGroups = groups.filter(
    g => !selectedMuscleGroupIds.includes(g.id) && g.id !== excludedMuscleGroupId
  );

  return (
    <section className="space-y-3">
      <Label>Secondary Muscle Groups</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Select
            value={bpId}
            onValueChange={(v) => {
              setBpId(v);
              setGroupId("");
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
            onValueChange={setGroupId}
            disabled={!bpId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={add} disabled={!groupId}>
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={reset}>
          Clear
        </Button>
      </div>
      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedList.map((group) => (
            <Badge key={group.id} variant="secondary" className="flex items-center gap-1">
              {group.name}
              <button
                type="button"
                aria-label={`Remove ${group.name}`}
                onClick={() => remove(group.id)}
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

export default SecondaryMuscleGroupSelector;