export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: string
          school_id: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role: string
          school_id?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: string
          school_id?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      intervention_levels: {
        Row: {
          id: string
          name: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          order?: number
          created_at?: string
        }
      }
      interventions: {
        Row: {
          id: string
          school_name: string
          risk_score: number
          level_id: string
          contacts_count: number
          documents_count: number
          alerts_count: number
          info_count: number
          created_at: string
          updated_at: string
          created_by: string
          active: boolean
        }
        Insert: {
          id?: string
          school_name: string
          risk_score?: number
          level_id: string
          contacts_count?: number
          documents_count?: number
          alerts_count?: number
          info_count?: number
          created_at?: string
          updated_at?: string
          created_by: string
          active?: boolean
        }
        Update: {
          id?: string
          school_name?: string
          risk_score?: number
          level_id?: string
          contacts_count?: number
          documents_count?: number
          alerts_count?: number
          info_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string
          active?: boolean
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          code: string
          address: string
          status: 'Opened' | 'Closed' | 'Under Review'
          parent_organization: string | null
          phone: string | null
          current_enrollment: number
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address: string
          status: 'Opened' | 'Closed' | 'Under Review'
          parent_organization?: string | null
          phone?: string | null
          current_enrollment?: number
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string
          status?: 'Opened' | 'Closed' | 'Under Review'
          parent_organization?: string | null
          phone?: string | null
          current_enrollment?: number
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      school_grades: {
        Row: {
          id: string
          school_id: string
          grade: string
        }
        Insert: {
          id?: string
          school_id: string
          grade: string
        }
        Update: {
          id?: string
          school_id?: string
          grade?: string
        }
      }
      school_tags: {
        Row: {
          id: string
          school_id: string
          tag: string
        }
        Insert: {
          id?: string
          school_id: string
          tag: string
        }
        Update: {
          id?: string
          school_id?: string
          tag?: string
        }
      }
      school_operation_details: {
        Row: {
          id: string
          school_id: string
          student_capacity: number
          class_size: number
          teacher_to_student_ratio: string | null
          transportation_provided: boolean
          lunch_provided: boolean
          financial_aid_available: boolean
        }
        Insert: {
          id?: string
          school_id: string
          student_capacity?: number
          class_size?: number
          teacher_to_student_ratio?: string | null
          transportation_provided?: boolean
          lunch_provided?: boolean
          financial_aid_available?: boolean
        }
        Update: {
          id?: string
          school_id?: string
          student_capacity?: number
          class_size?: number
          teacher_to_student_ratio?: string | null
          transportation_provided?: boolean
          lunch_provided?: boolean
          financial_aid_available?: boolean
        }
      }
      school_meal_options: {
        Row: {
          id: string
          school_id: string
          meal_option: string
        }
        Insert: {
          id?: string
          school_id: string
          meal_option: string
        }
        Update: {
          id?: string
          school_id?: string
          meal_option?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
