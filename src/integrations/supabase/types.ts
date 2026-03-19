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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ab_test_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          test_name: string
          variant: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          test_name: string
          variant: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          test_name?: string
          variant?: string
          visitor_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          content: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          priority: string
          title: string
        }
        Insert: {
          active?: boolean
          content?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          title: string
        }
        Update: {
          active?: boolean
          content?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          assigned_to: string | null
          booking_date: string
          booking_time: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          inquiry_id: string | null
          notes: string | null
          reminder_at: string | null
          reminder_sent: boolean
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_date: string
          booking_time?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          reminder_at?: string | null
          reminder_sent?: boolean
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_date?: string
          booking_time?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          reminder_at?: string | null
          reminder_sent?: boolean
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      cashflow: {
        Row: {
          created_at: string
          deposit_received: number
          final_payment: number
          id: string
          job_id: string
          mid_payment: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_received?: number
          final_payment?: number
          id?: string
          job_id: string
          mid_payment?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_received?: number
          final_payment?: number
          id?: string
          job_id?: string
          mid_payment?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          email: string
          event_id: string
          guests: number
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          guests?: number
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          guests?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          attachment_urls: string[] | null
          budget_range: string | null
          created_at: string
          email: string
          experience_level: string | null
          horse_age: string | null
          horse_breed: string | null
          horse_name: string | null
          id: string
          lead_tags: string[] | null
          lead_tier: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          preferred_service: string | null
          preferred_start: string | null
          project_details: string | null
          project_vision: string | null
          services: string[]
          status: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          budget_range?: string | null
          created_at?: string
          email: string
          experience_level?: string | null
          horse_age?: string | null
          horse_breed?: string | null
          horse_name?: string | null
          id?: string
          lead_tags?: string[] | null
          lead_tier?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_service?: string | null
          preferred_start?: string | null
          project_details?: string | null
          project_vision?: string | null
          services?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          budget_range?: string | null
          created_at?: string
          email?: string
          experience_level?: string | null
          horse_age?: string | null
          horse_breed?: string | null
          horse_name?: string | null
          id?: string
          lead_tags?: string[] | null
          lead_tier?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_service?: string | null
          preferred_start?: string | null
          project_details?: string | null
          project_vision?: string | null
          services?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_nurture: {
        Row: {
          client_email: string
          client_name: string
          completed: boolean
          created_at: string
          id: string
          inquiry_id: string
          next_send_at: string
          step: number
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          completed?: boolean
          created_at?: string
          id?: string
          inquiry_id: string
          next_send_at?: string
          step?: number
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          completed?: boolean
          created_at?: string
          id?: string
          inquiry_id?: string
          next_send_at?: string
          step?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_nurture_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: true
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          client_name: string | null
          created_at: string
          id: string
          job_name: string
          labour_cost: number
          location: string | null
          materials_cost: number
          notes: string | null
          other_costs: number
          revenue: number
          status: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          id?: string
          job_name: string
          labour_cost?: number
          location?: string | null
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          revenue?: number
          status?: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          id?: string
          job_name?: string
          labour_cost?: number
          location?: string | null
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          revenue?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_bookings: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          deposit_amount_cents: number
          experience_level: string
          full_price_cents: number
          horse_name: string | null
          id: string
          lesson_goals: string | null
          payment_status: string
          slot_id: string
          status: string
          stripe_session_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          deposit_amount_cents: number
          experience_level?: string
          full_price_cents: number
          horse_name?: string | null
          id?: string
          lesson_goals?: string | null
          payment_status?: string
          slot_id: string
          status?: string
          stripe_session_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          deposit_amount_cents?: number
          experience_level?: string
          full_price_cents?: number
          horse_name?: string | null
          id?: string
          lesson_goals?: string | null
          payment_status?: string
          slot_id?: string
          status?: string
          stripe_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "lesson_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_slots: {
        Row: {
          created_at: string
          current_bookings: number
          end_time: string
          id: string
          max_bookings: number
          notes: string | null
          slot_date: string
          slot_type: string
          start_time: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bookings?: number
          end_time: string
          id?: string
          max_bookings?: number
          notes?: string | null
          slot_date: string
          slot_type?: string
          start_time: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bookings?: number
          end_time?: string
          id?: string
          max_bookings?: number
          notes?: string | null
          slot_date?: string
          slot_type?: string
          start_time?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      managed_events: {
        Row: {
          active: boolean
          capacity: number | null
          created_at: string
          description: string | null
          early_bird_deadline: string | null
          early_bird_price: string | null
          event_date: string
          event_time: string | null
          id: string
          image_url: string | null
          location: string | null
          price: string | null
          title: string
          trainer: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          capacity?: number | null
          created_at?: string
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_price?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: string | null
          title: string
          trainer?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          capacity?: number | null
          created_at?: string
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_price?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: string | null
          title?: string
          trainer?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      managed_services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          features: string[]
          icon: string | null
          id: string
          image_url: string | null
          short_description: string | null
          slug: string
          sort_order: number
          starting_price: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: string[]
          icon?: string | null
          id?: string
          image_url?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          starting_price?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: string[]
          icon?: string | null
          id?: string
          image_url?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          starting_price?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      managed_testimonials: {
        Row: {
          active: boolean
          client_name: string
          client_role: string | null
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          pinned: boolean
          quote: string
          rating: number
          service_tags: string[]
          sort_order: number
          trainer: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_name: string
          client_role?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          pinned?: boolean
          quote: string
          rating?: number
          service_tags?: string[]
          sort_order?: number
          trainer?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_name?: string
          client_role?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          pinned?: boolean
          quote?: string
          rating?: number
          service_tags?: string[]
          sort_order?: number
          trainer?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mlpgs_interest: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirm_token: string | null
          confirmed: boolean
          created_at: string
          email: string
          id: string
          last_email_sent_at: string | null
          name: string | null
          series_step: number
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirm_token?: string | null
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
          last_email_sent_at?: string | null
          name?: string | null
          series_step?: number
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirm_token?: string | null
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
          last_email_sent_at?: string | null
          name?: string | null
          series_step?: number
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      overheads: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          month: string
          notes: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          id?: string
          month: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
        }
        Relationships: []
      }
      pricing_calculations: {
        Row: {
          calculation_name: string | null
          complexity_multiplier: number
          created_at: string
          id: string
          labour_cost: number
          materials_cost: number
          notes: string | null
          other_costs: number
          target_margin: number
        }
        Insert: {
          calculation_name?: string | null
          complexity_multiplier?: number
          created_at?: string
          id?: string
          labour_cost?: number
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          target_margin?: number
        }
        Update: {
          calculation_name?: string | null
          complexity_multiplier?: number
          created_at?: string
          id?: string
          labour_cost?: number
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          target_margin?: number
        }
        Relationships: []
      }
      slot_holds: {
        Row: {
          expires_at: string
          held_at: string
          id: string
          session_id: string
          slot_id: string
        }
        Insert: {
          expires_at?: string
          held_at?: string
          id?: string
          session_id: string
          slot_id: string
        }
        Update: {
          expires_at?: string
          held_at?: string
          id?: string
          session_id?: string
          slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_holds_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "lesson_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          created_at: string
          document_type: string
          form_data: Json
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          form_data?: Json
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          form_data?: Json
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_holds: { Args: never; Returns: undefined }
      get_event_rsvp_counts: {
        Args: { p_event_id: string }
        Returns: {
          confirmed_guests: number
          event_id: string
          rsvp_count: number
          total_guests: number
          waitlisted_guests: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "employee" | "trainer"
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
      app_role: ["admin", "moderator", "user", "employee", "trainer"],
    },
  },
} as const
