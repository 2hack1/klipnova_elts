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
      assigned_locations: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          notes: string | null
          owner_user_id: string | null
          radius_meter: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          notes?: string | null
          owner_user_id?: string | null
          radius_meter?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string | null
          owner_user_id?: string | null
          radius_meter?: number
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          punch_in_at: string | null
          punch_in_lat: number | null
          punch_in_lng: number | null
          punch_out_at: string | null
          punch_out_lat: number | null
          punch_out_lng: number | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          punch_in_at?: string | null
          punch_in_lat?: number | null
          punch_in_lng?: number | null
          punch_out_at?: string | null
          punch_out_lat?: number | null
          punch_out_lng?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          punch_in_at?: string | null
          punch_in_lat?: number | null
          punch_in_lng?: number | null
          punch_out_at?: string | null
          punch_out_lat?: number | null
          punch_out_lng?: number | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_travel_summary: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          last_sync_time: string
          summary_date: string
          total_duration_seconds: number | null
          total_km: number | null
          total_sessions: number | null
          total_visits: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          last_sync_time?: string
          summary_date?: string
          total_duration_seconds?: number | null
          total_km?: number | null
          total_sessions?: number | null
          total_visits?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          last_sync_time?: string
          summary_date?: string
          total_duration_seconds?: number | null
          total_km?: number | null
          total_sessions?: number | null
          total_visits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_travel_summary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assignments: {
        Row: {
          assigned_date: string
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          location_id: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          location_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "assigned_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          created_by_admin: string | null
          department: string | null
          designation: string | null
          employee_code: string
          hire_date: string
          id: string
          manager_id: string | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by_admin?: string | null
          department?: string | null
          designation?: string | null
          employee_code: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by_admin?: string | null
          department?: string | null
          designation?: string | null
          employee_code?: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      location_logs: {
        Row: {
          accuracy: number | null
          employee_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          speed: number | null
          travel_session_id: string
        }
        Insert: {
          accuracy?: number | null
          employee_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          speed?: number | null
          travel_session_id: string
        }
        Update: {
          accuracy?: number | null
          employee_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed?: number | null
          travel_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_logs_travel_session_id_fkey"
            columns: ["travel_session_id"]
            isOneToOne: false
            referencedRelation: "travel_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      travel_sessions: {
        Row: {
          attendance_id: string | null
          created_at: string
          duration_seconds: number | null
          employee_id: string
          end_lat: number | null
          end_lng: number | null
          ended_at: string | null
          id: string
          start_lat: number | null
          start_lng: number | null
          started_at: string
          status: Database["public"]["Enums"]["travel_status"]
          total_km: number | null
          updated_at: string
        }
        Insert: {
          attendance_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          employee_id: string
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          start_lat?: number | null
          start_lng?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["travel_status"]
          total_km?: number | null
          updated_at?: string
        }
        Update: {
          attendance_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          employee_id?: string
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          start_lat?: number | null
          start_lng?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["travel_status"]
          total_km?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_sessions_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      visit_history: {
        Row: {
          distance_meter: number | null
          employee_id: string
          id: string
          location_id: string
          notes: string | null
          travel_session_id: string | null
          visit_latitude: number | null
          visit_longitude: number | null
          visited_at: string
        }
        Insert: {
          distance_meter?: number | null
          employee_id: string
          id?: string
          location_id: string
          notes?: string | null
          travel_session_id?: string | null
          visit_latitude?: number | null
          visit_longitude?: number | null
          visited_at?: string
        }
        Update: {
          distance_meter?: number | null
          employee_id?: string
          id?: string
          location_id?: string
          notes?: string | null
          travel_session_id?: string | null
          visit_latitude?: number | null
          visit_longitude?: number | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_history_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "assigned_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_history_travel_session_id_fkey"
            columns: ["travel_session_id"]
            isOneToOne: false
            referencedRelation: "travel_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email_exists: { Args: { _email: string }; Returns: boolean }
      employee_owner_admin: {
        Args: { _employee_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "employee" | "super_admin"
      attendance_status: "present" | "absent" | "on_leave" | "half_day"
      employee_status: "active" | "inactive" | "suspended"
      travel_status: "active" | "completed" | "cancelled"
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
      app_role: ["admin", "employee", "super_admin"],
      attendance_status: ["present", "absent", "on_leave", "half_day"],
      employee_status: ["active", "inactive", "suspended"],
      travel_status: ["active", "completed", "cancelled"],
    },
  },
} as const
