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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abc_configurations: {
        Row: {
          class_a_threshold: number
          class_b_threshold: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_a_threshold?: number
          class_b_threshold?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_a_threshold?: number
          class_b_threshold?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_history: {
        Row: {
          created_at: string
          id: string
          item_count: number
          results: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_count: number
          results: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_count?: number
          results?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          widgets: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          widgets: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          widgets?: Json
        }
        Relationships: []
      }
      http_sync_configs: {
        Row: {
          api_url: string
          auth_password: string | null
          auth_username: string | null
          body: Json | null
          created_at: string
          data_mapping: Json
          headers: Json | null
          id: string
          is_active: boolean | null
          method: string | null
          options: Json | null
          query_params: Json | null
          sync_interval: number | null
          tenant_id: string | null
          timeout_ms: number | null
          transformations: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_url: string
          auth_password?: string | null
          auth_username?: string | null
          body?: Json | null
          created_at?: string
          data_mapping: Json
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          options?: Json | null
          query_params?: Json | null
          sync_interval?: number | null
          tenant_id?: string | null
          timeout_ms?: number | null
          transformations?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_url?: string
          auth_password?: string | null
          auth_username?: string | null
          body?: Json | null
          created_at?: string
          data_mapping?: Json
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          options?: Json | null
          query_params?: Json | null
          sync_interval?: number | null
          tenant_id?: string | null
          timeout_ms?: number | null
          transformations?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          accumulated_percentage: number | null
          active_ingredient: string | null
          administration_route: string | null
          batch: string | null
          category: string | null
          classification: string | null
          clinical_criticality: string | null
          code: string | null
          consumption_frequency: string | null
          cost_center: string | null
          created_at: string
          cumulative_percentage: number | null
          current_stock: number | null
          discount: number | null
          expiration_date: string | null
          id: string
          invoice_number: string | null
          last_purchase_date: string | null
          lead_time: number | null
          min_stock: number | null
          month: number | null
          movement_date: string | null
          movement_type: string | null
          name: string
          needs_reorder: boolean | null
          percentage: number | null
          profit_margin: number | null
          quantity: number
          reorder_point: number | null
          requesting_sector: string | null
          responsible: string | null
          seasonality: string | null
          special_control: boolean | null
          stock_value: number | null
          stockout_rate: number | null
          storage_temperature: string | null
          subcategory: string | null
          supplier: string | null
          tax: number | null
          therapeutic_indication: string | null
          total_cost: number | null
          total_value: number
          trend: string | null
          unit: string | null
          unit_price: number
          updated_at: string
          user_id: string
          value_percentage: number | null
          volatility: number | null
          year: number | null
        }
        Insert: {
          accumulated_percentage?: number | null
          active_ingredient?: string | null
          administration_route?: string | null
          batch?: string | null
          category?: string | null
          classification?: string | null
          clinical_criticality?: string | null
          code?: string | null
          consumption_frequency?: string | null
          cost_center?: string | null
          created_at?: string
          cumulative_percentage?: number | null
          current_stock?: number | null
          discount?: number | null
          expiration_date?: string | null
          id?: string
          invoice_number?: string | null
          last_purchase_date?: string | null
          lead_time?: number | null
          min_stock?: number | null
          month?: number | null
          movement_date?: string | null
          movement_type?: string | null
          name: string
          needs_reorder?: boolean | null
          percentage?: number | null
          profit_margin?: number | null
          quantity: number
          reorder_point?: number | null
          requesting_sector?: string | null
          responsible?: string | null
          seasonality?: string | null
          special_control?: boolean | null
          stock_value?: number | null
          stockout_rate?: number | null
          storage_temperature?: string | null
          subcategory?: string | null
          supplier?: string | null
          tax?: number | null
          therapeutic_indication?: string | null
          total_cost?: number | null
          total_value: number
          trend?: string | null
          unit?: string | null
          unit_price: number
          updated_at?: string
          user_id: string
          value_percentage?: number | null
          volatility?: number | null
          year?: number | null
        }
        Update: {
          accumulated_percentage?: number | null
          active_ingredient?: string | null
          administration_route?: string | null
          batch?: string | null
          category?: string | null
          classification?: string | null
          clinical_criticality?: string | null
          code?: string | null
          consumption_frequency?: string | null
          cost_center?: string | null
          created_at?: string
          cumulative_percentage?: number | null
          current_stock?: number | null
          discount?: number | null
          expiration_date?: string | null
          id?: string
          invoice_number?: string | null
          last_purchase_date?: string | null
          lead_time?: number | null
          min_stock?: number | null
          month?: number | null
          movement_date?: string | null
          movement_type?: string | null
          name?: string
          needs_reorder?: boolean | null
          percentage?: number | null
          profit_margin?: number | null
          quantity?: number
          reorder_point?: number | null
          requesting_sector?: string | null
          responsible?: string | null
          seasonality?: string | null
          special_control?: boolean | null
          stock_value?: number | null
          stockout_rate?: number | null
          storage_temperature?: string | null
          subcategory?: string | null
          supplier?: string | null
          tax?: number | null
          therapeutic_indication?: string | null
          total_cost?: number | null
          total_value?: number
          trend?: string | null
          unit?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
          value_percentage?: number | null
          volatility?: number | null
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_datasets: {
        Row: {
          created_at: string
          file_name: string
          id: string
          import_date: string
          name: string
          record_count: number
          size_bytes: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          import_date?: string
          name: string
          record_count: number
          size_bytes?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          import_date?: string
          name?: string
          record_count?: number
          size_bytes?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          attempts: number | null
          created_at: string
          data: Json | null
          duration_ms: number | null
          errors: Json | null
          finished_at: string | null
          id: string
          started_at: string
          status: string
          sync_config_id: string | null
          sync_id: string
          tenant_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          data?: Json | null
          duration_ms?: number | null
          errors?: Json | null
          finished_at?: string | null
          id?: string
          started_at: string
          status: string
          sync_config_id?: string | null
          sync_id: string
          tenant_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          data?: Json | null
          duration_ms?: number | null
          errors?: Json | null
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
          sync_config_id?: string | null
          sync_id?: string
          tenant_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_sync_config_id_fkey"
            columns: ["sync_config_id"]
            isOneToOne: false
            referencedRelation: "http_sync_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "manager" | "viewer"
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
      app_role: ["admin", "manager", "viewer"],
    },
  },
} as const
