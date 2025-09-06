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
      achievements: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean
          points: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id?: string
          is_active?: boolean
          points?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          points?: number
          title?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          performed_by: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          performed_by?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          performed_by?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_check_rate_limit: {
        Row: {
          check_count: number | null
          created_at: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          check_count?: number | null
          created_at?: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          check_count?: number | null
          created_at?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      attribute_schemas: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          schema_json: Json
          scope: Database["public"]["Enums"]["attr_scope"]
          scope_ref_id: string | null
          title: string
          updated_at: string
          version: number
          visibility: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          schema_json: Json
          scope: Database["public"]["Enums"]["attr_scope"]
          scope_ref_id?: string | null
          title: string
          updated_at?: string
          version?: number
          visibility?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          schema_json?: Json
          scope?: Database["public"]["Enums"]["attr_scope"]
          scope_ref_id?: string | null
          title?: string
          updated_at?: string
          version?: number
          visibility?: string | null
        }
        Relationships: []
      }
      auto_deload_triggers: {
        Row: {
          created_at: string
          deload_percentage: number | null
          exercise_id: string
          id: string
          is_triggered: boolean | null
          threshold_value: number | null
          trigger_type: string
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deload_percentage?: number | null
          exercise_id: string
          id?: string
          is_triggered?: boolean | null
          threshold_value?: number | null
          trigger_type: string
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deload_percentage?: number | null
          exercise_id?: string
          id?: string
          is_triggered?: boolean | null
          threshold_value?: number | null
          trigger_type?: string
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_deload_triggers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_deload_triggers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_deload_triggers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_types: {
        Row: {
          default_weight: number
          id: string
          name: string
          unit: Database["public"]["Enums"]["weight_unit"]
        }
        Insert: {
          default_weight: number
          id?: string
          name: string
          unit?: Database["public"]["Enums"]["weight_unit"]
        }
        Update: {
          default_weight?: number
          id?: string
          name?: string
          unit?: Database["public"]["Enums"]["weight_unit"]
        }
        Relationships: []
      }
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
      carousel_images: {
        Row: {
          alt_text: string
          created_at: string
          created_by: string | null
          file_path: string
          file_url: string
          id: string
          is_active: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          created_by?: string | null
          file_path: string
          file_url: string
          id?: string
          is_active?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          file_url?: string
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          current_value: number | null
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          current_value?: number | null
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          current_value?: number | null
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          creator_id: string
          description: string | null
          end_date: string
          id: string
          is_public: boolean | null
          participants_count: number | null
          start_date: string
          target_unit: string | null
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          creator_id: string
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean | null
          participants_count?: number | null
          start_date: string
          target_unit?: string | null
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          participants_count?: number | null
          start_date?: string
          target_unit?: string | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      coach_assigned_templates: {
        Row: {
          assigned_at: string
          id: string
          is_linked: boolean
          mentorship_id: string
          template_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          is_linked?: boolean
          mentorship_id: string
          template_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          is_linked?: boolean
          mentorship_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_assigned_templates_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_assigned_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_assigned_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_logs: {
        Row: {
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          function_name: string
          id: string
          inputs: Json
          metadata: Json | null
          outputs: Json
          session_id: string | null
          step: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          function_name: string
          id?: string
          inputs?: Json
          metadata?: Json | null
          outputs?: Json
          session_id?: string | null
          step: string
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          function_name?: string
          id?: string
          inputs?: Json
          metadata?: Json | null
          outputs?: Json
          session_id?: string | null
          step?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      cycle_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      data_quality_reports: {
        Row: {
          created_at: string
          equipment_constraints_coverage_pct: number
          exercises_with_equipment_constraints: number
          exercises_with_movement_pattern: number
          exercises_with_primary_muscle: number
          id: string
          issues_found: Json
          movement_pattern_coverage_pct: number
          primary_muscle_coverage_pct: number
          report_type: string
          total_exercises: number
        }
        Insert: {
          created_at?: string
          equipment_constraints_coverage_pct?: number
          exercises_with_equipment_constraints?: number
          exercises_with_movement_pattern?: number
          exercises_with_primary_muscle?: number
          id?: string
          issues_found?: Json
          movement_pattern_coverage_pct?: number
          primary_muscle_coverage_pct?: number
          report_type?: string
          total_exercises?: number
        }
        Update: {
          created_at?: string
          equipment_constraints_coverage_pct?: number
          exercises_with_equipment_constraints?: number
          exercises_with_movement_pattern?: number
          exercises_with_primary_muscle?: number
          id?: string
          issues_found?: Json
          movement_pattern_coverage_pct?: number
          primary_muscle_coverage_pct?: number
          report_type?: string
          total_exercises?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          configured: boolean
          created_at: string
          default_bar_weight_kg: number | null
          default_side_min_plate_kg: number | null
          default_single_min_increment_kg: number | null
          default_stack: Json | null
          equipment_type: string
          id: string
          kind: string | null
          load_medium: Database["public"]["Enums"]["load_medium"] | null
          load_type: Database["public"]["Enums"]["load_type"] | null
          notes: string | null
          slug: string | null
          weight_kg: number | null
        }
        Insert: {
          configured?: boolean
          created_at?: string
          default_bar_weight_kg?: number | null
          default_side_min_plate_kg?: number | null
          default_single_min_increment_kg?: number | null
          default_stack?: Json | null
          equipment_type?: string
          id?: string
          kind?: string | null
          load_medium?: Database["public"]["Enums"]["load_medium"] | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
          notes?: string | null
          slug?: string | null
          weight_kg?: number | null
        }
        Update: {
          configured?: boolean
          created_at?: string
          default_bar_weight_kg?: number | null
          default_side_min_plate_kg?: number | null
          default_single_min_increment_kg?: number | null
          default_stack?: Json | null
          equipment_type?: string
          id?: string
          kind?: string | null
          load_medium?: Database["public"]["Enums"]["load_medium"] | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
          notes?: string | null
          slug?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      equipment_grip_defaults: {
        Row: {
          created_at: string | null
          equipment_id: string
          grip_id: string
          handle_id: string | null
          id: string
          is_default: boolean
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          grip_id: string
          handle_id?: string | null
          id?: string
          is_default?: boolean
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          grip_id?: string
          handle_id?: string | null
          id?: string
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "equipment_grip_defaults_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_grip_defaults_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "equipment_grip_defaults_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_grip_defaults_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_handle_orientations: {
        Row: {
          created_at: string | null
          equipment_id: string
          handle_id: string
          id: string
          is_default: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          handle_id: string
          id?: string
          is_default?: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          handle_id?: string
          id?: string
          is_default?: boolean
          orientation?: Database["public"]["Enums"]["grip_orientation"]
        }
        Relationships: [
          {
            foreignKeyName: "equipment_handle_orientations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_handle_orientations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "equipment_handle_orientations_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
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
      equipments: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercise_aliases: {
        Row: {
          alias: string
          created_at: string
          exercise_id: string
          id: string
          language_code: string | null
        }
        Insert: {
          alias: string
          created_at?: string
          exercise_id: string
          id?: string
          language_code?: string | null
        }
        Update: {
          alias?: string
          created_at?: string
          exercise_id?: string
          id?: string
          language_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_aliases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_aliases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_aliases_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_default_grips: {
        Row: {
          exercise_id: string
          grip_id: string
          order_index: number
        }
        Insert: {
          exercise_id: string
          grip_id: string
          order_index?: number
        }
        Update: {
          exercise_id?: string
          grip_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_default_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_default_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_default_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_default_grips_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_equipment_variants: {
        Row: {
          equipment_id: string
          exercise_id: string
          is_preferred: boolean
        }
        Insert: {
          equipment_id: string
          exercise_id: string
          is_preferred?: boolean
        }
        Update: {
          equipment_id?: string
          exercise_id?: string
          is_preferred?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "exercise_equipment_variants_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equipment_variants_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "exercise_equipment_variants_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equipment_variants_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equipment_variants_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equipment_variants_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_grip_effects: {
        Row: {
          created_at: string
          effect_pct: number
          equipment_id: string | null
          exercise_id: string
          grip_id: string
          id: string
          is_primary_override: boolean
          muscle_id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          effect_pct: number
          equipment_id?: string | null
          exercise_id: string
          grip_id: string
          id?: string
          is_primary_override?: boolean
          muscle_id: string
          note?: string | null
        }
        Update: {
          created_at?: string
          effect_pct?: number
          equipment_id?: string | null
          exercise_id?: string
          grip_id?: string
          id?: string
          is_primary_override?: boolean
          muscle_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_grip_effects_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grip_effects_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "v_muscles_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_grips: {
        Row: {
          created_at: string
          exercise_id: string
          grip_id: string
          is_default: boolean
          order_index: number
        }
        Insert: {
          created_at?: string
          exercise_id: string
          grip_id: string
          is_default?: boolean
          order_index?: number
        }
        Update: {
          created_at?: string
          exercise_id?: string
          grip_id?: string
          is_default?: boolean
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grips_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_grips_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_handle_orientations: {
        Row: {
          created_at: string | null
          exercise_id: string
          handle_id: string
          id: string
          is_default: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          handle_id: string
          id?: string
          is_default?: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          handle_id?: string
          id?: string
          is_default?: boolean
          orientation?: Database["public"]["Enums"]["grip_orientation"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_handle_orientations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_handle_orientations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_handle_orientations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
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
      exercise_metric_defs: {
        Row: {
          default_value: Json | null
          equipment_id: string | null
          exercise_id: string | null
          id: string
          is_required: boolean
          metric_id: string
          order_index: number
        }
        Insert: {
          default_value?: Json | null
          equipment_id?: string | null
          exercise_id?: string | null
          id?: string
          is_required?: boolean
          metric_id: string
          order_index?: number
        }
        Update: {
          default_value?: Json | null
          equipment_id?: string | null
          exercise_id?: string | null
          id?: string
          is_required?: boolean
          metric_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_metric_defs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_metric_defs_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metric_defs"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_similars: {
        Row: {
          created_at: string
          exercise_id: string
          reason: string | null
          similar_exercise_id: string
          similarity_score: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          reason?: string | null
          similar_exercise_id: string
          similarity_score?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          reason?: string | null
          similar_exercise_id?: string
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_similars_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_similars_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_similars_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_similars_similar_exercise_id_fkey"
            columns: ["similar_exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_similars_similar_exercise_id_fkey"
            columns: ["similar_exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_similars_similar_exercise_id_fkey"
            columns: ["similar_exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          allows_grips: boolean | null
          attribute_values_json: Json
          body_part_id: string | null
          capability_schema: Json | null
          complexity_score: number | null
          configured: boolean
          contraindications: Json | null
          created_at: string
          custom_display_name: string | null
          default_bar_type_id: string | null
          default_bar_weight: number | null
          default_grip_ids: string[] | null
          display_name: string | null
          display_name_tsv: unknown | null
          equipment_id: string
          equipment_ref_id: string | null
          exercise_skill_level:
            | Database["public"]["Enums"]["exercise_skill_level"]
            | null
          id: string
          image_url: string | null
          is_bar_loaded: boolean
          is_public: boolean
          is_unilateral: boolean | null
          load_type: Database["public"]["Enums"]["load_type_enum"] | null
          loading_hint: string | null
          movement_id: string | null
          movement_pattern_id: string | null
          name_locale: string | null
          name_version: number | null
          owner_user_id: string | null
          popularity_rank: number | null
          primary_muscle_id: string | null
          secondary_muscle_group_ids: string[] | null
          slug: string
          source_url: string | null
          tags: string[] | null
          thumbnail_url: string | null
        }
        Insert: {
          allows_grips?: boolean | null
          attribute_values_json?: Json
          body_part_id?: string | null
          capability_schema?: Json | null
          complexity_score?: number | null
          configured?: boolean
          contraindications?: Json | null
          created_at?: string
          custom_display_name?: string | null
          default_bar_type_id?: string | null
          default_bar_weight?: number | null
          default_grip_ids?: string[] | null
          display_name?: string | null
          display_name_tsv?: unknown | null
          equipment_id: string
          equipment_ref_id?: string | null
          exercise_skill_level?:
            | Database["public"]["Enums"]["exercise_skill_level"]
            | null
          id?: string
          image_url?: string | null
          is_bar_loaded?: boolean
          is_public?: boolean
          is_unilateral?: boolean | null
          load_type?: Database["public"]["Enums"]["load_type_enum"] | null
          loading_hint?: string | null
          movement_id?: string | null
          movement_pattern_id?: string | null
          name_locale?: string | null
          name_version?: number | null
          owner_user_id?: string | null
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_group_ids?: string[] | null
          slug: string
          source_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
        }
        Update: {
          allows_grips?: boolean | null
          attribute_values_json?: Json
          body_part_id?: string | null
          capability_schema?: Json | null
          complexity_score?: number | null
          configured?: boolean
          contraindications?: Json | null
          created_at?: string
          custom_display_name?: string | null
          default_bar_type_id?: string | null
          default_bar_weight?: number | null
          default_grip_ids?: string[] | null
          display_name?: string | null
          display_name_tsv?: unknown | null
          equipment_id?: string
          equipment_ref_id?: string | null
          exercise_skill_level?:
            | Database["public"]["Enums"]["exercise_skill_level"]
            | null
          id?: string
          image_url?: string | null
          is_bar_loaded?: boolean
          is_public?: boolean
          is_unilateral?: boolean | null
          load_type?: Database["public"]["Enums"]["load_type_enum"] | null
          loading_hint?: string | null
          movement_id?: string | null
          movement_pattern_id?: string | null
          name_locale?: string | null
          name_version?: number | null
          owner_user_id?: string | null
          popularity_rank?: number | null
          primary_muscle_id?: string | null
          secondary_muscle_group_ids?: string[] | null
          slug?: string
          source_url?: string | null
          tags?: string[] | null
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
            foreignKeyName: "exercises_default_bar_type_id_fkey"
            columns: ["default_bar_type_id"]
            isOneToOne: false
            referencedRelation: "bar_types"
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
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_ref_id_fkey"
            columns: ["equipment_ref_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
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
          {
            foreignKeyName: "fk_exercises_pattern"
            columns: ["movement_pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
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
      experience_level_configs: {
        Row: {
          allow_high_complexity: boolean
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          main_rest_seconds_max: number
          main_rest_seconds_min: number
          start_intensity_high: number
          start_intensity_low: number
          updated_at: string
          warmup_set_count_max: number
          warmup_set_count_min: number
          weekly_progress_pct: number
        }
        Insert: {
          allow_high_complexity?: boolean
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          main_rest_seconds_max: number
          main_rest_seconds_min: number
          start_intensity_high: number
          start_intensity_low: number
          updated_at?: string
          warmup_set_count_max: number
          warmup_set_count_min: number
          weekly_progress_pct: number
        }
        Update: {
          allow_high_complexity?: boolean
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          main_rest_seconds_max?: number
          main_rest_seconds_min?: number
          start_intensity_high?: number
          start_intensity_low?: number
          updated_at?: string
          warmup_set_count_max?: number
          warmup_set_count_min?: number
          weekly_progress_pct?: number
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      grips: {
        Row: {
          category: string
          created_at: string
          id: string
          is_compatible_with: Json | null
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_compatible_with?: Json | null
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_compatible_with?: Json | null
          slug?: string
        }
        Relationships: []
      }
      grips_translations: {
        Row: {
          created_at: string
          description: string | null
          grip_id: string
          id: string
          language_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grip_id: string
          id?: string
          language_code: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grip_id?: string
          id?: string
          language_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gym_admins: {
        Row: {
          created_at: string
          gym_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gym_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          gym_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_admins_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_aliases: {
        Row: {
          alias: string
          gym_id: string
          id: string
        }
        Insert: {
          alias: string
          gym_id: string
          id?: string
        }
        Update: {
          alias?: string
          gym_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_aliases_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_equipment: {
        Row: {
          bar_weight_kg: number | null
          created_at: string
          equipment_id: string
          fixed_increment_kg: number | null
          gym_id: string
          has_micro_plates: boolean
          id: string
          is_symmetrical: boolean
          loading_mode: string
          micro_plate_min_kg: number | null
          min_plate_kg: number | null
          notes: string | null
          stack_has_magnet: boolean
          stack_increment_kg: number | null
          stack_micro_kg: number | null
          updated_at: string
        }
        Insert: {
          bar_weight_kg?: number | null
          created_at?: string
          equipment_id: string
          fixed_increment_kg?: number | null
          gym_id: string
          has_micro_plates?: boolean
          id?: string
          is_symmetrical?: boolean
          loading_mode: string
          micro_plate_min_kg?: number | null
          min_plate_kg?: number | null
          notes?: string | null
          stack_has_magnet?: boolean
          stack_increment_kg?: number | null
          stack_micro_kg?: number | null
          updated_at?: string
        }
        Update: {
          bar_weight_kg?: number | null
          created_at?: string
          equipment_id?: string
          fixed_increment_kg?: number | null
          gym_id?: string
          has_micro_plates?: boolean
          id?: string
          is_symmetrical?: boolean
          loading_mode?: string
          micro_plate_min_kg?: number | null
          min_plate_kg?: number | null
          notes?: string | null
          stack_has_magnet?: boolean
          stack_increment_kg?: number | null
          stack_micro_kg?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "gym_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_equipment_availability: {
        Row: {
          brand: string | null
          created_at: string
          equipment_id: string
          gym_id: string
          id: string
          is_functional: boolean
          model: string | null
          notes: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          equipment_id: string
          gym_id: string
          id?: string
          is_functional?: boolean
          model?: string | null
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          equipment_id?: string
          gym_id?: string
          id?: string
          is_functional?: boolean
          model?: string | null
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_equipment_availability_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_availability_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "gym_equipment_availability_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_availability_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_equipment_overrides: {
        Row: {
          bar_weight_kg: number | null
          created_at: string | null
          equipment_id: string
          gym_id: string
          id: string
          side_min_plate_kg: number | null
          single_min_increment_kg: number | null
          updated_at: string | null
        }
        Insert: {
          bar_weight_kg?: number | null
          created_at?: string | null
          equipment_id: string
          gym_id: string
          id?: string
          side_min_plate_kg?: number | null
          single_min_increment_kg?: number | null
          updated_at?: string | null
        }
        Update: {
          bar_weight_kg?: number | null
          created_at?: string | null
          equipment_id?: string
          gym_id?: string
          id?: string
          side_min_plate_kg?: number | null
          single_min_increment_kg?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_equipment_overrides_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_overrides_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "gym_equipment_overrides_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_equipment_overrides_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_plate_inventory: {
        Row: {
          count: number
          created_at: string | null
          gym_id: string
          id: string
          plate_kg: number
        }
        Insert: {
          count: number
          created_at?: string | null
          gym_id: string
          id?: string
          plate_kg: number
        }
        Update: {
          count?: number
          created_at?: string | null
          gym_id?: string
          id?: string
          plate_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "gym_plate_inventory_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          equipment_profile: Json | null
          id: string
          location: unknown
          name: string
          phone: string | null
          provider: string
          provider_place_id: string | null
          tz: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          equipment_profile?: Json | null
          id?: string
          location: unknown
          name: string
          phone?: string | null
          provider: string
          provider_place_id?: string | null
          tz?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          equipment_profile?: Json | null
          id?: string
          location?: unknown
          name?: string
          phone?: string | null
          provider?: string
          provider_place_id?: string | null
          tz?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      handle_equipment_rules: {
        Row: {
          equipment_type: string | null
          handle_id: string
          id: string
          kind: string | null
          load_medium: Database["public"]["Enums"]["load_medium"] | null
          load_type: Database["public"]["Enums"]["load_type"] | null
        }
        Insert: {
          equipment_type?: string | null
          handle_id: string
          id?: string
          kind?: string | null
          load_medium?: Database["public"]["Enums"]["load_medium"] | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
        }
        Update: {
          equipment_type?: string | null
          handle_id?: string
          id?: string
          kind?: string | null
          load_medium?: Database["public"]["Enums"]["load_medium"] | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
        }
        Relationships: []
      }
      handle_orientation_compatibility: {
        Row: {
          created_at: string | null
          handle_id: string
          id: string
          is_default: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Insert: {
          created_at?: string | null
          handle_id: string
          id?: string
          is_default?: boolean
          orientation: Database["public"]["Enums"]["grip_orientation"]
        }
        Update: {
          created_at?: string | null
          handle_id?: string
          id?: string
          is_default?: boolean
          orientation?: Database["public"]["Enums"]["grip_orientation"]
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          key: string
          operation_type: string
          request_hash: string
          response_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          key: string
          operation_type: string
          request_hash: string
          response_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          key?: string
          operation_type?: string
          request_hash?: string
          response_data?: Json | null
          user_id?: string
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
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
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
      mentor_areas: {
        Row: {
          life_category_id: string
          mentor_id: string
        }
        Insert: {
          life_category_id: string
          mentor_id: string
        }
        Update: {
          life_category_id?: string
          mentor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mentor_areas_life_cat"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mentor_areas_life_cat"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mentor_areas_mentor"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mentor_areas_mentor"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "v_public_mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_clients: {
        Row: {
          client_user_id: string
          created_at: string
          id: string
          mentor_id: string
          status: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          id?: string
          mentor_id: string
          status?: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          id?: string
          mentor_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_clients_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_clients_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "v_admin_mentors_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          accepts_clients: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          currency: string | null
          headline: string | null
          hourly_rate_cents: number | null
          id: string
          is_active: boolean
          is_approved: boolean
          is_public: boolean
          life_category_id: string
          role_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_clients?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          headline?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_public?: boolean
          life_category_id: string
          role_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_clients?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          headline?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_public?: boolean
          life_category_id?: string
          role_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_life_category_id_fkey"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_profiles_life_category_id_fkey"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_profiles_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "mentor_roles"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "mentor_profiles_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "v_public_mentors"
            referencedColumns: ["role_key"]
          },
        ]
      }
      mentor_roles: {
        Row: {
          key: string
          label: string
        }
        Insert: {
          key: string
          label: string
        }
        Update: {
          key?: string
          label?: string
        }
        Relationships: []
      }
      mentor_specialties: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_specialties_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_specialties_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "v_public_mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          hourly_rate: number | null
          id: string
          is_public: boolean
          life_category_id: string | null
          mentor_type: Database["public"]["Enums"]["mentor_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_public?: boolean
          life_category_id?: string | null
          mentor_type?: Database["public"]["Enums"]["mentor_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_public?: boolean
          life_category_id?: string | null
          mentor_type?: Database["public"]["Enums"]["mentor_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mentors_life_category"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mentors_life_category"
            columns: ["life_category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          client_user_id: string
          created_at: string
          ended_at: string | null
          id: string
          is_linked: boolean
          mentor_id: string
          notes: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_linked?: boolean
          mentor_id: string
          notes?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_linked?: boolean
          mentor_id?: string
          notes?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "v_public_mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_defs: {
        Row: {
          created_at: string
          enum_options: string[] | null
          id: string
          key: string
          label: string
          unit: string | null
          value_type: Database["public"]["Enums"]["metric_value_type"]
        }
        Insert: {
          created_at?: string
          enum_options?: string[] | null
          id?: string
          key: string
          label: string
          unit?: string | null
          value_type: Database["public"]["Enums"]["metric_value_type"]
        }
        Update: {
          created_at?: string
          enum_options?: string[] | null
          id?: string
          key?: string
          label?: string
          unit?: string | null
          value_type?: Database["public"]["Enums"]["metric_value_type"]
        }
        Relationships: []
      }
      movement_patterns: {
        Row: {
          created_at: string
          id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
        }
        Relationships: []
      }
      movement_patterns_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          movement_pattern_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          movement_pattern_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          movement_pattern_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_movement_patterns_translations_movement_pattern_id"
            columns: ["movement_pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      movements: {
        Row: {
          created_at: string
          id: string
          movement_pattern_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_pattern_id: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_pattern_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_movements_pattern"
            columns: ["movement_pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      movements_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          movement_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code: string
          movement_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          movement_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_movements_translations_movement_id"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movement_translations_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
            referencedColumns: ["id"]
          },
        ]
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
      naming_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          locale: string
          scope: string
          scope_ref_id: string | null
          sep: string
          template: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          scope: string
          scope_ref_id?: string | null
          sep?: string
          template: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          scope?: string
          scope_ref_id?: string | null
          sep?: string
          template?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      pain_events: {
        Row: {
          body_part_id: string | null
          created_at: string
          id: string
          note: string | null
          severity: number | null
          side: Database["public"]["Enums"]["body_side"]
          user_id: string
          workout_set_id: string | null
        }
        Insert: {
          body_part_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          severity?: number | null
          side?: Database["public"]["Enums"]["body_side"]
          user_id: string
          workout_set_id?: string | null
        }
        Update: {
          body_part_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          severity?: number | null
          side?: Database["public"]["Enums"]["body_side"]
          user_id?: string
          workout_set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pain_events_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_events_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_events_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_set_id"]
          },
          {
            foreignKeyName: "pain_events_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_workout_sets_display"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_events_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
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
          grip_ids: string[] | null
          grip_key: string
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
          grip_ids?: string[] | null
          grip_key?: string
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
          grip_ids?: string[] | null
          grip_key?: string
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
            referencedRelation: "v_admin_exercises"
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
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_set_id"]
          },
          {
            foreignKeyName: "personal_records_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_workout_sets_display"
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
      pre_workout_checkins: {
        Row: {
          answers: Json
          created_at: string
          energisers_taken: boolean | null
          id: string
          readiness_score: number | null
          user_id: string
          workout_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          energisers_taken?: boolean | null
          id?: string
          readiness_score?: number | null
          user_id: string
          workout_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          energisers_taken?: boolean | null
          id?: string
          readiness_score?: number | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "pre_workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "pre_workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "pre_workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: true
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          cycle_tracking_enabled: boolean
          display_name: string | null
          height_cm: number | null
          id: string
          is_public: boolean | null
          sex: string | null
          updated_at: string
          user_id: string
          username: string | null
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cycle_tracking_enabled?: boolean
          display_name?: string | null
          height_cm?: number | null
          id?: string
          is_public?: boolean | null
          sex?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          cycle_tracking_enabled?: boolean
          display_name?: string | null
          height_cm?: number | null
          id?: string
          is_public?: boolean | null
          sex?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      progression_policies: {
        Row: {
          algo: Database["public"]["Enums"]["progression_algo"]
          created_at: string
          id: string
          name: string
          params: Json
        }
        Insert: {
          algo: Database["public"]["Enums"]["progression_algo"]
          created_at?: string
          id?: string
          name: string
          params?: Json
        }
        Update: {
          algo?: Database["public"]["Enums"]["progression_algo"]
          created_at?: string
          id?: string
          name?: string
          params?: Json
        }
        Relationships: []
      }
      progressive_overload_plans: {
        Row: {
          created_at: string
          current_reps: number | null
          current_sets: number | null
          current_weight: number | null
          exercise_id: string
          failed_sessions: number | null
          id: string
          is_active: boolean | null
          last_progression_date: string | null
          rep_range_max: number | null
          rep_range_min: number | null
          strategy: string
          successful_sessions: number | null
          updated_at: string
          user_id: string
          weight_increment: number | null
        }
        Insert: {
          created_at?: string
          current_reps?: number | null
          current_sets?: number | null
          current_weight?: number | null
          exercise_id: string
          failed_sessions?: number | null
          id?: string
          is_active?: boolean | null
          last_progression_date?: string | null
          rep_range_max?: number | null
          rep_range_min?: number | null
          strategy: string
          successful_sessions?: number | null
          updated_at?: string
          user_id: string
          weight_increment?: number | null
        }
        Update: {
          created_at?: string
          current_reps?: number | null
          current_sets?: number | null
          current_weight?: number | null
          exercise_id?: string
          failed_sessions?: number | null
          id?: string
          is_active?: boolean | null
          last_progression_date?: string | null
          rep_range_max?: number | null
          rep_range_min?: number | null
          strategy?: string
          successful_sessions?: number | null
          updated_at?: string
          user_id?: string
          weight_increment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progressive_overload_plans_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progressive_overload_plans_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progressive_overload_plans_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_checkins: {
        Row: {
          alcohol: boolean | null
          checkin_at: string
          created_at: string
          energy: number | null
          id: string
          illness: boolean | null
          mood: number | null
          notes: string | null
          recovery_score: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness: number | null
          stress: number | null
          supplements: Json | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          alcohol?: boolean | null
          checkin_at?: string
          created_at?: string
          energy?: number | null
          id?: string
          illness?: boolean | null
          mood?: number | null
          notes?: string | null
          recovery_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          stress?: number | null
          supplements?: Json | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          alcohol?: boolean | null
          checkin_at?: string
          created_at?: string
          energy?: number | null
          id?: string
          illness?: boolean | null
          mood?: number | null
          notes?: string | null
          recovery_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          stress?: number | null
          supplements?: Json | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "readiness_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "readiness_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "readiness_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "readiness_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "readiness_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      rest_timer_sessions: {
        Row: {
          actual_rest_seconds: number | null
          completed_at: string | null
          created_at: string
          id: string
          interruption_reason: string | null
          planned_rest_seconds: number
          started_at: string
          user_id: string
          was_interrupted: boolean | null
          workout_set_id: string | null
        }
        Insert: {
          actual_rest_seconds?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interruption_reason?: string | null
          planned_rest_seconds: number
          started_at?: string
          user_id: string
          was_interrupted?: boolean | null
          workout_set_id?: string | null
        }
        Update: {
          actual_rest_seconds?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interruption_reason?: string | null
          planned_rest_seconds?: number
          started_at?: string
          user_id?: string
          was_interrupted?: boolean | null
          workout_set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rest_timer_sessions_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_set_id"]
          },
          {
            foreignKeyName: "rest_timer_sessions_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_workout_sets_display"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rest_timer_sessions_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          created_at: string
          current_count: number
          id: string
          last_activity_date: string | null
          longest_count: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_exercise_grips: {
        Row: {
          created_at: string
          grip_id: string
          id: string
          template_exercise_id: string
        }
        Insert: {
          created_at?: string
          grip_id: string
          id?: string
          template_exercise_id: string
        }
        Update: {
          created_at?: string
          grip_id?: string
          id?: string
          template_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_exercise_grips_grip_id_fkey"
            columns: ["grip_id"]
            isOneToOne: false
            referencedRelation: "grips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercise_grips_template_exercise_id_fkey"
            columns: ["template_exercise_id"]
            isOneToOne: false
            referencedRelation: "template_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      template_exercise_machine_pref: {
        Row: {
          gym_machine_id: string | null
          id: string
          template_exercise_id: string
          user_gym_machine_id: string
        }
        Insert: {
          gym_machine_id?: string | null
          id?: string
          template_exercise_id: string
          user_gym_machine_id: string
        }
        Update: {
          gym_machine_id?: string | null
          id?: string
          template_exercise_id?: string
          user_gym_machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_exercise_machine_pref_template_exercise_id_fkey"
            columns: ["template_exercise_id"]
            isOneToOne: true
            referencedRelation: "template_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercise_machine_pref_user_gym_machine_id_fkey"
            columns: ["user_gym_machine_id"]
            isOneToOne: false
            referencedRelation: "user_gym_machines"
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
          attribute_values_json: Json
          backoff_percent: number | null
          backoff_sets: number | null
          created_at: string | null
          default_grip_ids: string[] | null
          default_sets: number
          default_warmup_plan: Json | null
          display_name: string | null
          exercise_id: string
          grip_ids: string[] | null
          id: string
          notes: string | null
          order_index: number
          progression_policy_id: string | null
          rep_range_max: number | null
          rep_range_min: number | null
          rest_seconds: number | null
          set_scheme: string | null
          target_rep_max: number | null
          target_rep_min: number | null
          target_reps: number | null
          target_settings: Json | null
          target_weight: number | null
          target_weight_kg: number | null
          template_id: string
          top_set_percent_1rm: number | null
          warmup_policy_id: string | null
          weight_unit: string
        }
        Insert: {
          attribute_values_json?: Json
          backoff_percent?: number | null
          backoff_sets?: number | null
          created_at?: string | null
          default_grip_ids?: string[] | null
          default_sets?: number
          default_warmup_plan?: Json | null
          display_name?: string | null
          exercise_id: string
          grip_ids?: string[] | null
          id?: string
          notes?: string | null
          order_index: number
          progression_policy_id?: string | null
          rep_range_max?: number | null
          rep_range_min?: number | null
          rest_seconds?: number | null
          set_scheme?: string | null
          target_rep_max?: number | null
          target_rep_min?: number | null
          target_reps?: number | null
          target_settings?: Json | null
          target_weight?: number | null
          target_weight_kg?: number | null
          template_id: string
          top_set_percent_1rm?: number | null
          warmup_policy_id?: string | null
          weight_unit?: string
        }
        Update: {
          attribute_values_json?: Json
          backoff_percent?: number | null
          backoff_sets?: number | null
          created_at?: string | null
          default_grip_ids?: string[] | null
          default_sets?: number
          default_warmup_plan?: Json | null
          display_name?: string | null
          exercise_id?: string
          grip_ids?: string[] | null
          id?: string
          notes?: string | null
          order_index?: number
          progression_policy_id?: string | null
          rep_range_max?: number | null
          rep_range_min?: number | null
          rest_seconds?: number | null
          set_scheme?: string | null
          target_rep_max?: number | null
          target_rep_min?: number | null
          target_reps?: number | null
          target_settings?: Json | null
          target_weight?: number | null
          target_weight_kg?: number | null
          template_id?: string
          top_set_percent_1rm?: number | null
          warmup_policy_id?: string | null
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
            referencedRelation: "v_admin_exercises"
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
            foreignKeyName: "template_exercises_progression_policy_id_fkey"
            columns: ["progression_policy_id"]
            isOneToOne: false
            referencedRelation: "progression_policies"
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
          {
            foreignKeyName: "template_exercises_warmup_policy_id_fkey"
            columns: ["warmup_policy_id"]
            isOneToOne: false
            referencedRelation: "warmup_policies"
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
      training_program_blocks: {
        Row: {
          created_at: string
          focus_tags: string[] | null
          id: string
          notes: string | null
          order_index: number
          program_id: string
          workout_template_id: string
        }
        Insert: {
          created_at?: string
          focus_tags?: string[] | null
          id?: string
          notes?: string | null
          order_index: number
          program_id: string
          workout_template_id: string
        }
        Update: {
          created_at?: string
          focus_tags?: string[] | null
          id?: string
          notes?: string | null
          order_index?: number
          program_id?: string
          workout_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_program_blocks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_program_blocks_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_program_blocks_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          created_at: string
          goal: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_active_templates: {
        Row: {
          id: string
          is_active: boolean
          last_done_at: string | null
          notes: string | null
          order_index: number
          template_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          last_done_at?: string | null
          notes?: string | null
          order_index: number
          template_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          last_done_at?: string | null
          notes?: string | null
          order_index?: number
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_active_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_active_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
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
      user_equipment_preferences: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          notes: string | null
          preference_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          notes?: string | null
          preference_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          preference_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_preferences_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_equipment_preferences_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "user_equipment_preferences_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_estimates: {
        Row: {
          created_at: string | null
          estimated_weight: number
          exercise_id: string
          grip_key: string | null
          id: string
          source: string | null
          type: string
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_weight: number
          exercise_id: string
          grip_key?: string | null
          id?: string
          source?: string | null
          type?: string
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_weight?: number
          exercise_id?: string
          grip_key?: string | null
          id?: string
          source?: string | null
          type?: string
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_estimates_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_estimates_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_estimates_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_overrides: {
        Row: {
          available_inclines: number[] | null
          available_levels: number[] | null
          available_resistances: number[] | null
          created_at: string
          exercise_id: string
          extra: Json | null
          gym_profile_id: string | null
          id: string
          max_weight: number | null
          min_weight: number | null
          user_id: string
          weight_increment: number | null
        }
        Insert: {
          available_inclines?: number[] | null
          available_levels?: number[] | null
          available_resistances?: number[] | null
          created_at?: string
          exercise_id: string
          extra?: Json | null
          gym_profile_id?: string | null
          id?: string
          max_weight?: number | null
          min_weight?: number | null
          user_id: string
          weight_increment?: number | null
        }
        Update: {
          available_inclines?: number[] | null
          available_levels?: number[] | null
          available_resistances?: number[] | null
          created_at?: string
          exercise_id?: string
          extra?: Json | null
          gym_profile_id?: string | null
          id?: string
          max_weight?: number | null
          min_weight?: number | null
          user_id?: string
          weight_increment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_overrides_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_overrides_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_overrides_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_overrides_gym_profile_id_fkey"
            columns: ["gym_profile_id"]
            isOneToOne: false
            referencedRelation: "user_gym_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_warmup_prefs: {
        Row: {
          ease_bias: number
          exercise_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ease_bias?: number
          exercise_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ease_bias?: number
          exercise_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_warmup_prefs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_warmup_prefs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_warmup_prefs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_warmups: {
        Row: {
          adaptation_history: Json | null
          created_at: string
          exercise_id: string
          id: string
          last_feedback: Database["public"]["Enums"]["warmup_feedback"] | null
          notes: string | null
          plan_text: string
          preferred_intensity_adjustment: number | null
          preferred_set_count: number | null
          source: string
          success_streak: number
          updated_at: string
          user_id: string
          warmup_sets_done: number | null
          workout_exercise_id: string | null
        }
        Insert: {
          adaptation_history?: Json | null
          created_at?: string
          exercise_id: string
          id?: string
          last_feedback?: Database["public"]["Enums"]["warmup_feedback"] | null
          notes?: string | null
          plan_text: string
          preferred_intensity_adjustment?: number | null
          preferred_set_count?: number | null
          source?: string
          success_streak?: number
          updated_at?: string
          user_id: string
          warmup_sets_done?: number | null
          workout_exercise_id?: string | null
        }
        Update: {
          adaptation_history?: Json | null
          created_at?: string
          exercise_id?: string
          id?: string
          last_feedback?: Database["public"]["Enums"]["warmup_feedback"] | null
          notes?: string | null
          plan_text?: string
          preferred_intensity_adjustment?: number | null
          preferred_set_count?: number | null
          source?: string
          success_streak?: number
          updated_at?: string
          user_id?: string
          warmup_sets_done?: number | null
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_warmups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_warmups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_warmups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_templates: {
        Row: {
          created_at: string
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_features: {
        Row: {
          created_at: string
          features: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_fitness_profile: {
        Row: {
          bodyweight: number | null
          created_at: string | null
          goal: string | null
          height_cm: number | null
          injuries: Json | null
          prefer_short_rests: boolean | null
          sex: string | null
          training_age_months: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bodyweight?: number | null
          created_at?: string | null
          goal?: string | null
          height_cm?: number | null
          injuries?: Json | null
          prefer_short_rests?: boolean | null
          sex?: string | null
          training_age_months?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bodyweight?: number | null
          created_at?: string | null
          goal?: string | null
          height_cm?: number | null
          injuries?: Json | null
          prefer_short_rests?: boolean | null
          sex?: string | null
          training_age_months?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string
          current_level: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          current_value: number
          exercise_id: string | null
          id: string
          notes: string | null
          priority: string
          status: string
          target_date: string
          target_value: number
          title: string
          type: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          priority: string
          status?: string
          target_date: string
          target_value: number
          title: string
          type: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          exercise_id?: string | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          target_date?: string
          target_value?: number
          title?: string
          type?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gym_bars: {
        Row: {
          bar_type_id: string
          id: string
          quantity: number
          user_gym_id: string
        }
        Insert: {
          bar_type_id: string
          id?: string
          quantity?: number
          user_gym_id: string
        }
        Update: {
          bar_type_id?: string
          id?: string
          quantity?: number
          user_gym_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_bars_bar_type_id_fkey"
            columns: ["bar_type_id"]
            isOneToOne: false
            referencedRelation: "bar_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_bars_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "user_gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_bars_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "v_user_default_gym"
            referencedColumns: ["user_gym_id"]
          },
        ]
      }
      user_gym_dumbbells: {
        Row: {
          id: string
          quantity: number
          unit: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Insert: {
          id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Update: {
          id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_dumbbells_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "user_gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_dumbbells_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "v_user_default_gym"
            referencedColumns: ["user_gym_id"]
          },
        ]
      }
      user_gym_machines: {
        Row: {
          aux_values: number[] | null
          equipment_id: string | null
          id: string
          label: string
          stack_values: number[]
          unit: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
        }
        Insert: {
          aux_values?: number[] | null
          equipment_id?: string | null
          id?: string
          label: string
          stack_values: number[]
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
        }
        Update: {
          aux_values?: number[] | null
          equipment_id?: string | null
          id?: string
          label?: string
          stack_values?: number[]
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_machines_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_machines_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "user_gym_machines_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_machines_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "user_gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_machines_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "v_user_default_gym"
            referencedColumns: ["user_gym_id"]
          },
        ]
      }
      user_gym_memberships: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          is_default: boolean
          membership_notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          is_default?: boolean
          membership_notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          is_default?: boolean
          membership_notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_memberships_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gym_miniweights: {
        Row: {
          id: string
          quantity: number
          unit: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Insert: {
          id?: string
          quantity: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Update: {
          id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_miniweights_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "user_gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_miniweights_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "v_user_default_gym"
            referencedColumns: ["user_gym_id"]
          },
        ]
      }
      user_gym_plates: {
        Row: {
          id: string
          quantity: number
          unit: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Insert: {
          id?: string
          quantity: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id: string
          weight: number
        }
        Update: {
          id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["weight_unit"]
          user_gym_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_plates_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "user_gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gym_plates_user_gym_id_fkey"
            columns: ["user_gym_id"]
            isOneToOne: false
            referencedRelation: "v_user_default_gym"
            referencedColumns: ["user_gym_id"]
          },
        ]
      }
      user_gym_profiles: {
        Row: {
          available_dumbbells: number[] | null
          barbell_weight: number
          cable_increment: number
          created_at: string
          dumbbell_increment: number
          id: string
          machine_increment: number
          microplates: number[] | null
          notes: string | null
          profile_name: string
          user_id: string
        }
        Insert: {
          available_dumbbells?: number[] | null
          barbell_weight?: number
          cable_increment?: number
          created_at?: string
          dumbbell_increment?: number
          id?: string
          machine_increment?: number
          microplates?: number[] | null
          notes?: string | null
          profile_name?: string
          user_id: string
        }
        Update: {
          available_dumbbells?: number[] | null
          barbell_weight?: number
          cable_increment?: number
          created_at?: string
          dumbbell_increment?: number
          id?: string
          machine_increment?: number
          microplates?: number[] | null
          notes?: string | null
          profile_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gym_visits: {
        Row: {
          confidence: number
          detected_at: string
          gym_id: string | null
          id: string
          lat: number | null
          lng: number | null
          source: string
          user_id: string
        }
        Insert: {
          confidence?: number
          detected_at?: string
          gym_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          source: string
          user_id: string
        }
        Update: {
          confidence?: number
          detected_at?: string
          gym_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_visits_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gyms: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_injuries: {
        Row: {
          body_part_id: string
          created_at: string
          diagnosed_at: string | null
          id: string
          is_active: boolean
          notes: string | null
          severity: Database["public"]["Enums"]["injury_severity"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body_part_id: string
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          severity?: Database["public"]["Enums"]["injury_severity"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body_part_id?: string
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          severity?: Database["public"]["Enums"]["injury_severity"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_injuries_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "body_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_injuries_body_part_id_fkey"
            columns: ["body_part_id"]
            isOneToOne: false
            referencedRelation: "v_body_parts_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lifting_prefs: {
        Row: {
          allow_mixed_plates: boolean
          created_at: string
          prefer_smallest_increment: boolean
          user_id: string
        }
        Insert: {
          allow_mixed_plates?: boolean
          created_at?: string
          prefer_smallest_increment?: boolean
          user_id: string
        }
        Update: {
          allow_mixed_plates?: boolean
          created_at?: string
          prefer_smallest_increment?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_muscle_priorities: {
        Row: {
          created_at: string
          id: string
          muscle_id: string
          priority_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_id: string
          priority_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_id?: string
          priority_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_muscle_priorities_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_muscle_priorities_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "v_muscles_with_translations"
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
      user_prioritized_muscle_groups: {
        Row: {
          created_at: string
          id: string
          muscle_group_id: string
          priority: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group_id: string
          priority: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group_id?: string
          priority?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prioritized_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_prioritized_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_groups_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_fitness: {
        Row: {
          bodyweight: number | null
          created_at: string | null
          days_per_week: number | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          goal: string
          height: number | null
          height_cm: number | null
          id: string
          injuries: string[] | null
          preferred_session_minutes: number | null
          readiness_data: Json | null
          sex: Database["public"]["Enums"]["sex_type"] | null
          training_goal: string
          updated_at: string | null
          user_id: string
          weight_entry_style: string
        }
        Insert: {
          bodyweight?: number | null
          created_at?: string | null
          days_per_week?: number | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          goal: string
          height?: number | null
          height_cm?: number | null
          id?: string
          injuries?: string[] | null
          preferred_session_minutes?: number | null
          readiness_data?: Json | null
          sex?: Database["public"]["Enums"]["sex_type"] | null
          training_goal: string
          updated_at?: string | null
          user_id: string
          weight_entry_style?: string
        }
        Update: {
          bodyweight?: number | null
          created_at?: string | null
          days_per_week?: number | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          goal?: string
          height?: number | null
          height_cm?: number | null
          id?: string
          injuries?: string[] | null
          preferred_session_minutes?: number | null
          readiness_data?: Json | null
          sex?: Database["public"]["Enums"]["sex_type"] | null
          training_goal?: string
          updated_at?: string | null
          user_id?: string
          weight_entry_style?: string
        }
        Relationships: []
      }
      user_program_state: {
        Row: {
          last_completed_index: number
          program_id: string
          total_cycles_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          last_completed_index?: number
          program_id: string
          total_cycles_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          last_completed_index?: number
          program_id?: string
          total_cycles_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_program_state_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
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
      user_stats: {
        Row: {
          created_at: string
          current_level: number
          id: string
          last_workout_date: string | null
          longest_streak: number
          total_exercises: number
          total_volume: number
          total_workouts: number
          total_xp: number
          updated_at: string
          user_id: string
          workout_streak: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          last_workout_date?: string | null
          longest_streak?: number
          total_exercises?: number
          total_volume?: number
          total_workouts?: number
          total_xp?: number
          updated_at?: string
          user_id: string
          workout_streak?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          last_workout_date?: string | null
          longest_streak?: number
          total_exercises?: number
          total_volume?: number
          total_workouts?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
          workout_streak?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          default_unit: string
          id: string
          is_pro: boolean
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_unit?: string
          id: string
          is_pro?: boolean
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          default_unit?: string
          id?: string
          is_pro?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      warmup_policies: {
        Row: {
          created_at: string
          id: string
          name: string
          params: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          params?: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          params?: Json
        }
        Relationships: []
      }
      workout_checkins: {
        Row: {
          alcohol: boolean | null
          created_at: string
          energy: number | null
          id: string
          illness: boolean | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness: number | null
          stress: number | null
          supplements: string[] | null
          user_id: string
          workout_id: string
        }
        Insert: {
          alcohol?: boolean | null
          created_at?: string
          energy?: number | null
          id?: string
          illness?: boolean | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          stress?: number | null
          supplements?: string[] | null
          user_id: string
          workout_id: string
        }
        Update: {
          alcohol?: boolean | null
          created_at?: string
          energy?: number | null
          id?: string
          illness?: boolean | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness?: number | null
          stress?: number | null
          supplements?: string[] | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          workout_share_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          workout_share_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          workout_share_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_comments_workout_share_id_fkey"
            columns: ["workout_share_id"]
            isOneToOne: false
            referencedRelation: "workout_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercise_feedback: {
        Row: {
          created_at: string | null
          notes: string | null
          warmup_quality: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_top_weight: number | null
          warmup_total_reps: number | null
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string | null
          notes?: string | null
          warmup_quality?: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_top_weight?: number | null
          warmup_total_reps?: number | null
          workout_exercise_id: string
        }
        Update: {
          created_at?: string | null
          notes?: string | null
          warmup_quality?: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_top_weight?: number | null
          warmup_total_reps?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercise_feedback_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: true
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercise_groups: {
        Row: {
          created_at: string
          group_type: Database["public"]["Enums"]["group_type"]
          id: string
          name: string | null
          order_index: number
          rest_seconds_between_cycles: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          group_type?: Database["public"]["Enums"]["group_type"]
          id?: string
          name?: string | null
          order_index?: number
          rest_seconds_between_cycles?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          group_type?: Database["public"]["Enums"]["group_type"]
          id?: string
          name?: string | null
          order_index?: number
          rest_seconds_between_cycles?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercise_groups_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercise_groups_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_exercise_groups_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_exercise_groups_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_exercise_groups_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          attribute_values_json: Json | null
          bar_type_id: string | null
          display_name: string | null
          exercise_id: string
          grip_id: string | null
          grip_ids: string[] | null
          grip_key: string | null
          group_id: string | null
          id: string
          is_superset_group: string | null
          load_entry_mode: string | null
          load_type: Database["public"]["Enums"]["load_type"] | null
          notes: string | null
          order_index: number
          per_side_weight: number | null
          readiness_adjusted_from: string | null
          rest_seconds: number | null
          selected_bar_id: string | null
          target_origin: string | null
          target_reps: number | null
          target_sets: number | null
          target_weight: number | null
          target_weight_kg: number | null
          warmup_feedback: string | null
          warmup_feedback_at: string | null
          warmup_plan: Json | null
          warmup_quality: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_snapshot: string | null
          warmup_updated_at: string | null
          weight_input_mode: string | null
          weight_unit: string | null
          workout_id: string
        }
        Insert: {
          attribute_values_json?: Json | null
          bar_type_id?: string | null
          display_name?: string | null
          exercise_id: string
          grip_id?: string | null
          grip_ids?: string[] | null
          grip_key?: string | null
          group_id?: string | null
          id?: string
          is_superset_group?: string | null
          load_entry_mode?: string | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
          notes?: string | null
          order_index: number
          per_side_weight?: number | null
          readiness_adjusted_from?: string | null
          rest_seconds?: number | null
          selected_bar_id?: string | null
          target_origin?: string | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          target_weight_kg?: number | null
          warmup_feedback?: string | null
          warmup_feedback_at?: string | null
          warmup_plan?: Json | null
          warmup_quality?: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_snapshot?: string | null
          warmup_updated_at?: string | null
          weight_input_mode?: string | null
          weight_unit?: string | null
          workout_id: string
        }
        Update: {
          attribute_values_json?: Json | null
          bar_type_id?: string | null
          display_name?: string | null
          exercise_id?: string
          grip_id?: string | null
          grip_ids?: string[] | null
          grip_key?: string | null
          group_id?: string | null
          id?: string
          is_superset_group?: string | null
          load_entry_mode?: string | null
          load_type?: Database["public"]["Enums"]["load_type"] | null
          notes?: string | null
          order_index?: number
          per_side_weight?: number | null
          readiness_adjusted_from?: string | null
          rest_seconds?: number | null
          selected_bar_id?: string | null
          target_origin?: string | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          target_weight_kg?: number | null
          warmup_feedback?: string | null
          warmup_feedback_at?: string | null
          warmup_plan?: Json | null
          warmup_quality?: Database["public"]["Enums"]["warmup_quality"] | null
          warmup_snapshot?: string | null
          warmup_updated_at?: string | null
          weight_input_mode?: string | null
          weight_unit?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_bar_type_id_fkey"
            columns: ["bar_type_id"]
            isOneToOne: false
            referencedRelation: "bar_types"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "v_admin_exercises"
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
            foreignKeyName: "workout_exercises_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "workout_exercise_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_selected_bar_id_fkey"
            columns: ["selected_bar_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_selected_bar_id_fkey"
            columns: ["selected_bar_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "workout_exercises_selected_bar_id_fkey"
            columns: ["selected_bar_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
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
      workout_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workout_share_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workout_share_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workout_share_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_likes_workout_share_id_fkey"
            columns: ["workout_share_id"]
            isOneToOne: false
            referencedRelation: "workout_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_session_feedback: {
        Row: {
          created_at: string
          difficulty: number | null
          energy_after: number | null
          enjoyment: number | null
          id: string
          joint_stiffness: number | null
          muscle_soreness: number | null
          notes: string | null
          perceived_exertion: number | null
          user_id: string
          what_to_improve: string | null
          what_went_well: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          energy_after?: number | null
          enjoyment?: number | null
          id?: string
          joint_stiffness?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          user_id: string
          what_to_improve?: string | null
          what_went_well?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          energy_after?: number | null
          enjoyment?: number | null
          id?: string
          joint_stiffness?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          user_id?: string
          what_to_improve?: string | null
          what_went_well?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_session_feedback_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_session_feedback_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_session_feedback_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_session_feedback_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_session_feedback_workout_id_fkey"
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
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_set_id"]
          },
          {
            foreignKeyName: "workout_set_grips_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_workout_sets_display"
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
      workout_set_metric_values: {
        Row: {
          bool_value: boolean | null
          created_at: string
          id: string
          int_value: number | null
          metric_def_id: string
          numeric_value: number | null
          text_value: string | null
          workout_set_id: string
        }
        Insert: {
          bool_value?: boolean | null
          created_at?: string
          id?: string
          int_value?: number | null
          metric_def_id: string
          numeric_value?: number | null
          text_value?: string | null
          workout_set_id: string
        }
        Update: {
          bool_value?: boolean | null
          created_at?: string
          id?: string
          int_value?: number | null
          metric_def_id?: string
          numeric_value?: number | null
          text_value?: string | null
          workout_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_set_metric_values_metric_def_id_fkey"
            columns: ["metric_def_id"]
            isOneToOne: false
            referencedRelation: "exercise_metric_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_set_metric_values_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_set_id"]
          },
          {
            foreignKeyName: "workout_set_metric_values_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "v_workout_sets_display"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_set_metric_values_workout_set_id_fkey"
            columns: ["workout_set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          bar_id: string | null
          bar_type_id: string | null
          completed_at: string | null
          distance: number | null
          duration_seconds: number | null
          effort: Database["public"]["Enums"]["effort_code"] | null
          effort_rating: number | null
          grip_key: string | null
          had_pain: boolean | null
          heart_rate: number | null
          id: string
          input_unit: string | null
          input_weight: number | null
          is_completed: boolean | null
          load_entry_mode: string | null
          load_meta: Json
          load_one_side_kg: number | null
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          rpe: number | null
          set_index: number | null
          set_kind: Database["public"]["Enums"]["set_type"] | null
          settings: Json | null
          side: string | null
          target_reps: number | null
          target_weight: number | null
          total_weight_kg: number | null
          weight: number | null
          weight_kg: number | null
          weight_per_side: number | null
          weight_unit: string | null
          workout_exercise_id: string
        }
        Insert: {
          bar_id?: string | null
          bar_type_id?: string | null
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          effort?: Database["public"]["Enums"]["effort_code"] | null
          effort_rating?: number | null
          grip_key?: string | null
          had_pain?: boolean | null
          heart_rate?: number | null
          id?: string
          input_unit?: string | null
          input_weight?: number | null
          is_completed?: boolean | null
          load_entry_mode?: string | null
          load_meta?: Json
          load_one_side_kg?: number | null
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_index?: number | null
          set_kind?: Database["public"]["Enums"]["set_type"] | null
          settings?: Json | null
          side?: string | null
          target_reps?: number | null
          target_weight?: number | null
          total_weight_kg?: number | null
          weight?: number | null
          weight_kg?: number | null
          weight_per_side?: number | null
          weight_unit?: string | null
          workout_exercise_id: string
        }
        Update: {
          bar_id?: string | null
          bar_type_id?: string | null
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          effort?: Database["public"]["Enums"]["effort_code"] | null
          effort_rating?: number | null
          grip_key?: string | null
          had_pain?: boolean | null
          heart_rate?: number | null
          id?: string
          input_unit?: string | null
          input_weight?: number | null
          is_completed?: boolean | null
          load_entry_mode?: string | null
          load_meta?: Json
          load_one_side_kg?: number | null
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_index?: number | null
          set_kind?: Database["public"]["Enums"]["set_type"] | null
          settings?: Json | null
          side?: string | null
          target_reps?: number | null
          target_weight?: number | null
          total_weight_kg?: number | null
          weight?: number | null
          weight_kg?: number | null
          weight_per_side?: number | null
          weight_unit?: string | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "workout_sets_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_bar_type_id_fkey"
            columns: ["bar_type_id"]
            isOneToOne: false
            referencedRelation: "bar_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_shares: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          id: string
          is_public: boolean | null
          likes_count: number | null
          share_type: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          share_type?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          share_type?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_current_workout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_last_working_set"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_pre_checkin_exists"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "v_workout_has_checkin"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_shares_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          favorite: boolean
          id: string
          is_public: boolean
          name: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite?: boolean
          id?: string
          is_public?: boolean
          name?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          favorite?: boolean
          id?: string
          is_public?: boolean
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
          estimated_duration_minutes: number | null
          id: string
          notes: string | null
          perceived_exertion: number | null
          readiness_score: number | null
          session_unit: string
          started_at: string
          template_id: string | null
          title: string | null
          total_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          readiness_score?: number | null
          session_unit?: string
          started_at?: string
          template_id?: string | null
          title?: string | null
          total_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          readiness_score?: number | null
          session_unit?: string
          started_at?: string
          template_id?: string | null
          title?: string | null
          total_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_workout_templates_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mv_last_set_per_user_exercise: {
        Row: {
          completed_at: string | null
          exercise_id: string | null
          reps: number | null
          rn: number | null
          user_id: string | null
          weight: number | null
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
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_pr_weight_per_user_exercise: {
        Row: {
          best_weight: number | null
          exercise_id: string | null
          user_id: string | null
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
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_admin_exercises: {
        Row: {
          body_part_id: string | null
          body_part_name: string | null
          body_part_slug: string | null
          configured: boolean | null
          created_at: string | null
          equipment_id: string | null
          equipment_name: string | null
          equipment_slug: string | null
          id: string | null
          is_public: boolean | null
          load_type: Database["public"]["Enums"]["load_type_enum"] | null
          movement_pattern_id: string | null
          movement_pattern_name: string | null
          movement_pattern_slug: string | null
          muscle_group_name: string | null
          muscle_group_slug: string | null
          name: string | null
          owner_user_id: string | null
          popularity_rank: number | null
          primary_muscle_id: string | null
          slug: string | null
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
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
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
          {
            foreignKeyName: "fk_exercises_pattern"
            columns: ["movement_pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      v_admin_mentors_overview: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          hourly_rate: number | null
          id: string | null
          is_active: boolean | null
          mentor_type: Database["public"]["Enums"]["mentor_type"] | null
          primary_category_id: string | null
          primary_category_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mentors_life_category"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "life_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mentors_life_category"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "v_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      v_current_workout: {
        Row: {
          id: string | null
          started_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_equipment_effective: {
        Row: {
          bar_weight_kg: number | null
          default_bar_weight_kg: number | null
          default_side_min_plate_kg: number | null
          default_single_min_increment_kg: number | null
          equipment_id: string | null
          gym_id: string | null
          load_medium: Database["public"]["Enums"]["load_medium"] | null
          load_type: Database["public"]["Enums"]["load_type"] | null
          side_min_plate_kg: number | null
          single_min_increment_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_equipment_overrides_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
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
      v_exercise_last_set: {
        Row: {
          completed_at: string | null
          exercise_id: string | null
          notes: string | null
          reps: number | null
          rpe: number | null
          user_id: string | null
          weight: number | null
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
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_exercises_with_translations: {
        Row: {
          allows_grips: boolean | null
          attribute_values_json: Json | null
          body_part_id: string | null
          capability_schema: Json | null
          complexity_score: number | null
          configured: boolean | null
          contraindications: Json | null
          created_at: string | null
          custom_display_name: string | null
          default_bar_type_id: string | null
          default_bar_weight: number | null
          default_grip_ids: string[] | null
          display_name: string | null
          display_name_tsv: unknown | null
          equipment_id: string | null
          equipment_ref_id: string | null
          exercise_skill_level:
            | Database["public"]["Enums"]["exercise_skill_level"]
            | null
          id: string | null
          image_url: string | null
          is_bar_loaded: boolean | null
          is_public: boolean | null
          is_unilateral: boolean | null
          load_type: Database["public"]["Enums"]["load_type_enum"] | null
          loading_hint: string | null
          movement_id: string | null
          movement_pattern_id: string | null
          name_locale: string | null
          name_version: number | null
          owner_user_id: string | null
          popularity_rank: number | null
          primary_muscle_id: string | null
          secondary_muscle_group_ids: string[] | null
          slug: string | null
          source_url: string | null
          tags: string[] | null
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
            foreignKeyName: "exercises_default_bar_type_id_fkey"
            columns: ["default_bar_type_id"]
            isOneToOne: false
            referencedRelation: "bar_types"
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
            referencedRelation: "v_equipment_effective"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_equipment_with_translations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_ref_id_fkey"
            columns: ["equipment_ref_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
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
          {
            foreignKeyName: "fk_exercises_pattern"
            columns: ["movement_pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      v_last_working_set: {
        Row: {
          completed_at: string | null
          distance: number | null
          duration_seconds: number | null
          exercise_id: string | null
          reps: number | null
          rpe: number | null
          user_id: string | null
          weight: number | null
          weight_unit: string | null
          workout_id: string | null
          workout_set_id: string | null
          workout_started_at: string | null
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
            referencedRelation: "v_admin_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_latest_readiness: {
        Row: {
          alcohol: boolean | null
          created_at: string | null
          energy: number | null
          illness: boolean | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness: number | null
          stress: number | null
          supplements: Json | null
          user_id: string | null
        }
        Relationships: []
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
      v_pre_checkin_exists: {
        Row: {
          has_checkin: boolean | null
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          has_checkin?: never
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          has_checkin?: never
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: []
      }
      v_public_mentors: {
        Row: {
          accepts_clients: boolean | null
          active_clients: number | null
          avatar_url: string | null
          bio: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          currency: string | null
          headline: string | null
          hourly_rate_cents: number | null
          id: string | null
          role_key: string | null
          role_label: string | null
          specialties: string[] | null
          user_id: string | null
        }
        Relationships: []
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
      v_user_default_gym: {
        Row: {
          gym_id: string | null
          user_gym_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_gym_memberships_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
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
      v_workout_has_checkin: {
        Row: {
          has_checkin: boolean | null
          workout_id: string | null
        }
        Insert: {
          has_checkin?: never
          workout_id?: string | null
        }
        Update: {
          has_checkin?: never
          workout_id?: string | null
        }
        Relationships: []
      }
      v_workout_sets_display: {
        Row: {
          bar_weight: number | null
          completed_at: string | null
          distance: number | null
          duration_seconds: number | null
          effort: Database["public"]["Enums"]["effort_code"] | null
          effort_rating: number | null
          entry_mode: string | null
          had_pain: boolean | null
          heart_rate: number | null
          id: string | null
          is_completed: boolean | null
          load_meta: Json | null
          notes: string | null
          per_side_weight: number | null
          reps: number | null
          rest_seconds: number | null
          rpe: number | null
          set_index: number | null
          set_kind: Database["public"]["Enums"]["set_type"] | null
          settings: Json | null
          side: string | null
          total_weight: number | null
          weight: number | null
          weight_unit: string | null
          workout_exercise_id: string | null
        }
        Insert: {
          bar_weight?: never
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          effort?: Database["public"]["Enums"]["effort_code"] | null
          effort_rating?: number | null
          entry_mode?: never
          had_pain?: boolean | null
          heart_rate?: number | null
          id?: string | null
          is_completed?: boolean | null
          load_meta?: Json | null
          notes?: string | null
          per_side_weight?: never
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_index?: number | null
          set_kind?: Database["public"]["Enums"]["set_type"] | null
          settings?: Json | null
          side?: string | null
          total_weight?: number | null
          weight?: number | null
          weight_unit?: string | null
          workout_exercise_id?: string | null
        }
        Update: {
          bar_weight?: never
          completed_at?: string | null
          distance?: number | null
          duration_seconds?: number | null
          effort?: Database["public"]["Enums"]["effort_code"] | null
          effort_rating?: number | null
          entry_mode?: never
          had_pain?: boolean | null
          heart_rate?: number | null
          id?: string | null
          is_completed?: boolean | null
          load_meta?: Json | null
          notes?: string | null
          per_side_weight?: never
          reps?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_index?: number | null
          set_kind?: Database["public"]["Enums"]["set_type"] | null
          settings?: Json | null
          side?: string | null
          total_weight?: number | null
          weight?: number | null
          weight_unit?: string | null
          workout_exercise_id?: string | null
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
      _get_estimate_weight_kg: {
        Args: { p_exercise_id: string; p_user_id: string }
        Returns: number
      }
      _pascalize: {
        Args: { key: string }
        Returns: string
      }
      _pick_template: {
        Args: {
          p_equipment_id: string
          p_locale: string
          p_movement_id: string
        }
        Returns: string
      }
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      add_set: {
        Args: { p_payload: Json; p_workout_exercise_id: string }
        Returns: string
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      admin_delete_mentor: {
        Args: { p_id: string }
        Returns: boolean
      }
      admin_upsert_mentor: {
        Args: { p_payload: Json }
        Returns: Json
      }
      advance_program_state: {
        Args: { _completed_block_id: string; _user_id: string }
        Returns: boolean
      }
      apply_initial_targets: {
        Args: { p_workout_id: string }
        Returns: undefined
      }
      audit_security_definer_functions: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          has_search_path: boolean
          is_restricted: boolean
        }[]
      }
      bar_min_increment: {
        Args: { _gym_id: string }
        Returns: number
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      can_mutate_workout_set: {
        Args: { _we_id: string }
        Returns: boolean
      }
      check_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_idempotency: {
        Args: {
          p_key: string
          p_operation_type: string
          p_request_hash: string
          p_user_id: string
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_max_requests?: number
          p_operation_type: string
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_idempotency_keys: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      closest_machine_weight: {
        Args: { aux: number[]; desired: number; stack: number[] }
        Returns: number
      }
      compute_readiness_for_user: {
        Args: { p_user_id: string }
        Returns: number
      }
      compute_readiness_for_user_at: {
        Args: { p_at: string; p_user_id: string }
        Returns: number
      }
      compute_readiness_score: {
        Args: {
          p_alcohol: boolean
          p_energy: number
          p_illness: boolean
          p_sleep_hours: number
          p_sleep_quality: number
          p_soreness: number
          p_stress: number
          p_supplements: Json
        }
        Returns: number
      }
      compute_targets_for_workout: {
        Args: { p_workout_id: string }
        Returns: undefined
      }
      compute_total_weight: {
        Args: {
          p_bar_weight: number
          p_entry_mode: string
          p_is_symmetrical?: boolean
          p_value: number
        }
        Returns: number
      }
      create_admin_user: {
        Args: { requester_role?: string; target_user_id: string }
        Returns: boolean
      }
      create_demo_template_for_current_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
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
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      exercise_search: {
        Args: {
          p_body_part_id?: string
          p_equipment_id?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: {
          body_part_id: string
          equipment_id: string
          id: string
          is_public: boolean
          name: string
          similarity_score: number
          slug: string
        }[]
      }
      filter_exercises_by_injuries: {
        Args: { p_exercise_ids?: string[]; p_user_id: string }
        Returns: {
          contraindication_reasons: string[]
          exercise_id: string
          is_safe: boolean
        }[]
      }
      fn_available_exercises_for_user: {
        Args: { _user: string }
        Returns: {
          exercise_id: string
        }[]
      }
      fn_detect_stagnation: {
        Args: { p_exercise_id: string; p_lookback_sessions?: number }
        Returns: Json
      }
      fn_suggest_rest_seconds: {
        Args: { p_effort_level?: string; p_workout_set_id: string }
        Returns: number
      }
      fn_suggest_sets: {
        Args: {
          p_exercise_id: string
          p_progression_type?: string
          p_target_reps?: number
        }
        Returns: Json
      }
      fn_suggest_warmup: {
        Args: {
          p_exercise_id: string
          p_working_reps?: number
          p_working_weight?: number
        }
        Returns: Json
      }
      generate_exercise_name: {
        Args: {
          p_attr: Json
          p_equipment_id: string
          p_grip_type_key: string
          p_handle_key: string
          p_locale?: string
          p_movement_id: string
          p_primary_muscle: string
        }
        Returns: string
      }
      generate_warmup_json: {
        Args: { p_top_reps?: number; p_top_weight: number; p_unit?: string }
        Returns: Json
      }
      generate_warmup_steps: {
        Args: { p_top_kg: number }
        Returns: Json
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_category_name: {
        Args: { p_category_id: string; p_language_code?: string }
        Returns: string
      }
      get_default_gym: {
        Args: { _user_id: string }
        Returns: string
      }
      get_effective_attribute_schema: {
        Args: { p_equipment_id: string; p_movement_id: string }
        Returns: Json
      }
      get_effective_muscles: {
        Args: {
          _equipment_id?: string
          _exercise_id: string
          _grip_ids?: string[]
        }
        Returns: {
          base_role: string
          effective_score: number
          muscle_id: string
          primary_muscle: boolean
        }[]
      }
      get_last_sets_for_exercises: {
        Args: { p_exercise_ids: string[] }
        Returns: {
          base_weight_kg: number
          exercise_id: string
          prev_date: string
          prev_reps: number
          prev_weight_kg: number
          readiness_multiplier: number
        }[]
      }
      get_latest_readiness: {
        Args: { p_user_id: string; p_workout_started_at?: string }
        Returns: {
          alcohol: boolean
          created_at: string
          energy: number
          illness: boolean
          sleep_hours: number
          sleep_quality: number
          soreness: number
          stress: number
          supplements: number
        }[]
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
      get_next_program_block: {
        Args: { _user_id: string }
        Returns: {
          cycles_completed: number
          focus_tags: string[]
          next_block_id: string
          order_index: number
          program_id: string
          template_name: string
          total_blocks: number
          workout_template_id: string
        }[]
      }
      get_next_set_index: {
        Args: { p_workout_exercise_id: string }
        Returns: number
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_subcategory_name: {
        Args: { p_language_code?: string; p_subcategory_id: string }
        Returns: string
      }
      get_text: {
        Args: { p_key: string; p_language_code?: string }
        Returns: string
      }
      get_user_coach_params: {
        Args: { _user_id: string }
        Returns: {
          allow_high_complexity: boolean
          experience_slug: string
          main_rest_seconds_max: number
          main_rest_seconds_min: number
          start_intensity_high: number
          start_intensity_low: number
          warmup_set_count_max: number
          warmup_set_count_min: number
          weekly_progress_pct: number
        }[]
      }
      get_user_exercise_1rm: {
        Args: { p_user_id?: string }
        Returns: {
          exercise_id: string
          last_set_at: string
          one_rm: number
          refreshed_at: string
          user_id: string
        }[]
      }
      get_user_last_set_for_exercise: {
        Args: { p_exercise_id: string }
        Returns: {
          completed_at: string
          exercise_id: string
          reps: number
          user_id: string
          weight: number
        }[]
      }
      get_user_pr_for_exercise: {
        Args: { p_exercise_id: string }
        Returns: {
          best_weight: number
          exercise_id: string
          user_id: string
        }[]
      }
      get_workout_recalibration: {
        Args: { p_exercise_ids: string[]; p_user_id: string }
        Returns: Json
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_warmup_for_exercise: {
        Args: { p_workout_exercise_id: string }
        Returns: undefined
      }
      initialize_warmups_for_workout: {
        Args: { p_workout_id: string }
        Returns: number
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_admin_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_with_rate_limit: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_pro_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_with_rate_limit: {
        Args: Record<PropertyKey, never> | { _user_id: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      log_admin_action: {
        Args: { action_type: string; details?: Json; target_user_id?: string }
        Returns: undefined
      }
      log_coach_decision: {
        Args: {
          p_error_message?: string
          p_execution_time_ms?: number
          p_function_name: string
          p_inputs?: Json
          p_metadata?: Json
          p_outputs?: Json
          p_session_id?: string
          p_step: string
          p_success?: boolean
          p_user_id: string
        }
        Returns: string
      }
      log_set_with_grip_aware_constraint: {
        Args: {
          p_grip_key?: string
          p_reps: number
          p_rest_seconds?: number
          p_rpe?: number
          p_set_index: number
          p_set_kind?: string
          p_weight_kg: number
          p_workout_exercise_id: string
        }
        Returns: string
      }
      log_simple_workout_set: {
        Args:
          | {
              p_grip_key?: string
              p_is_completed?: boolean
              p_reps: number
              p_set_index: number
              p_weight_kg: number
              p_workout_exercise_id: string
            }
          | {
              p_reps: number
              p_set_index: number
              p_set_kind?: string
              p_weight_kg: number
              p_workout_exercise_id: string
            }
        Returns: string
      }
      log_workout_set: {
        Args: {
          p_grip_ids?: string[]
          p_metrics: Json
          p_set_index: number
          p_workout_exercise_id: string
        }
        Returns: string
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      make_grip_key: {
        Args: { _grip_ids: string[] }
        Returns: string
      }
      migrate_user_gym_to_gym_equipment: {
        Args: { _gym_id: string; _user_gym_id: string }
        Returns: undefined
      }
      nearest_gyms: {
        Args: { _lat: number; _lng: number; _radius_m?: number }
        Returns: {
          address: string
          confidence: number
          distance_m: number
          gym_id: string
          name: string
        }[]
      }
      next_template_id: {
        Args: { _user_id: string }
        Returns: string
      }
      next_weight_step_kg: {
        Args: {
          p_load_type: Database["public"]["Enums"]["load_type"]
          p_side_min_plate_kg: number
          p_single_min_increment_kg: number
        }
        Returns: number
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pick_base_load: {
        Args: { p_exercise: string; p_user: string }
        Returns: number
      }
      plan_next_prescription: {
        Args: {
          p_exercise_id: string
          p_lookback_sessions?: number
          p_user_id: string
        }
        Returns: Json
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      promote_frequent_gym: {
        Args: { _user_id: string }
        Returns: undefined
      }
      readiness_multiplier: {
        Args: { p_score: number }
        Returns: number
      }
      recalc_warmup_from_last_set: {
        Args: { p_workout_exercise_id: string }
        Returns: undefined
      }
      refresh_exercise_views: {
        Args: { p_exercise_id: string; p_user_id: string }
        Returns: undefined
      }
      refresh_materialized_views_secure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_data_quality_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      save_readiness_checkin: {
        Args:
          | {
              p_alcohol: boolean
              p_energy: number
              p_illness: boolean
              p_sleep_hours: number
              p_sleep_quality: number
              p_soreness: number
              p_stress: number
              p_supplements: Json
            }
          | {
              p_alcohol: boolean
              p_energy: number
              p_illness: boolean
              p_sleep_hours: number
              p_sleep_quality: number
              p_soreness: number
              p_stress: number
              p_supplements: number
              p_workout_id: string
            }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      set_log: {
        Args: { p_payload: Json }
        Returns: Json
      }
      short_hash_uuid: {
        Args: { u: string }
        Returns: string
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      slugify: {
        Args: { txt: string }
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      start_workout: {
        Args: { p_template_id?: string }
        Returns: string
      }
      start_workout_with_smart_targets: {
        Args: { p_template_id?: string }
        Returns: string
      }
      store_idempotency_result: {
        Args: {
          p_key: string
          p_operation_type: string
          p_request_hash: string
          p_response_data: Json
          p_user_id: string
        }
        Returns: undefined
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      toggle_workout_like: {
        Args: { share_id: string }
        Returns: boolean
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upsert_user_exercise_warmup: {
        Args:
          | {
              _exercise_id: string
              _feedback?: Database["public"]["Enums"]["warmup_feedback"]
              _plan_text: string
              _source?: string
              _user_id: string
            }
          | { p_exercise_id: string; p_pretty_text: string; p_source?: Json }
        Returns: {
          adaptation_history: Json | null
          created_at: string
          exercise_id: string
          id: string
          last_feedback: Database["public"]["Enums"]["warmup_feedback"] | null
          notes: string | null
          plan_text: string
          preferred_intensity_adjustment: number | null
          preferred_set_count: number | null
          source: string
          success_streak: number
          updated_at: string
          user_id: string
          warmup_sets_done: number | null
          workout_exercise_id: string | null
        }
      }
      upsert_warmup_bias: {
        Args: { p_delta: number; p_exercise_id: string; p_user_id: string }
        Returns: undefined
      }
      validate_contraindications: {
        Args: { contraindications: Json }
        Returns: boolean
      }
      validate_muscle_group_ids: {
        Args: { muscle_group_ids: string[] }
        Returns: boolean
      }
      workout_open: {
        Args: { p_workout_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "mentor" | "user"
      attr_scope: "global" | "movement" | "equipment"
      body_side: "left" | "right" | "bilateral" | "unspecified"
      effort_code: "++" | "+" | "-" | "--"
      exercise_skill_level: "low" | "medium" | "high"
      experience_level:
        | "new"
        | "returning"
        | "intermediate"
        | "advanced"
        | "very_experienced"
      fitness_goal:
        | "lose_weight"
        | "maintain_weight"
        | "gain_weight"
        | "build_muscle"
        | "increase_strength"
        | "improve_endurance"
        | "general_fitness"
      grip_orientation: "overhand" | "underhand" | "neutral" | "mixed"
      group_type: "solo" | "superset" | "giant" | "finisher" | "circuit"
      injury_severity: "mild" | "moderate" | "severe" | "chronic"
      load_medium:
        | "bar"
        | "plates"
        | "stack"
        | "bodyweight"
        | "other"
        | "band"
        | "chain"
        | "flywheel"
      load_type: "none" | "single_load" | "dual_load" | "stack"
      load_type_enum:
        | "barbell"
        | "single_load"
        | "dual_load"
        | "stack"
        | "bodyweight"
        | "fixed"
      mentor_type: "mentor" | "coach"
      metric_value_type: "int" | "numeric" | "text" | "bool" | "enum"
      primary_weight_goal: "lose" | "maintain" | "recomp" | "gain"
      progression_algo:
        | "rep_range_linear"
        | "percent_1rm"
        | "rpe_based"
        | "pyramid"
        | "reverse_pyramid"
        | "dup"
        | "custom"
      progression_model:
        | "double_progression"
        | "linear_load"
        | "rep_targets"
        | "percent_1rm"
        | "rpe_based"
      set_type:
        | "normal"
        | "warmup"
        | "drop"
        | "amrap"
        | "timed"
        | "distance"
        | "top_set"
        | "backoff"
        | "cooldown"
      sex_type: "male" | "female" | "other" | "prefer_not_to_say"
      training_focus:
        | "muscle"
        | "strength"
        | "general"
        | "power"
        | "cardio"
        | "bodybuilding"
      warmup_feedback: "not_enough" | "excellent" | "too_much"
      warmup_quality: "not_enough" | "excellent" | "too_much"
      weight_unit: "kg" | "lb"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      attr_scope: ["global", "movement", "equipment"],
      body_side: ["left", "right", "bilateral", "unspecified"],
      effort_code: ["++", "+", "-", "--"],
      exercise_skill_level: ["low", "medium", "high"],
      experience_level: [
        "new",
        "returning",
        "intermediate",
        "advanced",
        "very_experienced",
      ],
      fitness_goal: [
        "lose_weight",
        "maintain_weight",
        "gain_weight",
        "build_muscle",
        "increase_strength",
        "improve_endurance",
        "general_fitness",
      ],
      grip_orientation: ["overhand", "underhand", "neutral", "mixed"],
      group_type: ["solo", "superset", "giant", "finisher", "circuit"],
      injury_severity: ["mild", "moderate", "severe", "chronic"],
      load_medium: [
        "bar",
        "plates",
        "stack",
        "bodyweight",
        "other",
        "band",
        "chain",
        "flywheel",
      ],
      load_type: ["none", "single_load", "dual_load", "stack"],
      load_type_enum: [
        "barbell",
        "single_load",
        "dual_load",
        "stack",
        "bodyweight",
        "fixed",
      ],
      mentor_type: ["mentor", "coach"],
      metric_value_type: ["int", "numeric", "text", "bool", "enum"],
      primary_weight_goal: ["lose", "maintain", "recomp", "gain"],
      progression_algo: [
        "rep_range_linear",
        "percent_1rm",
        "rpe_based",
        "pyramid",
        "reverse_pyramid",
        "dup",
        "custom",
      ],
      progression_model: [
        "double_progression",
        "linear_load",
        "rep_targets",
        "percent_1rm",
        "rpe_based",
      ],
      set_type: [
        "normal",
        "warmup",
        "drop",
        "amrap",
        "timed",
        "distance",
        "top_set",
        "backoff",
        "cooldown",
      ],
      sex_type: ["male", "female", "other", "prefer_not_to_say"],
      training_focus: [
        "muscle",
        "strength",
        "general",
        "power",
        "cardio",
        "bodybuilding",
      ],
      warmup_feedback: ["not_enough", "excellent", "too_much"],
      warmup_quality: ["not_enough", "excellent", "too_much"],
      weight_unit: ["kg", "lb"],
    },
  },
} as const
