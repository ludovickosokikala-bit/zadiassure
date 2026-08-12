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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      form_submissions: {
        Row: {
          answers: Json
          audience: string
          created_at: string
          email: string
          full_name: string
          id: string
          language: string
          message: string
          phone: string
          status: string
          template_id: string | null
          template_slug: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          audience?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          language?: string
          message?: string
          phone?: string
          status?: string
          template_id?: string | null
          template_slug?: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          audience?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          message?: string
          phone?: string
          status?: string
          template_id?: string | null
          template_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          audiences: string[]
          authority: string
          checklist: Json
          created_at: string
          description_en: string
          description_fr: string
          description_nl: string
          id: string
          official_label: string | null
          official_url: string | null
          published: boolean
          slug: string
          sort_order: number
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at: string
          who_en: string
          who_fr: string
          who_nl: string
        }
        Insert: {
          audiences?: string[]
          authority?: string
          checklist?: Json
          created_at?: string
          description_en: string
          description_fr: string
          description_nl: string
          id?: string
          official_label?: string | null
          official_url?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at?: string
          who_en?: string
          who_fr?: string
          who_nl?: string
        }
        Update: {
          audiences?: string[]
          authority?: string
          checklist?: Json
          created_at?: string
          description_en?: string
          description_fr?: string
          description_nl?: string
          id?: string
          official_label?: string | null
          official_url?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          theme?: Database["public"]["Enums"]["content_theme"]
          title_en?: string
          title_fr?: string
          title_nl?: string
          updated_at?: string
          who_en?: string
          who_fr?: string
          who_nl?: string
        }
        Relationships: []
      }
      legislation_updates: {
        Row: {
          action_en: string
          action_fr: string
          action_nl: string
          audiences: string[]
          changes_en: string
          changes_fr: string
          changes_nl: string
          created_at: string
          effective_date: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          source_label: string | null
          source_url: string | null
          summary_en: string
          summary_fr: string
          summary_nl: string
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at: string
        }
        Insert: {
          action_en?: string
          action_fr?: string
          action_nl?: string
          audiences?: string[]
          changes_en?: string
          changes_fr?: string
          changes_nl?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          source_label?: string | null
          source_url?: string | null
          summary_en: string
          summary_fr: string
          summary_nl: string
          theme: Database["public"]["Enums"]["content_theme"]
          title_en: string
          title_fr: string
          title_nl: string
          updated_at?: string
        }
        Update: {
          action_en?: string
          action_fr?: string
          action_nl?: string
          audiences?: string[]
          changes_en?: string
          changes_fr?: string
          changes_nl?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          source_label?: string | null
          source_url?: string | null
          summary_en?: string
          summary_fr?: string
          summary_nl?: string
          theme?: Database["public"]["Enums"]["content_theme"]
          title_en?: string
          title_fr?: string
          title_nl?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      content_theme: "immigration" | "budget" | "business" | "social"
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
      app_role: ["admin", "editor", "user"],
      content_theme: ["immigration", "budget", "business", "social"],
    },
  },
} as const
