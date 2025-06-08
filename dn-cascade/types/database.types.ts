export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      awards: {
        Row: {
          award: string
          created_at: string
          id: number
          level: number
          user_id: number
        }
        Insert: {
          award: string
          created_at?: string
          id?: number
          level: number
          user_id: number
        }
        Update: {
          award?: string
          created_at?: string
          id?: number
          level?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "awards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          credential: number
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Insert: {
          credential?: number
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Update: {
          credential?: number
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      club_managers: {
        Row: {
          club_id: number
          created_at: string
          id: number
          user_id: number
        }
        Insert: {
          club_id: number
          created_at?: string
          id?: number
          user_id: number
        }
        Update: {
          club_id?: number
          created_at?: string
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_managers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_managers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: number
          league: Database["public"]["Enums"]["club_league"]
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          league?: Database["public"]["Enums"]["club_league"]
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          league?: Database["public"]["Enums"]["club_league"]
          name?: string
        }
        Relationships: []
      }
      details: {
        Row: {
          address: string | null
          birthdate: string | null
          email: string | null
          id: number
          phone: string | null
          user_id: number
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          email?: string | null
          id?: number
          phone?: string | null
          user_id: number
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          email?: string | null
          id?: number
          phone?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          club_id: number
          created_at: string
          id: number
          user_id: number
          year: number
        }
        Insert: {
          club_id: number
          created_at?: string
          id?: number
          user_id: number
          year: number
        }
        Update: {
          club_id?: number
          created_at?: string
          id?: number
          user_id?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          id: number
          name: string | null
          public: boolean
          surname: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          id?: number
          name?: string | null
          public?: boolean
          surname?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          id?: number
          name?: string | null
          public?: boolean
          surname?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
    }
    Enums: {
      app_permission:
        | "awards.read"
        | "awards.write"
        | "clubs.read"
        | "clubs.write"
        | "club_managers.read"
        | "club_managers.write"
        | "claims.read"
        | "claims.write"
        | "details.read"
        | "details.write"
        | "memberships.read"
        | "memberships.write"
        | "users.read"
        | "users.write"
      app_role:
        | "developer"
        | "admin"
        | "cap"
        | "junior_organizer"
        | "senior_organizer"
        | "mc_member"
        | "user"
      club_league: "junior" | "senior" | "university"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permission: [
        "awards.read",
        "awards.write",
        "clubs.read",
        "clubs.write",
        "club_managers.read",
        "club_managers.write",
        "claims.read",
        "claims.write",
        "details.read",
        "details.write",
        "memberships.read",
        "memberships.write",
        "users.read",
        "users.write",
      ],
      app_role: [
        "developer",
        "admin",
        "cap",
        "junior_organizer",
        "senior_organizer",
        "mc_member",
        "user",
      ],
      club_league: ["junior", "senior", "university"],
    },
  },
} as const

