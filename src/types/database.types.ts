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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_images: {
        Row: {
          car_id: string
          created_at: string
          id: string
          is_primary: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          archived_at: string | null
          body_type: string | null
          city: string
          colour: string | null
          created_at: string
          description: string
          doors: number | null
          engine_size: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          is_featured: boolean
          is_verified: boolean
          make: string
          mileage: number
          model: string
          moderated_at: string | null
          moderated_by: string | null
          mot_expiry: string | null
          owners_count: number | null
          postcode: string
          price: number
          published_at: string | null
          registration: string | null
          registration_city: string | null
          rejection_reason: string | null
          seats: number | null
          seller_id: string
          service_history: string | null
          sold_at: string | null
          status: Database["public"]["Enums"]["listing_status"]
          submitted_at: string | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          ulez_compliant: boolean | null
          updated_at: string
          variant: string | null
          verified_at: string | null
          verified_verification_request_id: string | null
          year: number
        }
        Insert: {
          archived_at?: string | null
          body_type?: string | null
          city: string
          colour?: string | null
          created_at?: string
          description: string
          doors?: number | null
          engine_size?: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          make: string
          mileage: number
          model: string
          moderated_at?: string | null
          moderated_by?: string | null
          mot_expiry?: string | null
          owners_count?: number | null
          postcode: string
          price: number
          published_at?: string | null
          registration?: string | null
          registration_city?: string | null
          rejection_reason?: string | null
          seats?: number | null
          seller_id: string
          service_history?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          ulez_compliant?: boolean | null
          updated_at?: string
          variant?: string | null
          verified_at?: string | null
          verified_verification_request_id?: string | null
          year: number
        }
        Update: {
          archived_at?: string | null
          body_type?: string | null
          city?: string
          colour?: string | null
          created_at?: string
          description?: string
          doors?: number | null
          engine_size?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          make?: string
          mileage?: number
          model?: string
          moderated_at?: string | null
          moderated_by?: string | null
          mot_expiry?: string | null
          owners_count?: number | null
          postcode?: string
          price?: number
          published_at?: string | null
          registration?: string | null
          registration_city?: string | null
          rejection_reason?: string | null
          seats?: number | null
          seller_id?: string
          service_history?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"]
          ulez_compliant?: boolean | null
          updated_at?: string
          variant?: string | null
          verified_at?: string | null
          verified_verification_request_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_verified_verification_request_id_fkey"
            columns: ["verified_verification_request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          service_booking_id: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
          verification_request_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          service_booking_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          verification_request_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          service_booking_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          verification_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_service_booking_id_fkey"
            columns: ["service_booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_verification_request_id_fkey"
            columns: ["verification_request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_report_images: {
        Row: {
          caption: string | null
          created_at: string
          evidence_expires_at: string | null
          id: string
          inspection_report_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          evidence_expires_at?: string | null
          id?: string
          inspection_report_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          evidence_expires_at?: string | null
          id?: string
          inspection_report_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_report_images_inspection_report_id_fkey"
            columns: ["inspection_report_id"]
            isOneToOne: false
            referencedRelation: "inspection_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_reports: {
        Row: {
          additional_checks: Json
          body_condition: Database["public"]["Enums"]["condition_rating"]
          brakes_condition: Database["public"]["Enums"]["condition_rating"]
          created_at: string
          engine_condition: Database["public"]["Enums"]["condition_rating"]
          id: string
          inspector_id: string | null
          inspector_notes: string | null
          interior_condition: Database["public"]["Enums"]["condition_rating"]
          mileage_checked: boolean
          overall_result:
            | Database["public"]["Enums"]["inspection_result"]
            | null
          registration_checked: boolean
          submitted_at: string | null
          summary: string | null
          tyre_condition: Database["public"]["Enums"]["condition_rating"]
          updated_at: string
          verification_request_id: string
        }
        Insert: {
          additional_checks?: Json
          body_condition?: Database["public"]["Enums"]["condition_rating"]
          brakes_condition?: Database["public"]["Enums"]["condition_rating"]
          created_at?: string
          engine_condition?: Database["public"]["Enums"]["condition_rating"]
          id?: string
          inspector_id?: string | null
          inspector_notes?: string | null
          interior_condition?: Database["public"]["Enums"]["condition_rating"]
          mileage_checked?: boolean
          overall_result?:
            | Database["public"]["Enums"]["inspection_result"]
            | null
          registration_checked?: boolean
          submitted_at?: string | null
          summary?: string | null
          tyre_condition?: Database["public"]["Enums"]["condition_rating"]
          updated_at?: string
          verification_request_id: string
        }
        Update: {
          additional_checks?: Json
          body_condition?: Database["public"]["Enums"]["condition_rating"]
          brakes_condition?: Database["public"]["Enums"]["condition_rating"]
          created_at?: string
          engine_condition?: Database["public"]["Enums"]["condition_rating"]
          id?: string
          inspector_id?: string | null
          inspector_notes?: string | null
          interior_condition?: Database["public"]["Enums"]["condition_rating"]
          mileage_checked?: boolean
          overall_result?:
            | Database["public"]["Enums"]["inspection_result"]
            | null
          registration_checked?: boolean
          submitted_at?: string | null
          summary?: string | null
          tyre_condition?: Database["public"]["Enums"]["condition_rating"]
          updated_at?: string
          verification_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_verification_request_id_fkey"
            columns: ["verification_request_id"]
            isOneToOne: true
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference: string | null
          service_booking_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
          verification_request_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          service_booking_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
          verification_request_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          service_booking_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
          verification_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_booking_id_fkey"
            columns: ["service_booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verification_request_id_fkey"
            columns: ["verification_request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          car_make: string
          car_model: string
          car_registration: string | null
          city: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          on_the_way_at: string | null
          postcode: string
          preferred_date: string
          preferred_time: string
          quoted_price: number | null
          service_type_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["service_booking_status"]
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          car_make: string
          car_model: string
          car_registration?: string | null
          city: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          on_the_way_at?: string | null
          postcode: string
          preferred_date: string
          preferred_time: string
          quoted_price?: number | null
          service_type_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["service_booking_status"]
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          car_make?: string
          car_model?: string
          car_registration?: string | null
          city?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          on_the_way_at?: string | null
          postcode?: string
          preferred_date?: string
          preferred_time?: string
          quoted_price?: number | null
          service_type_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["service_booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          base_price: number
          created_at: string
          description: string
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          description: string
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          car_id: string | null
          city: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          external_make: string | null
          external_model: string | null
          external_year: number | null
          id: string
          inspection_address: string
          inspection_started_at: string | null
          notes: string | null
          postcode: string
          preferred_date: string | null
          preferred_time: string | null
          report_submitted_at: string | null
          requested_by: string
          scheduled_for: string | null
          seller_name: string
          seller_phone: string
          status: Database["public"]["Enums"]["verification_request_status"]
          updated_at: string
          vehicle_registration: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          car_id?: string | null
          city: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          external_make?: string | null
          external_model?: string | null
          external_year?: number | null
          id?: string
          inspection_address: string
          inspection_started_at?: string | null
          notes?: string | null
          postcode: string
          preferred_date?: string | null
          preferred_time?: string | null
          report_submitted_at?: string | null
          requested_by: string
          scheduled_for?: string | null
          seller_name: string
          seller_phone: string
          status?: Database["public"]["Enums"]["verification_request_status"]
          updated_at?: string
          vehicle_registration: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          car_id?: string | null
          city?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          external_make?: string | null
          external_model?: string | null
          external_year?: number | null
          id?: string
          inspection_address?: string
          inspection_started_at?: string | null
          notes?: string | null
          postcode?: string
          preferred_date?: string | null
          preferred_time?: string | null
          report_submitted_at?: string | null
          requested_by?: string
          scheduled_for?: string | null
          seller_name?: string
          seller_phone?: string
          status?: Database["public"]["Enums"]["verification_request_status"]
          updated_at?: string
          vehicle_registration?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_service_booking: {
        Args: {
          p_booking_id: string
          p_target: Database["public"]["Enums"]["service_booking_status"]
        }
        Returns: undefined
      }
      assign_service_worker: {
        Args: { p_booking_id: string; p_worker_id: string }
        Returns: undefined
      }
      assign_verification_inspector: {
        Args: { p_id: string; p_inspector: string }
        Returns: undefined
      }
      cancel_own_service_booking: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: undefined
      }
      cancel_own_verification_request: {
        Args: { p_id: string; p_reason?: string }
        Returns: undefined
      }
      cancel_service_booking_as_admin: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: undefined
      }
      confirm_service_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      confirm_verification_request: {
        Args: { p_id: string }
        Returns: undefined
      }
      create_service_booking: {
        Args: {
          p_address_line_1: string
          p_address_line_2: string
          p_car_make: string
          p_car_model: string
          p_car_registration: string
          p_city: string
          p_notes?: string
          p_postcode: string
          p_preferred_date: string
          p_preferred_time: string
          p_service_type_id: string
        }
        Returns: string
      }
      create_verification_request: {
        Args: {
          p_address: string
          p_car_id: string
          p_city: string
          p_make: string
          p_model: string
          p_notes?: string
          p_postcode: string
          p_preferred_date: string
          p_preferred_time: string
          p_registration: string
          p_seller_name: string
          p_seller_phone: string
          p_year: number
        }
        Returns: string
      }
      finalise_verification: { Args: { p_id: string }; Returns: undefined }
      get_assigned_service_customer_contact: {
        Args: { p_booking_id: string }
        Returns: {
          full_name: string
          phone: string
        }[]
      }
      mark_car_sold: { Args: { p_car_id: string }; Returns: undefined }
      moderate_car: {
        Args: {
          p_approved: boolean
          p_car_id: string
          p_rejection_reason?: string
        }
        Returns: undefined
      }
      move_car_image: {
        Args: { p_direction: string; p_image_id: string }
        Returns: undefined
      }
      reveal_seller_contact: {
        Args: { p_car_id: string }
        Returns: {
          full_name: string
          phone: string
        }[]
      }
      save_inspection_report: {
        Args: {
          p_body: Database["public"]["Enums"]["condition_rating"]
          p_brakes: Database["public"]["Enums"]["condition_rating"]
          p_engine: Database["public"]["Enums"]["condition_rating"]
          p_interior: Database["public"]["Enums"]["condition_rating"]
          p_mileage_checked: boolean
          p_notes: string
          p_registration_checked: boolean
          p_request_id: string
          p_result: Database["public"]["Enums"]["inspection_result"]
          p_summary: string
          p_tyres: Database["public"]["Enums"]["condition_rating"]
        }
        Returns: string
      }
      schedule_verification_inspection: {
        Args: { p_id: string; p_scheduled_for: string }
        Returns: undefined
      }
      set_car_featured: {
        Args: { p_car_id: string; p_featured: boolean }
        Returns: undefined
      }
      set_primary_car_image: {
        Args: { p_image_id: string }
        Returns: undefined
      }
      set_staff_role: {
        Args: { p_make_inspector: boolean; p_user_id: string }
        Returns: undefined
      }
      start_verification_inspection: {
        Args: { p_id: string }
        Returns: undefined
      }
      submit_car_for_review: { Args: { p_car_id: string }; Returns: undefined }
      submit_inspection_report: {
        Args: { p_request_id: string }
        Returns: undefined
      }
    }
    Enums: {
      assignment_status:
        | "assigned"
        | "accepted"
        | "declined"
        | "in_progress"
        | "completed"
        | "cancelled"
      condition_rating: "excellent" | "good" | "fair" | "poor" | "not_checked"
      fuel_type:
        | "petrol"
        | "diesel"
        | "hybrid"
        | "plug_in_hybrid"
        | "electric"
        | "other"
      inspection_result:
        | "passed"
        | "passed_with_advisories"
        | "attention_required"
        | "not_suitable"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "rejected"
        | "sold"
        | "archived"
      notification_type:
        | "listing"
        | "service_booking"
        | "verification"
        | "inspection_report"
        | "payment"
        | "system"
      payment_provider: "manual" | "stripe" | "other"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      profile_role: "customer" | "inspector" | "admin"
      service_booking_status:
        | "pending"
        | "confirmed"
        | "assigned"
        | "on_the_way"
        | "in_progress"
        | "completed"
        | "cancelled"
      transmission_type: "manual" | "automatic" | "semi_automatic" | "other"
      verification_request_status:
        | "pending"
        | "confirmed"
        | "assigned"
        | "inspection_scheduled"
        | "inspection_in_progress"
        | "report_submitted"
        | "completed"
        | "cancelled"
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
      assignment_status: [
        "assigned",
        "accepted",
        "declined",
        "in_progress",
        "completed",
        "cancelled",
      ],
      condition_rating: ["excellent", "good", "fair", "poor", "not_checked"],
      fuel_type: [
        "petrol",
        "diesel",
        "hybrid",
        "plug_in_hybrid",
        "electric",
        "other",
      ],
      inspection_result: [
        "passed",
        "passed_with_advisories",
        "attention_required",
        "not_suitable",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "rejected",
        "sold",
        "archived",
      ],
      notification_type: [
        "listing",
        "service_booking",
        "verification",
        "inspection_report",
        "payment",
        "system",
      ],
      payment_provider: ["manual", "stripe", "other"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      profile_role: ["customer", "inspector", "admin"],
      service_booking_status: [
        "pending",
        "confirmed",
        "assigned",
        "on_the_way",
        "in_progress",
        "completed",
        "cancelled",
      ],
      transmission_type: ["manual", "automatic", "semi_automatic", "other"],
      verification_request_status: [
        "pending",
        "confirmed",
        "assigned",
        "inspection_scheduled",
        "inspection_in_progress",
        "report_submitted",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
