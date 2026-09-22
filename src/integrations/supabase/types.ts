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
      activities: {
        Row: {
          activity_type: string
          author: string | null
          body: string | null
          company_id: string | null
          created_by: string | null
          id: string
          occurred_at: string
          opportunity_id: string | null
          subject: string
        }
        Insert: {
          activity_type?: string
          author?: string | null
          body?: string | null
          company_id?: string | null
          created_by?: string | null
          id?: string
          occurred_at?: string
          opportunity_id?: string | null
          subject: string
        }
        Update: {
          activity_type?: string
          author?: string | null
          body?: string | null
          company_id?: string | null
          created_by?: string | null
          id?: string
          occurred_at?: string
          opportunity_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          created_at: string
          detail: string | null
          entity: string
          entity_label: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          detail?: string | null
          entity: string
          entity_label?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          detail?: string | null
          entity?: string
          entity_label?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          applied_at: string
          expected_salary: number | null
          full_name: string
          id: string
          location: string | null
          next_interview_at: string | null
          notes: string | null
          rating: number
          recruiter: string | null
          role_applied: string
          seniority: string | null
          source: string | null
          stage: string
        }
        Insert: {
          applied_at?: string
          expected_salary?: number | null
          full_name: string
          id?: string
          location?: string | null
          next_interview_at?: string | null
          notes?: string | null
          rating?: number
          recruiter?: string | null
          role_applied: string
          seniority?: string | null
          source?: string | null
          stage?: string
        }
        Update: {
          applied_at?: string
          expected_salary?: number | null
          full_name?: string
          id?: string
          location?: string | null
          next_interview_at?: string | null
          notes?: string | null
          rating?: number
          recruiter?: string | null
          role_applied?: string
          seniority?: string | null
          source?: string | null
          stage?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          account_manager: string | null
          active_projects: number
          city: string | null
          client_since: string | null
          contract_status: string
          country: string | null
          created_at: string
          employees: number | null
          health_label: string
          health_score: number
          id: string
          industry: string | null
          last_activity_at: string | null
          name: string
          notes: string | null
          revenue_12m: number
          segment: string | null
          website: string | null
        }
        Insert: {
          account_manager?: string | null
          active_projects?: number
          city?: string | null
          client_since?: string | null
          contract_status?: string
          country?: string | null
          created_at?: string
          employees?: number | null
          health_label?: string
          health_score?: number
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          name: string
          notes?: string | null
          revenue_12m?: number
          segment?: string | null
          website?: string | null
        }
        Update: {
          account_manager?: string | null
          active_projects?: number
          city?: string | null
          client_since?: string | null
          contract_status?: string
          country?: string | null
          created_at?: string
          employees?: number | null
          health_label?: string
          health_score?: number
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          name?: string
          notes?: string | null
          revenue_12m?: number
          segment?: string | null
          website?: string | null
        }
        Relationships: []
      }
      consultant_skills: {
        Row: {
          consultant_id: string
          id: string
          level: number
          skill_id: string
          years: number
        }
        Insert: {
          consultant_id: string
          id?: string
          level?: number
          skill_id: string
          years?: number
        }
        Update: {
          consultant_id?: string
          id?: string
          level?: number
          skill_id?: string
          years?: number
        }
        Relationships: [
          {
            foreignKeyName: "consultant_skills_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultant_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          availability: string
          available_from: string | null
          created_at: string
          current_project: string | null
          day_rate: number | null
          full_name: string
          id: string
          job_title: string | null
          location: string | null
          seniority: string | null
          utilization: number
        }
        Insert: {
          availability?: string
          available_from?: string | null
          created_at?: string
          current_project?: string | null
          day_rate?: number | null
          full_name: string
          id?: string
          job_title?: string | null
          location?: string | null
          seniority?: string | null
          utilization?: number
        }
        Update: {
          availability?: string
          available_from?: string | null
          created_at?: string
          current_project?: string | null
          day_rate?: number | null
          full_name?: string
          id?: string
          job_title?: string | null
          location?: string | null
          seniority?: string | null
          utilization?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          job_title: string | null
          last_contacted_at: string | null
          phone: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          last_contacted_at?: string | null
          phone?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          last_contacted_at?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          auto_renew: boolean
          company_id: string | null
          contract_type: string
          created_at: string
          currency: string
          end_date: string | null
          id: string
          notice_days: number
          owner: string | null
          start_date: string | null
          status: string
          title: string
          value: number
        }
        Insert: {
          auto_renew?: boolean
          company_id?: string | null
          contract_type?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          notice_days?: number
          owner?: string | null
          start_date?: string | null
          status?: string
          title: string
          value?: number
        }
        Update: {
          auto_renew?: boolean
          company_id?: string | null
          contract_type?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          notice_days?: number
          owner?: string | null
          start_date?: string | null
          status?: string
          title?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          company_id: string | null
          created_at: string
          expected_close: string | null
          id: string
          name: string
          next_step: string | null
          owner: string | null
          probability: number
          source: string | null
          stage: string
          value: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          expected_close?: string | null
          id?: string
          name: string
          next_step?: string | null
          owner?: string | null
          probability?: number
          source?: string | null
          stage?: string
          value?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          expected_close?: string | null
          id?: string
          name?: string
          next_step?: string | null
          owner?: string | null
          probability?: number
          source?: string | null
          stage?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_tone: number
          created_at: string
          email: string | null
          full_name: string
          id: string
          initials: string | null
          job_title: string | null
        }
        Insert: {
          avatar_tone?: number
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          initials?: string | null
          job_title?: string | null
        }
        Update: {
          avatar_tone?: number
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          initials?: string | null
          job_title?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          billing_model: string | null
          budget: number
          code: string | null
          company_id: string | null
          created_at: string
          delivery_manager: string | null
          end_date: string | null
          id: string
          name: string
          progress: number
          spent: number
          start_date: string | null
          status: string
          team_size: number
        }
        Insert: {
          billing_model?: string | null
          budget?: number
          code?: string | null
          company_id?: string | null
          created_at?: string
          delivery_manager?: string | null
          end_date?: string | null
          id?: string
          name: string
          progress?: number
          spent?: number
          start_date?: string | null
          status?: string
          team_size?: number
        }
        Update: {
          billing_model?: string | null
          budget?: number
          code?: string | null
          company_id?: string | null
          created_at?: string
          delivery_manager?: string | null
          end_date?: string | null
          id?: string
          name?: string
          progress?: number
          spent?: number
          start_date?: string | null
          status?: string
          team_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          company_id: string | null
          created_at: string
          due_date: string | null
          id: string
          owner_id: string | null
          priority: string
          status: string
          title: string
        }
        Insert: {
          assignee?: string | null
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: string
          status?: string
          title: string
        }
        Update: {
          assignee?: string | null
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "member"
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
    Enums: {
      app_role: ["admin", "manager", "member"],
    },
  },
} as const
