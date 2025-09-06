export type AreaId =
  | "health"
  | "mind"
  | "relationships"
  | "wealth"
  | "purpose"
  | "lifestyle";

export interface Area {
  id: AreaId;
  slug: AreaId;
  name: string;
  icon: string; // emoji for now
  color: string; // HSL string e.g. "152 76% 66%"
  subcategories?: string[]; // optional list of sub-categories
}

export interface Goal {
  id: string;
  user_id: string;
  area_id: AreaId;
  title: string;
  target_metric_type?: string;
  target_value?: number;
  deadline_date?: string; // ISO
  created_at: string; // ISO
}

export interface Habit {
  id: string;
  user_id: string;
  area_id: AreaId;
  title: string;
  cadence: { days?: number[] };
  reminder_time?: string; // HH:mm
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string; // ISO
  value?: number;
  note?: string;
}

export interface Metric {
  id: string;
  user_id: string;
  area_id: AreaId;
  name: string;
  unit?: string;
  direction: "increase" | "decrease";
}

export interface MetricEntry {
  id: string;
  metric_id: string;
  value: number;
  recorded_at: string; // ISO
}

export interface Reflection {
  id: string;
  user_id: string;
  area_id?: AreaId;
  text: string;
  mood?: string;
  created_at: string; // ISO
}
