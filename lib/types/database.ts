export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          name: string
          type: string
          loan_amount: number
          chips: Json
          password_hash: string | null
          currency_unit: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          loan_amount?: number
          chips?: Json
          password_hash?: string | null
          currency_unit?: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          loan_amount?: number
          chips?: Json
          password_hash?: string | null
          currency_unit?: string
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          group_id: string
          name: string
          color: string
          position: number
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          color: string
          position?: number
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          color?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
      group_admins: {
        Row: {
          group_id: string
          email: string
        }
        Insert: {
          group_id: string
          email: string
        }
        Update: {
          group_id?: string
          email?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_admins_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
      login_codes: {
        Row: {
          id: string
          email: string
          code: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          code: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          code?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          group_id: string
          date: string
          scores: Json
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          group_id: string
          date: string
          scores: Json
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          date?: string
          scores?: Json
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      check_group_password: {
        Args: { p_group_id: string; p_password: string }
        Returns: boolean
      }
      hash_password: {
        Args: { p_password: string }
        Returns: string
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
