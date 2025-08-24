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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          company_name: string | null
          role: string
          permissions: string[] | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          company_name?: string | null
          role?: string
          permissions?: string[] | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          company_name?: string | null
          role?: string
          permissions?: string[] | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          whatsapp: string | null
          instagram: string | null
          client_type: string
          status: string
          since: string
          last_contact: string
          portal_access_id: string
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          whatsapp?: string | null
          instagram?: string | null
          client_type?: string
          status?: string
          since?: string
          last_contact?: string
          portal_access_id?: string
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          whatsapp?: string | null
          instagram?: string | null
          client_type?: string
          status?: string
          since?: string
          last_contact?: string
          portal_access_id?: string
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          project_name: string
          client_name: string
          client_id: string
          project_type: string
          package_name: string
          package_id: string
          add_ons: Json
          date: string
          deadline_date: string | null
          location: string
          progress: number
          status: string
          active_sub_statuses: string[] | null
          total_cost: number
          amount_paid: number
          payment_status: string
          team: Json
          notes: string | null
          accommodation: string | null
          drive_link: string | null
          client_drive_link: string | null
          final_drive_link: string | null
          start_time: string | null
          end_time: string | null
          image: string | null
          revisions: Json | null
          promo_code_id: string | null
          discount_amount: number | null
          shipping_details: string | null
          dp_proof_url: string | null
          printing_details: Json | null
          printing_cost: number | null
          transport_cost: number | null
          booking_status: string | null
          rejection_reason: string | null
          chat_history: Json | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_name: string
          client_name: string
          client_id: string
          project_type: string
          package_name: string
          package_id: string
          add_ons?: Json
          date: string
          deadline_date?: string | null
          location: string
          progress?: number
          status?: string
          active_sub_statuses?: string[] | null
          total_cost: number
          amount_paid?: number
          payment_status?: string
          team?: Json
          notes?: string | null
          accommodation?: string | null
          drive_link?: string | null
          client_drive_link?: string | null
          final_drive_link?: string | null
          start_time?: string | null
          end_time?: string | null
          image?: string | null
          revisions?: Json | null
          promo_code_id?: string | null
          discount_amount?: number | null
          shipping_details?: string | null
          dp_proof_url?: string | null
          printing_details?: Json | null
          printing_cost?: number | null
          transport_cost?: number | null
          booking_status?: string | null
          rejection_reason?: string | null
          chat_history?: Json | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_name?: string
          client_name?: string
          client_id?: string
          project_type?: string
          package_name?: string
          package_id?: string
          add_ons?: Json
          date?: string
          deadline_date?: string | null
          location?: string
          progress?: number
          status?: string
          active_sub_statuses?: string[] | null
          total_cost?: number
          amount_paid?: number
          payment_status?: string
          team?: Json
          notes?: string | null
          accommodation?: string | null
          drive_link?: string | null
          client_drive_link?: string | null
          final_drive_link?: string | null
          start_time?: string | null
          end_time?: string | null
          image?: string | null
          revisions?: Json | null
          promo_code_id?: string | null
          discount_amount?: number | null
          shipping_details?: string | null
          dp_proof_url?: string | null
          printing_details?: Json | null
          printing_cost?: number | null
          transport_cost?: number | null
          booking_status?: string | null
          rejection_reason?: string | null
          chat_history?: Json | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          name: string
          price: number
          physical_items: Json
          digital_items: string[]
          processing_time: string
          photographers: string | null
          videographers: string | null
          cover_image: string | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          physical_items?: Json
          digital_items?: string[]
          processing_time: string
          photographers?: string | null
          videographers?: string | null
          cover_image?: string | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          physical_items?: Json
          digital_items?: string[]
          processing_time?: string
          photographers?: string | null
          videographers?: string | null
          cover_image?: string | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          date: string
          description: string
          amount: number
          type: string
          project_id: string | null
          category: string
          method: string
          pocket_id: string | null
          card_id: string | null
          printing_item_id: string | null
          vendor_signature: string | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          description: string
          amount: number
          type: string
          project_id?: string | null
          category: string
          method: string
          pocket_id?: string | null
          card_id?: string | null
          printing_item_id?: string | null
          vendor_signature?: string | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          description?: string
          amount?: number
          type?: string
          project_id?: string | null
          category?: string
          method?: string
          pocket_id?: string | null
          card_id?: string | null
          printing_item_id?: string | null
          vendor_signature?: string | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          email: string
          phone: string
          standard_fee: number
          no_rek: string | null
          reward_balance: number
          rating: number
          performance_notes: Json
          portal_access_id: string
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          email: string
          phone: string
          standard_fee?: number
          no_rek?: string | null
          reward_balance?: number
          rating?: number
          performance_notes?: Json
          portal_access_id?: string
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          email?: string
          phone?: string
          standard_fee?: number
          no_rek?: string | null
          reward_balance?: number
          rating?: number
          performance_notes?: Json
          portal_access_id?: string
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          contact_channel: string
          location: string
          status: string
          date: string
          notes: string | null
          whatsapp: string | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_channel: string
          location: string
          status?: string
          date: string
          notes?: string | null
          whatsapp?: string | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_channel?: string
          location?: string
          status?: string
          date?: string
          notes?: string | null
          whatsapp?: string | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          card_holder_name: string
          bank_name: string
          card_type: string
          last_four_digits: string
          expiry_date: string | null
          balance: number
          color_gradient: string
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_holder_name: string
          bank_name: string
          card_type: string
          last_four_digits: string
          expiry_date?: string | null
          balance?: number
          color_gradient: string
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_holder_name?: string
          bank_name?: string
          card_type?: string
          last_four_digits?: string
          expiry_date?: string | null
          balance?: number
          color_gradient?: string
          vendor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          company_name: string
          website: string | null
          address: string
          bank_account: string
          authorized_signer: string
          id_number: string | null
          bio: string | null
          income_categories: string[]
          expense_categories: string[]
          project_types: string[]
          event_types: string[]
          asset_categories: string[]
          sop_categories: string[]
          project_status_config: Json
          notification_settings: Json
          security_settings: Json
          briefing_template: string | null
          terms_and_conditions: string | null
          contract_template: string | null
          logo_base64: string | null
          brand_color: string | null
          public_page_config: Json
          package_share_template: string | null
          booking_form_template: string | null
          chat_templates: Json | null
          current_plan_id: string | null
          vendor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          company_name: string
          website?: string | null
          address: string
          bank_account: string
          authorized_signer: string
          id_number?: string | null
          bio?: string | null
          income_categories?: string[]
          expense_categories?: string[]
          project_types?: string[]
          event_types?: string[]
          asset_categories?: string[]
          sop_categories?: string[]
          project_status_config?: Json
          notification_settings?: Json
          security_settings?: Json
          briefing_template?: string | null
          terms_and_conditions?: string | null
          contract_template?: string | null
          logo_base64?: string | null
          brand_color?: string | null
          public_page_config?: Json
          package_share_template?: string | null
          booking_form_template?: string | null
          chat_templates?: Json | null
          current_plan_id?: string | null
          vendor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          company_name?: string
          website?: string | null
          address?: string
          bank_account?: string
          authorized_signer?: string
          id_number?: string | null
          bio?: string | null
          income_categories?: string[]
          expense_categories?: string[]
          project_types?: string[]
          event_types?: string[]
          asset_categories?: string[]
          sop_categories?: string[]
          project_status_config?: Json
          notification_settings?: Json
          security_settings?: Json
          briefing_template?: string | null
          terms_and_conditions?: string | null
          contract_template?: string | null
          logo_base64?: string | null
          brand_color?: string | null
          public_page_config?: Json
          package_share_template?: string | null
          booking_form_template?: string | null
          chat_templates?: Json | null
          current_plan_id?: string | null
          vendor_id?: string
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}