export type WidgetSize = "sm" | "md" | "lg" | "xl";

export type Category = "health" | "mind" | "relationships" | "wealth" | "purpose" | "lifestyle";

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
  id: Category;
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