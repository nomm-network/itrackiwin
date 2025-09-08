import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLifeCategoriesWithSubcategories } from "@/hooks/useLifeCategories";

const CLASSES = [
  { key: "ambassadors", label: "Ambassadors" },
  { key: "battles", label: "Battles" },
  { key: "ops", label: "Ops" },
  { key: "gyms", label: "Gyms" },
  { key: "users", label: "Users & Roles" },
  { key: "settings", label: "Settings" },
];

export function AdminTopBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categoriesWithSubs } = useLifeCategoriesWithSubcategories();
  
  const lifeCategory = searchParams.get("life_cat") ?? "health";
  const subcategory = searchParams.get("subcat") ?? "fitness";
  const adminClass = searchParams.get("class") ?? "ambassadors";

  const currentCategory = categoriesWithSubs?.find(cat => cat.slug === lifeCategory);
  const availableSubcategories = currentCategory?.subcategories ?? [];

  const handleLifeCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("life_cat", value);
    // Reset subcategory when life category changes
    const newCategory = categoriesWithSubs?.find(cat => cat.slug === value);
    if (newCategory?.subcategories?.[0]) {
      newParams.set("subcat", newCategory.subcategories[0].id);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSubcategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subcat", value);
    setSearchParams(newParams, { replace: true });
  };

  const handleClassChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("class", value);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="flex items-center gap-6 p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <Label htmlFor="life-category-select">Life Category:</Label>
        <Select value={lifeCategory} onValueChange={handleLifeCategoryChange}>
          <SelectTrigger id="life-category-select" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoriesWithSubs?.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="subcategory-select">Subcategory:</Label>
        <Select value={subcategory} onValueChange={handleSubcategoryChange}>
          <SelectTrigger id="subcategory-select" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableSubcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="class-select">Class:</Label>
        <Select value={adminClass} onValueChange={handleClassChange}>
          <SelectTrigger id="class-select" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CLASSES.map((cls) => (
              <SelectItem key={cls.key} value={cls.key}>
                {cls.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}