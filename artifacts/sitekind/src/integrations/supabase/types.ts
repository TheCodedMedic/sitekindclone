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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      crm_inbound_emails: {
        Row: {
          from_email: string
          from_name: string | null
          id: string
          lead_id: string | null
          message_id: string | null
          raw: Json | null
          received_at: string
          stripped_reply: string | null
          subject: string | null
          text_body: string | null
        }
        Insert: {
          from_email: string
          from_name?: string | null
          id?: string
          lead_id?: string | null
          message_id?: string | null
          raw?: Json | null
          received_at?: string
          stripped_reply?: string | null
          subject?: string | null
          text_body?: string | null
        }
        Update: {
          from_email?: string
          from_name?: string | null
          id?: string
          lead_id?: string | null
          message_id?: string | null
          raw?: Json | null
          received_at?: string
          stripped_reply?: string | null
          subject?: string | null
          text_body?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_inbound_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_inbound_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          lead_id: string | null
          read_by: string[]
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          lead_id?: string | null
          read_by?: string[]
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          lead_id?: string | null
          read_by?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_design_telemetry: {
        Row: {
          chosen_dna: string | null
          chosen_hero: string | null
          chosen_motif: string | null
          combos_clashed: boolean
          competitor_count: number
          created_at: string
          crowded_dna: string[]
          crowded_motifs: string[]
          density: string | null
          final_distinctness: number | null
          final_hard_fails: number
          first_distinctness: number | null
          first_hard_fails: number
          id: string
          lead_id: string | null
          lockout_pass: boolean
          min_structural_distance: number | null
          novelty_passed: number
          owner_id: string | null
          recent_combos_checked: number
          retried: boolean
          threshold_used: number | null
          tournament_size: number
          trace_id: string | null
          used_fallback: boolean
          vertical: string | null
          winner_axis: string | null
          winner_thesis: string | null
        }
        Insert: {
          chosen_dna?: string | null
          chosen_hero?: string | null
          chosen_motif?: string | null
          combos_clashed?: boolean
          competitor_count?: number
          created_at?: string
          crowded_dna?: string[]
          crowded_motifs?: string[]
          density?: string | null
          final_distinctness?: number | null
          final_hard_fails?: number
          first_distinctness?: number | null
          first_hard_fails?: number
          id?: string
          lead_id?: string | null
          lockout_pass?: boolean
          min_structural_distance?: number | null
          novelty_passed?: number
          owner_id?: string | null
          recent_combos_checked?: number
          retried?: boolean
          threshold_used?: number | null
          tournament_size?: number
          trace_id?: string | null
          used_fallback?: boolean
          vertical?: string | null
          winner_axis?: string | null
          winner_thesis?: string | null
        }
        Update: {
          chosen_dna?: string | null
          chosen_hero?: string | null
          chosen_motif?: string | null
          combos_clashed?: boolean
          competitor_count?: number
          created_at?: string
          crowded_dna?: string[]
          crowded_motifs?: string[]
          density?: string | null
          final_distinctness?: number | null
          final_hard_fails?: number
          first_distinctness?: number | null
          first_hard_fails?: number
          id?: string
          lead_id?: string | null
          lockout_pass?: boolean
          min_structural_distance?: number | null
          novelty_passed?: number
          owner_id?: string | null
          recent_combos_checked?: number
          retried?: boolean
          threshold_used?: number | null
          tournament_size?: number
          trace_id?: string | null
          used_fallback?: boolean
          vertical?: string | null
          winner_axis?: string | null
          winner_thesis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_design_telemetry_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_design_telemetry_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_generation_runs: {
        Row: {
          attempt_index: number
          attempt_label: string
          business_name_intake: string | null
          created_at: string
          domain: string | null
          elapsed_ms: number | null
          final_business_name: string | null
          final_business_name_source: string | null
          id: string
          lead_id: string | null
          max_tokens: number | null
          model: string | null
          parse_error: string | null
          parse_ok: boolean
          prompt_length: number | null
          raw_note_cap: number | null
          raw_preview: string | null
          raw_preview_cap: number | null
          response_text_length: number | null
          saved_status: string
          stop_reason: string | null
          trace_id: string
        }
        Insert: {
          attempt_index: number
          attempt_label: string
          business_name_intake?: string | null
          created_at?: string
          domain?: string | null
          elapsed_ms?: number | null
          final_business_name?: string | null
          final_business_name_source?: string | null
          id?: string
          lead_id?: string | null
          max_tokens?: number | null
          model?: string | null
          parse_error?: string | null
          parse_ok: boolean
          prompt_length?: number | null
          raw_note_cap?: number | null
          raw_preview?: string | null
          raw_preview_cap?: number | null
          response_text_length?: number | null
          saved_status: string
          stop_reason?: string | null
          trace_id: string
        }
        Update: {
          attempt_index?: number
          attempt_label?: string
          business_name_intake?: string | null
          created_at?: string
          domain?: string | null
          elapsed_ms?: number | null
          final_business_name?: string | null
          final_business_name_source?: string | null
          id?: string
          lead_id?: string | null
          max_tokens?: number | null
          model?: string | null
          parse_error?: string | null
          parse_ok?: boolean
          prompt_length?: number | null
          raw_note_cap?: number | null
          raw_preview?: string | null
          raw_preview_cap?: number | null
          response_text_length?: number | null
          saved_status?: string
          stop_reason?: string | null
          trace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_generation_runs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_generation_runs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_leads: {
        Row: {
          captcha_verified: boolean
          contact: Json | null
          created_at: string
          design_schema: Json | null
          design_schema_computed_at: string | null
          domains: Json | null
          flow: string
          id: string
          intake: Json
          lost_reason: string | null
          next_follow_up_at: string | null
          owner_id: string | null
          priority: string
          profile: Json | null
          report: Json | null
          research: Json | null
          status: Database["public"]["Enums"]["crm_lead_status"]
          updated_at: string
        }
        Insert: {
          captcha_verified?: boolean
          contact?: Json | null
          created_at?: string
          design_schema?: Json | null
          design_schema_computed_at?: string | null
          domains?: Json | null
          flow: string
          id?: string
          intake: Json
          lost_reason?: string | null
          next_follow_up_at?: string | null
          owner_id?: string | null
          priority?: string
          profile?: Json | null
          report?: Json | null
          research?: Json | null
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
        }
        Update: {
          captcha_verified?: boolean
          contact?: Json | null
          created_at?: string
          design_schema?: Json | null
          design_schema_computed_at?: string | null
          domains?: Json | null
          flow?: string
          id?: string
          intake?: Json
          lost_reason?: string | null
          next_follow_up_at?: string | null
          owner_id?: string | null
          priority?: string
          profile?: Json | null
          report?: Json | null
          research?: Json | null
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      design_alert_state: {
        Row: {
          last_alerted_at: string | null
          last_rate: number | null
          last_window_end: string | null
          updated_at: string
          vertical: string
        }
        Insert: {
          last_alerted_at?: string | null
          last_rate?: number | null
          last_window_end?: string | null
          updated_at?: string
          vertical: string
        }
        Update: {
          last_alerted_at?: string | null
          last_rate?: number | null
          last_window_end?: string | null
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      design_fingerprints: {
        Row: {
          created_at: string
          exact_hash: string
          id: string
          lead_id: string | null
          structural: Json
          stylistic: Json
          used_fallback: boolean
          vertical: string
        }
        Insert: {
          created_at?: string
          exact_hash?: string
          id?: string
          lead_id?: string | null
          structural?: Json
          stylistic?: Json
          used_fallback?: boolean
          vertical?: string
        }
        Update: {
          created_at?: string
          exact_hash?: string
          id?: string
          lead_id?: string | null
          structural?: Json
          stylistic?: Json
          used_fallback?: boolean
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_fingerprints_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_fingerprints_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      design_tuning_state: {
        Row: {
          current_value: number
          key: string
          rationale: string | null
          sample_size: number | null
          suggested_value: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          current_value: number
          key: string
          rationale?: string | null
          sample_size?: number | null
          suggested_value?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          current_value?: number
          key?: string
          rationale?: string | null
          sample_size?: number | null
          suggested_value?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: Json | null
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_lead_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "demo_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          display_name: string
          email: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          is_active?: boolean
          user_id?: string
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
      crm_lead_list: {
        Row: {
          business_name: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          flow: string | null
          has_contact: boolean | null
          has_report: boolean | null
          id: string | null
          lost_reason: string | null
          next_follow_up_at: string | null
          owner_id: string | null
          priority: string | null
          state: string | null
          status: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at: string | null
          vertical: string | null
        }
        Insert: {
          business_name?: never
          city?: never
          contact_email?: never
          contact_name?: never
          created_at?: string | null
          flow?: string | null
          has_contact?: never
          has_report?: never
          id?: string | null
          lost_reason?: string | null
          next_follow_up_at?: string | null
          owner_id?: string | null
          priority?: string | null
          state?: never
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          vertical?: never
        }
        Update: {
          business_name?: never
          city?: never
          contact_email?: never
          contact_name?: never
          created_at?: string | null
          flow?: string | null
          has_contact?: never
          has_report?: never
          id?: string | null
          lost_reason?: string | null
          next_follow_up_at?: string | null
          owner_id?: string | null
          priority?: string | null
          state?: never
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          vertical?: never
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      crm_lead_status:
        | "new"
        | "report_viewed"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "won"
        | "lost"
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
      app_role: ["admin", "user"],
      crm_lead_status: [
        "new",
        "report_viewed",
        "contacted",
        "qualified",
        "proposal_sent",
        "won",
        "lost",
      ],
    },
  },
} as const
