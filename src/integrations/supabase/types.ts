export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      body_parts: {
        Row: {
          created_at: string
          id: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string | null
        }
        Relationships: []
      }
      body_parts_translations: {
        Row: {
          body_part_id: string
          created_at: string
          description: string | null
          id: string
          language_code: string
          name: string
          updated_at: string
        }
        Insert: {
          body_part_id: string
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          name: string
          updated_at?: string
        }
        Update: {
          body_part_id?: string
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_body_parts_translations_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_body_parts_translations_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      equipment_translations: {
        Row: {
          created_at: string
          description: string | null
          equipment_id: string
          id: string
          language_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment_id: string
          id?: string
          language_code: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment_id?: string
          id?: string
          language_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_translations_equipment_id"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_translations_equipment_id"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_images: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_primary: boolean
          order_index: number
          path: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_primary?: boolean
          order_index?: number
          path: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_primary?: boolean
          order_index?: number
          path?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          body_part: string | null
          body_part_id: string | null
          created_at: string
          default_grips: Json | null
          description: string | null
          equipment_id: string | null
          id: string
          image_url: string | null
          is_public: boolean
          name: string
          owner_user_id: string
          popularity_rank: number | null
          primary_muscle_id: string | null
          secondary_muscle_group_ids: string[] | null
          slug: string | null
          source_url: string | null
          thumbnail_url: string | null
        }
        Insert: {
          body_part?: string | null
          body_part_id?: string | null
          created_at?: string
          default_grips?: Json | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name: string
          owner_user_id: string
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_group_ids?: string[] | null
          slug?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          body_part?: string | null
          body_part_id?: string | null
          created_at?: string
          default_grips?: Json | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name?: string
          owner_user_id?: string
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_group_ids?: string[] | null
          slug?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_body_part_fk"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_body_part_fk"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_fk"
            columns: ["primary_muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_fk"
            columns: ["primary_muscle_id"]
            isOneToOne: false
            referencedRelation: "v_muscles_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_translations: {
        Row: {
          created_at: string
          description: string | null
          exercise_id: string
          id: string
          language_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exercise_id: string
          id?: string
          language_code: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exercise_id?: string
          id?: string
          language_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      grips: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_compatible_with: Json | null
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_compatible_with?: Json | null
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_compatible_with?: Json | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          flag_emoji: string | null
          is_active: boolean
          name: string
          native_name: string
        }
        Insert: {
          code: string
          created_at?: string
          flag_emoji?: string | null
          is_active?: boolean
          name: string
          native_name: string
        }
        Update: {
          code?: string
          created_at?: string
          flag_emoji?: string | null
          is_active?: boolean
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      life_categories: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          slug?: string
        }
        Relationships: []
      }
      life_category_translations: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          language_code: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_category_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      life_subcategories: {
        Row: {
          accent_color: string | null
          category_id: string
          created_at: string
          default_pinned: boolean | null
          display_order: number
          id: string
          route_name: string | null
          slug: string | null
        }
        Insert: {
          accent_color?: string | null
          category_id: string
          created_at?: string
          default_pinned?: boolean | null
          display_order?: number
          id?: string
          route_name?: string | null
          slug?: string | null
        }
        Update: {
          accent_color?: string | null
          category_id?: string
          created_at?: string
          default_pinned?: boolean | null
          display_order?: number
          id?: string
          route_name?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "life_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      life_subcategory_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          name: string
          subcategory_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          name: string
          subcategory_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          subcategory_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_subcategory_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "life_subcategory_translations_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "life_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_subcategory_translations_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_subcategories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_categories: {
        Row: {
          category_id: string
          created_at: string
          mentor_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          mentor_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          mentor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_categories_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          body_part_id: string
          created_at: string
          id: string
          slug: string | null
        }
        Insert: {
          body_part_id: string
          created_at?: string
          id?: string
          slug?: string | null
        }
        Update: {
          body_part_id?: string
          created_at?: string
          id?: string
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscle_groups_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscle_groups_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_groups_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_groups_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          muscle_group_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          muscle_group_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          muscle_group_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscle_groups_translations_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscle_groups_translations_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      muscles: {
        Row: {
          created_at: string
          id: string
          muscle_group_id: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group_id: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group_id?: string
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscles_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscles_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      muscles_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          muscle_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          muscle_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          muscle_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscles_translations_muscle_id"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscles_translations_muscle_id"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "v_muscles_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_id: string
          grip_combination: Json | null
          id: string
          kind: string
          unit: string | null
          user_id: string
          value: number
          workout_set_id: string | null
        }
        Insert: {
          achieved_at: string
          created_at?: string
          exercise_id: string
          grip_combination?: Json | null
          id?: string
          kind: string
          unit?: string | null
          user_id: string
          value: number
          workout_set_id?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          exercise_id?: string
          grip_combination?: Json | null
          id?: string
          kind?: string
          unit?: string | null
          user_id?: string
          value?: number
          workout_set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      template_exercise_preferences: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          preferred_grips: Json | null
          template_exercise_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_grips?: Json | null
          template_exercise_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_grips?: Json | null
          template_exercise_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_exercises: {
        Row: {
          default_sets: number
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          target_reps: number | null
          target_weight: number | null
          template_id: string
          weight_unit: string
        }
        Insert: {
          default_sets?: number
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          target_reps?: number | null
          target_weight?: number | null
          template_id: string
          weight_unit?: string
        }
        Update: {
          default_sets?: number
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          target_reps?: number | null
          target_weight?: number | null
          template_id?: string
          weight_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      text_translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          key: string
          language_code: string
          updated_at: string
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          key: string
          language_code: string
          updated_at?: string
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          key?: string
          language_code?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_category_prefs: {
        Row: {
          category_id: string
          created_at: string
          display_order: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          display_order?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          display_order?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_category_prefs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_category_prefs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pinned_subcategories: {
        Row: {
          id: string
          pinned_at: string
          subcategory_id: string
          user_id: string
        }
        Insert: {
          id?: string
          pinned_at?: string
          subcategory_id: string
          user_id: string
        }
        Update: {
          id?: string
          pinned_at?: string
          subcategory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pinned_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "life_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pinned_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_subcategories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          timezone: string
          unit_weight: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          timezone?: string
          unit_weight?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          timezone?: string
          unit_weight?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          exercise_id: string
          id: string
          is_superset_group: string | null
          notes: string | null
          order_index: number
          workout_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          is_superset_group?: string | null
          notes?: string | null
          order_index: number
          workout_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          is_superset_group?: string | null
          notes?: string | null
          order_index?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_set_grips: {
        Row: {
          created_at: string
          grip_id: string
          id: string
          workout_set_id: string
        }
        Insert: {
          created_at?: string
          grip_id: string
          id?: string
          workout_set_id: string
        }
        Update: {
          created_at?: string
          grip_id?: string
          id?: string
          workout_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_set_grips_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_set_grips_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed_at: string | null
          distance: number | null
          duration_seconds: number | null
          id: string
          is_completed: boolean
          notes: string | null
          reps: number | null
          rpe: number | null
          set_index: number
          set_kind: Database["public"]["Enums"]["set_type"]
          weight: number | null
          weight_unit: string
          workout_exercise_id: string
        }
        Insert: {
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_index: number
          set_kind?: Database["public"]["Enums"]["set_type"]
          weight?: number | null
          weight_unit?: string
          workout_exercise_id: string
        }
        Update: {
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_index?: number
          set_kind?: Database["public"]["Enums"]["set_type"]
          weight?: number | null
          weight_unit?: string
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          id: string
          name: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_templates_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          name: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          name: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          perceived_exertion: number | null
          started_at: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          started_at?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          started_at?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_body_parts_with_translations: {
        Row: {
          created_at: string | null
          id: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: []
      }
      v_categories_with_translations: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: []
      }
      v_equipment_with_translations: {
        Row: {
          created_at: string | null
          id: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: []
      }
      v_exercises_with_translations: {
        Row: {
          body_part: string | null
          body_part_id: string | null
          created_at: string | null
          description: string | null
          equipment_id: string | null
          id: string | null
          image_url: string | null
          is_public: boolean | null
          name: string | null
          owner_user_id: string | null
          popularity_rank: number | null
          primary_muscle_id: string | null
          secondary_muscle_group_ids: string[] | null
          slug: string | null
          source_url: string | null
          thumbnail_url: string | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_body_part_fk"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_body_part_fk"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_fk"
            columns: ["primary_muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_fk"
            columns: ["primary_muscle_id"]
            isOneToOne: false
            referencedRelation: "v_muscles_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_muscle_groups_with_translations: {
        Row: {
          body_part_id: string | null
          created_at: string | null
          id: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscle_groups_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscle_groups_body_part_id"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_groups_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_groups_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_muscles_with_translations: {
        Row: {
          created_at: string | null
          id: string | null
          muscle_group_id: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_muscles_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_muscles_muscle_group_id"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_subcategories_with_translations: {
        Row: {
          accent_color: string | null
          category_id: string | null
          created_at: string | null
          default_pinned: boolean | null
          display_order: number | null
          id: string | null
          route_name: string | null
          slug: string | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "life_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_pins_expanded: {
        Row: {
          accent_color: string | null
          name: string | null
          pinned_at: string | null
          route_name: string | null
          slug: string | null
          subcategory_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_pinned_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "life_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pinned_subcategories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "v_subcategories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_workout_templates_with_translations: {
        Row: {
          created_at: string | null
          id: string | null
          notes: string | null
          translations: Json | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_set: {
        Args: { p_payload: Json; p_workout_exercise_id: string }
        Returns: string
      }
      bootstrap_admin_if_empty: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      clone_template_to_workout: {
        Args:
          | { p_template_id: string }
          | { template_id: string; workout_id: string }
        Returns: undefined
      }
      create_demo_template_for_current_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      end_workout: {
        Args: { p_workout_id: string }
        Returns: string
      }
      epley_1rm: {
        Args: { reps: number; weight: number }
        Returns: number
      }
      get_category_name: {
        Args: { p_category_id: string; p_language_code?: string }
        Returns: string
      }
      get_life_categories_i18n: {
        Args: { lang_code: string }
        Returns: {
          description: string
          display_order: number
          id: string
          name: string
          slug: string
        }[]
      }
      get_life_subcategories_i18n: {
        Args: { category: string; lang_code: string }
        Returns: {
          category_id: string
          display_order: number
          id: string
          name: string
          slug: string
        }[]
      }
      get_subcategory_name: {
        Args: { p_language_code?: string; p_subcategory_id: string }
        Returns: string
      }
      get_text: {
        Args: { p_key: string; p_language_code?: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      start_workout: {
        Args: { p_template_id?: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "mentor" | "user"
      set_type: "normal" | "warmup" | "drop" | "amrap" | "timed" | "distance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "mentor", "user"],
      set_type: ["normal", "warmup", "drop", "amrap", "timed", "distance"],
    },
  },
} as const
