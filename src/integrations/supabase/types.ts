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
      activity_log: {
        Row: {
          action_level: string
          action_type: string
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          performed_by: string
          title: string
        }
        Insert: {
          action_level?: string
          action_type: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string
          title: string
        }
        Update: {
          action_level?: string
          action_type?: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string
          title?: string
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
      approval_queue: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          draft_content: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          priority: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          draft_content?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          draft_content?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      assessment_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_blocked: boolean
          notes: string | null
          slot_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_blocked?: boolean
          notes?: string | null
          slot_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_blocked?: boolean
          notes?: string | null
          slot_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          category: string
          description: string | null
          enabled: boolean
          id: string
          setting_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          description?: string | null
          enabled?: boolean
          id?: string
          setting_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          enabled?: boolean
          id?: string
          setting_key?: string
          updated_at?: string
          updated_by?: string | null
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
      client_followups: {
        Row: {
          assigned_to: string | null
          client_email: string
          client_name: string
          completed_at: string | null
          created_at: string
          deal_stage: string | null
          deal_value: number | null
          due_date: string
          followup_type: string
          id: string
          inquiry_id: string | null
          job_id: string | null
          notes: string | null
          project_name: string | null
          quote_status: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_email: string
          client_name: string
          completed_at?: string | null
          created_at?: string
          deal_stage?: string | null
          deal_value?: number | null
          due_date: string
          followup_type?: string
          id?: string
          inquiry_id?: string | null
          job_id?: string | null
          notes?: string | null
          project_name?: string | null
          quote_status?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_email?: string
          client_name?: string
          completed_at?: string | null
          created_at?: string
          deal_stage?: string | null
          deal_value?: number | null
          due_date?: string
          followup_type?: string
          id?: string
          inquiry_id?: string | null
          job_id?: string | null
          notes?: string | null
          project_name?: string | null
          quote_status?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_followups_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_followups_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_projects: {
        Row: {
          active: boolean
          build_stage: string
          client_email: string
          client_name: string
          contact_note: string | null
          created_at: string
          id: string
          job_id: string | null
          project_name: string
          property_layout_notes: string | null
          quote_id: string | null
          stage_label: string | null
          system_notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          build_stage?: string
          client_email: string
          client_name: string
          contact_note?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          project_name: string
          property_layout_notes?: string | null
          quote_id?: string | null
          stage_label?: string | null
          system_notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          build_stage?: string
          client_email?: string
          client_name?: string
          contact_note?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          project_name?: string
          property_layout_notes?: string | null
          quote_id?: string | null
          stage_label?: string | null
          system_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_projects_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_projects_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_updates: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          note: string | null
          project_id: string
          update_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          project_id: string
          update_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          project_id?: string
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string
          sort_order: number
          zone_name: string
          zone_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          sort_order?: number
          zone_name: string
          zone_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          zone_name?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_zones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_portal_projects"
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
      equus_ridge_interest: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_type: string
          message: string | null
          name: string
          phone: string | null
          source_page: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_type?: string
          message?: string | null
          name: string
          phone?: string | null
          source_page?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_type?: string
          message?: string | null
          name?: string
          phone?: string | null
          source_page?: string | null
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
      follow_up_drafts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_email: string
          client_name: string
          created_at: string
          deal_value: number | null
          draft_message: string
          entity_id: string
          entity_type: string
          id: string
          project_ref: string | null
          sent_at: string | null
          snoozed_until: string | null
          stage: string
          status: string
          subject_line: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_email: string
          client_name: string
          created_at?: string
          deal_value?: number | null
          draft_message: string
          entity_id: string
          entity_type?: string
          id?: string
          project_ref?: string | null
          sent_at?: string | null
          snoozed_until?: string | null
          stage?: string
          status?: string
          subject_line?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          deal_value?: number | null
          draft_message?: string
          entity_id?: string
          entity_type?: string
          id?: string
          project_ref?: string | null
          sent_at?: string | null
          snoozed_until?: string | null
          stage?: string
          status?: string
          subject_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          attachment_urls: string[] | null
          budget_range: string | null
          created_at: string
          deal_stage: string | null
          deal_value: number | null
          email: string
          expected_value: number | null
          experience_level: string | null
          follow_up_stage: string
          follow_up_status: string
          horse_age: string | null
          horse_breed: string | null
          horse_name: string | null
          id: string
          last_contact_at: string | null
          lead_tags: string[] | null
          lead_tier: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          preferred_service: string | null
          preferred_start: string | null
          probability: number | null
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
          deal_stage?: string | null
          deal_value?: number | null
          email: string
          expected_value?: number | null
          experience_level?: string | null
          follow_up_stage?: string
          follow_up_status?: string
          horse_age?: string | null
          horse_breed?: string | null
          horse_name?: string | null
          id?: string
          last_contact_at?: string | null
          lead_tags?: string[] | null
          lead_tier?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_service?: string | null
          preferred_start?: string | null
          probability?: number | null
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
          deal_stage?: string | null
          deal_value?: number | null
          email?: string
          expected_value?: number | null
          experience_level?: string | null
          follow_up_stage?: string
          follow_up_status?: string
          horse_age?: string | null
          horse_breed?: string | null
          horse_name?: string | null
          id?: string
          last_contact_at?: string | null
          lead_tags?: string[] | null
          lead_tier?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          preferred_service?: string | null
          preferred_start?: string | null
          probability?: number | null
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
      job_cost_entries: {
        Row: {
          category: string
          cost_amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          job_id: string
        }
        Insert: {
          category?: string
          cost_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id: string
        }
        Update: {
          category?: string
          cost_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_cost_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_cost: number
          client_name: string | null
          created_at: string
          estimated_cost: number
          gross_profit: number
          id: string
          job_name: string
          labour_cost: number
          location: string | null
          margin_percentage: number
          materials_cost: number
          notes: string | null
          other_costs: number
          profit_status: string
          revenue: number
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number
          client_name?: string | null
          created_at?: string
          estimated_cost?: number
          gross_profit?: number
          id?: string
          job_name: string
          labour_cost?: number
          location?: string | null
          margin_percentage?: number
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          profit_status?: string
          revenue?: number
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number
          client_name?: string | null
          created_at?: string
          estimated_cost?: number
          gross_profit?: number
          id?: string
          job_name?: string
          labour_cost?: number
          location?: string | null
          margin_percentage?: number
          materials_cost?: number
          notes?: string | null
          other_costs?: number
          profit_status?: string
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
      message_templates: {
        Row: {
          active: boolean
          body: string
          channel: string
          created_at: string
          flow_type: string
          id: string
          step_number: number
          subject: string | null
          template_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          channel?: string
          created_at?: string
          flow_type?: string
          id?: string
          step_number?: number
          subject?: string | null
          template_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          channel?: string
          created_at?: string
          flow_type?: string
          id?: string
          step_number?: number
          subject?: string | null
          template_key?: string
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
      pricing_templates: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          items: Json
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          items?: Json
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          items?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_follow_ups: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          notes: string | null
          quote_id: string
          status: string
        }
        Insert: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          quote_id: string
          status?: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          quote_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_follow_ups_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          line_total: number
          quantity: number
          quote_id: string
          sort_order: number
          title: string
          unit: string
          unit_price: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number
          quantity?: number
          quote_id: string
          sort_order?: number
          title: string
          unit?: string
          unit_price?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number
          quantity?: number
          quote_id?: string
          sort_order?: number
          title?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          accepted_by_email: string | null
          accepted_by_name: string | null
          approved_by: string | null
          client_email: string | null
          client_name: string
          created_at: string
          created_by: string | null
          declined_at: string | null
          exclusions: string | null
          expiry_date: string | null
          gst: number
          id: string
          inquiry_id: string | null
          internal_notes: string | null
          location: string | null
          project_overview: string | null
          project_type: string
          property_name: string | null
          quote_number: string
          scope_summary: string | null
          sent_at: string | null
          share_token: string | null
          site_assessment_id: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_email?: string | null
          accepted_by_name?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          declined_at?: string | null
          exclusions?: string | null
          expiry_date?: string | null
          gst?: number
          id?: string
          inquiry_id?: string | null
          internal_notes?: string | null
          location?: string | null
          project_overview?: string | null
          project_type?: string
          property_name?: string | null
          quote_number: string
          scope_summary?: string | null
          sent_at?: string | null
          share_token?: string | null
          site_assessment_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_email?: string | null
          accepted_by_name?: string | null
          approved_by?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          declined_at?: string | null
          exclusions?: string | null
          expiry_date?: string | null
          gst?: number
          id?: string
          inquiry_id?: string | null
          internal_notes?: string | null
          location?: string | null
          project_overview?: string | null
          project_type?: string
          property_name?: string | null
          quote_number?: string
          scope_summary?: string | null
          sent_at?: string | null
          share_token?: string | null
          site_assessment_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_site_assessment_id_fkey"
            columns: ["site_assessment_id"]
            isOneToOne: false
            referencedRelation: "site_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          assigned_to: string | null
          automation_mode: string
          cancelled_at: string | null
          channel: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          message_body: string | null
          notes: string | null
          original_scheduled_at: string
          paused_at: string | null
          scheduled_at: string
          sent_at: string | null
          skipped_at: string | null
          status: string
          step_number: number
          subject_line: string | null
          template_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          automation_mode?: string
          cancelled_at?: string | null
          channel?: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          entity_id: string
          entity_type?: string
          id?: string
          message_body?: string | null
          notes?: string | null
          original_scheduled_at: string
          paused_at?: string | null
          scheduled_at: string
          sent_at?: string | null
          skipped_at?: string | null
          status?: string
          step_number?: number
          subject_line?: string | null
          template_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          automation_mode?: string
          cancelled_at?: string | null
          channel?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          message_body?: string | null
          notes?: string | null
          original_scheduled_at?: string
          paused_at?: string | null
          scheduled_at?: string
          sent_at?: string | null
          skipped_at?: string | null
          status?: string
          step_number?: number
          subject_line?: string | null
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_assessments: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          inquiry_id: string | null
          location: string
          project_notes: string | null
          project_type: string
          slot_date: string
          slot_id: string | null
          slot_time: string
          status: string
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string | null
          location: string
          project_notes?: string | null
          project_type: string
          slot_date: string
          slot_id?: string | null
          slot_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string | null
          location?: string
          project_notes?: string | null
          project_type?: string
          slot_date?: string
          slot_id?: string | null
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_assessments_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_assessments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "assessment_availability"
            referencedColumns: ["id"]
          },
        ]
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
      website_suggestions: {
        Row: {
          category: string
          created_at: string
          id: string
          issue: string
          priority: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          suggested_fix: string | null
          title: string
          updated_at: string
          why_it_matters: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          issue: string
          priority?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          suggested_fix?: string | null
          title: string
          updated_at?: string
          why_it_matters?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          issue?: string
          priority?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          suggested_fix?: string | null
          title?: string
          updated_at?: string
          why_it_matters?: string | null
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
