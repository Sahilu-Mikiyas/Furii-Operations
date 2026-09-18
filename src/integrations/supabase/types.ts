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
      book_database: {
        Row: {
          author: string
          created_at: string
          id: string
          key_takeaways: string | null
          rating: number
          reading_progress: number
          summary_notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: string
          key_takeaways?: string | null
          rating?: number
          reading_progress?: number
          summary_notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          key_takeaways?: string | null
          rating?: number
          reading_progress?: number
          summary_notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      day_tasks: {
        Row: {
          created_at: string
          day_id: string
          done: boolean
          id: string
          label: string
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_id: string
          done?: boolean
          id?: string
          label: string
          position?: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_id?: string
          done?: boolean
          id?: string
          label?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_tasks_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
        ]
      }
      days: {
        Row: {
          closed: boolean
          created_at: string
          day_date: string
          id: string
          identity_id: string | null
          key_objective_done: boolean
          objective: string
          output_note: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed?: boolean
          created_at?: string
          day_date: string
          id?: string
          identity_id?: string | null
          key_objective_done?: boolean
          objective?: string
          output_note?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed?: boolean
          created_at?: string
          day_date?: string
          id?: string
          identity_id?: string | null
          key_objective_done?: boolean
          objective?: string
          output_note?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "days_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_contributions: {
        Row: {
          amount: number
          bucket_id: string | null
          bucket_key: string | null
          contributed_on: string
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          bucket_id?: string | null
          bucket_key?: string | null
          contributed_on?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bucket_id?: string | null
          bucket_key?: string | null
          contributed_on?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_contributions_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "money_buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          categories: string[]
          completion_criteria: string
          created_at: string
          description: string
          emoji: string
          id: string
          kpis: string[]
          loop: string[]
          mission: string
          name: string
          updated_at: string
          user_id: string
          weekday: number
        }
        Insert: {
          categories?: string[]
          completion_criteria?: string
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          kpis?: string[]
          loop?: string[]
          mission?: string
          name: string
          updated_at?: string
          user_id: string
          weekday: number
        }
        Update: {
          categories?: string[]
          completion_criteria?: string
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          kpis?: string[]
          loop?: string[]
          mission?: string
          name?: string
          updated_at?: string
          user_id?: string
          weekday?: number
        }
        Relationships: []
      }
      marriage_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          saved_amount: number
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          saved_amount?: number
          target_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          saved_amount?: number
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_settings: {
        Row: {
          created_at: string
          deep_work_target_hours: number
          departure_date: string
          destination: string
          tagline: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deep_work_target_hours?: number
          departure_date?: string
          destination?: string
          tagline?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deep_work_target_hours?: number
          departure_date?: string
          destination?: string
          tagline?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      money_buckets: {
        Row: {
          created_at: string
          currency: string
          current_amount: number
          emoji: string
          id: string
          key: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_amount?: number
          emoji?: string
          id?: string
          key: string
          target_amount?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_amount?: number
          emoji?: string
          id?: string
          key?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parked_ideas: {
        Row: {
          created_at: string
          id: string
          note: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pillars: {
        Row: {
          created_at: string
          current_value: number
          emoji: string
          id: string
          key: string
          label: string
          sort_order: number
          stretch_value: number | null
          sublabel: string | null
          target_value: number
          unit: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          current_value?: number
          emoji?: string
          id?: string
          key: string
          label: string
          sort_order?: number
          stretch_value?: number | null
          sublabel?: string | null
          target_value?: number
          unit?: string
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          current_value?: number
          emoji?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number
          stretch_value?: number | null
          sublabel?: string | null
          target_value?: number
          unit?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      relationship_milestones: {
        Row: {
          created_at: string
          financial_gate: string | null
          id: string
          position: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          financial_gate?: string | null
          id?: string
          position?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          financial_gate?: string | null
          id?: string
          position?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relocation_fund_items: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          due_month: string | null
          funded: boolean
          id: string
          label: string
          note: string | null
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          due_month?: string | null
          funded?: boolean
          id?: string
          label: string
          note?: string | null
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          due_month?: string | null
          funded?: boolean
          id?: string
          label?: string
          note?: string | null
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      software_deals: {
        Row: {
          amount_collected: number
          company: string
          contact: string
          created_at: string
          deadline: string | null
          deal_value: number
          id: string
          next_action: string | null
          payment_status: string
          probability: number
          service: string
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_collected?: number
          company: string
          contact?: string
          created_at?: string
          deadline?: string | null
          deal_value?: number
          id?: string
          next_action?: string | null
          payment_status?: string
          probability?: number
          service?: string
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_collected?: number
          company?: string
          contact?: string
          created_at?: string
          deadline?: string | null
          deal_value?: number
          id?: string
          next_action?: string | null
          payment_status?: string
          probability?: number
          service?: string
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      software_outreach: {
        Row: {
          company: string
          contact: string
          created_at: string
          date_contacted: string
          email: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          phone: string | null
          platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          contact?: string
          created_at?: string
          date_contacted?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          contact?: string
          created_at?: string
          date_contacted?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      software_projects: {
        Row: {
          client: string
          created_at: string
          deadline: string | null
          demo_url: string | null
          features: string[]
          id: string
          requirements: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string
          created_at?: string
          deadline?: string | null
          demo_url?: string | null
          features?: string[]
          id?: string
          requirements?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string
          created_at?: string
          deadline?: string | null
          demo_url?: string | null
          features?: string[]
          id?: string
          requirements?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      software_promo: {
        Row: {
          asset_type: string
          created_at: string
          description: string | null
          id: string
          link: string | null
          product_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          product_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          product_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          created_at: string
          day_id: string
          ended_at: string | null
          id: string
          label: string
          result_note: string
          running: boolean
          seconds: number
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_id: string
          ended_at?: string | null
          id?: string
          label?: string
          result_note?: string
          running?: boolean
          seconds?: number
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_id?: string
          ended_at?: string | null
          id?: string
          label?: string
          result_note?: string
          running?: boolean
          seconds?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_channels: {
        Row: {
          created_at: string
          emoji: string
          id: string
          key: string
          monetized: boolean
          monthly_revenue: number
          name: string
          subscribers: number
          target_revenue: number
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          key: string
          monetized?: boolean
          monthly_revenue?: number
          name: string
          subscribers?: number
          target_revenue?: number
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          key?: string
          monetized?: boolean
          monthly_revenue?: number
          name?: string
          subscribers?: number
          target_revenue?: number
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_key: string
          created_at: string
          ctr: number
          doc_day1_done: boolean
          doc_day2_done: boolean
          financial_claims: string | null
          id: string
          market_data: string | null
          revenue: number
          rpm: number
          scheduled_date: string | null
          script_content: string | null
          stage: string
          thumbnail_url: string | null
          title: string
          topic: string | null
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          channel_key: string
          created_at?: string
          ctr?: number
          doc_day1_done?: boolean
          doc_day2_done?: boolean
          financial_claims?: string | null
          id?: string
          market_data?: string | null
          revenue?: number
          rpm?: number
          scheduled_date?: string | null
          script_content?: string | null
          stage?: string
          thumbnail_url?: string | null
          title: string
          topic?: string | null
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          channel_key?: string
          created_at?: string
          ctr?: number
          doc_day1_done?: boolean
          doc_day2_done?: boolean
          financial_claims?: string | null
          id?: string
          market_data?: string | null
          revenue?: number
          rpm?: number
          scheduled_date?: string | null
          script_content?: string | null
          stage?: string
          thumbnail_url?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_mission: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
