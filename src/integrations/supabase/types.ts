export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          description: string | null
          equipment_id: string | null
          id: string
          image_url: string | null
          is_public: boolean
          name: string
          owner_user_id: string | null
          popularity_rank: number | null
          primary_muscle_id: string | null
          secondary_muscle_ids: string[] | null
          slug: string | null
          source_url: string | null
          thumbnail_url: string | null
        }
        Insert: {
          body_part?: string | null
          body_part_id?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name: string
          owner_user_id?: string | null
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_ids?: string[] | null
          slug?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          body_part?: string | null
          body_part_id?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name?: string
          owner_user_id?: string | null
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_ids?: string[] | null
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
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_fk"
            columns: ["primary_muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          body_part_id: string
          created_at: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          body_part_id: string
          created_at?: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          body_part_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muscle_groups_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      muscles: {
        Row: {
          created_at: string
          id: string
          muscle_group_id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group_id: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group_id?: string
          name?: string
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_id: string
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
            foreignKeyName: "personal_records_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
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
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
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
      [_ in never]: never
    }
    Functions: {
      add_set: {
        Args: { p_workout_exercise_id: string; p_payload: Json }
        Returns: string
      }
      clone_template_to_workout: {
        Args: { p_template_id: string }
        Returns: string
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
        Args: { weight: number; reps: number }
        Returns: number
      }
      start_workout: {
        Args: { p_template_id?: string }
        Returns: string
      }
    }
    Enums: {
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
      set_type: ["normal", "warmup", "drop", "amrap", "timed", "distance"],
    },
  },
} as const
