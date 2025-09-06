export type MentorDB = {
  id: string;
  user_id: string;
  role_key?: string | null;    // actual
  mentor_type?: string | null; // legacy expectation
  display_name: string | null;
  email: string | null;
  is_active: boolean;
  bio?: string | null;
  hourly_rate?: number | null;
  primary_category_id?: string | null;
  created_at: string;
};

export type MentorModel = {
  id?: string;
  userId: string;
  type: string;       // normalized
  displayName: string;
  email: string;
  isActive: boolean;
  bio?: string | null;
  hourlyRate?: number | null;
  primaryCategoryId?: string | null;
};

export function normalizeMentor(db: Partial<MentorDB>): MentorModel {
  const type = db.role_key ?? db.mentor_type ?? "mentor";
  return {
    id: db.id,
    userId: db.user_id!,
    type,
    displayName: db.display_name ?? "",
    email: db.email ?? "",
    isActive: db.is_active ?? true,
    bio: db.bio,
    hourlyRate: db.hourly_rate,
    primaryCategoryId: db.primary_category_id,
  };
}