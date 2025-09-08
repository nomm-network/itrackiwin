import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { key: "ambassadors", label: "Ambassadors" },
  { key: "battles", label: "Battles" },
  { key: "ops", label: "Ops" },
  { key: "gyms", label: "Gyms" },
  { key: "users", label: "Users & Roles" },
  { key: "settings", label: "Settings" },
];

export function AdminTopBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("cat") ?? "ambassadors";

  const handleCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("cat", value);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-card">
      <Label htmlFor="category-select">Category:</Label>
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger id="category-select" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.key} value={cat.key}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}