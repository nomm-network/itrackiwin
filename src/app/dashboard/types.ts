export type WidgetSize = "sm" | "md" | "lg" | "xl";

export type Category = string; // Database UUIDs for categories

export interface DashboardWidget {
  id: string;
  title: string;
  size: WidgetSize;
  category: Category;
  subcategory?: string;
  Component: React.LazyExoticComponent<React.FC>;
  loadingFallback?: React.ReactNode;
  requiredScopes?: string[];
  order?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category: Category;
  subcategory?: string;
  onClickPath?: string;
  onClick?: () => void;
  order?: number;
}

export interface CategoryConfig {
  id: string; // Database UUID
  name: string;
  icon: string;
  color: string;
  subcategories?: SubcategoryConfig[];
}

export interface SubcategoryConfig {
  id: string;
  name: string;
  icon?: string;
}