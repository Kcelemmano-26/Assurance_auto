export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'client' | 'insurer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'client' | 'insurer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'client' | 'insurer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      insurance_companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          contact_email: string
          contact_phone: string | null
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          contact_email: string
          contact_phone?: string | null
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          contact_email?: string
          contact_phone?: string | null
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      insurance_requests: {
        Row: {
          id: string
          client_id: string
          insurer_id: string | null
          vehicle_brand: string
          vehicle_model: string
          vehicle_year: number
          vehicle_registration: string
          previous_insurer: string | null
          net_amount: number
          commission_amount: number
          total_amount: number
          status: 'pending' | 'assigned' | 'processing' | 'completed' | 'rejected'
          payment_status: 'pending' | 'paid' | 'failed'
          payment_reference: string | null
          documents: string[]
          certificate_url: string | null
          notes: string | null
          estimated_processing_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          insurer_id?: string | null
          vehicle_brand: string
          vehicle_model: string
          vehicle_year: number
          vehicle_registration: string
          previous_insurer?: string | null
          net_amount: number
          commission_amount: number
          total_amount: number
          status?: 'pending' | 'assigned' | 'processing' | 'completed' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_reference?: string | null
          documents?: string[]
          certificate_url?: string | null
          notes?: string | null
          estimated_processing_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          insurer_id?: string | null
          vehicle_brand?: string
          vehicle_model?: string
          vehicle_year?: number
          vehicle_registration?: string
          previous_insurer?: string | null
          net_amount?: number
          commission_amount?: number
          total_amount?: number
          status?: 'pending' | 'assigned' | 'processing' | 'completed' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_reference?: string | null
          documents?: string[]
          certificate_url?: string | null
          notes?: string | null
          estimated_processing_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          request_id: string
          amount: number
          currency: string
          payment_method: string
          fedapay_transaction_id: string | null
          status: 'pending' | 'success' | 'failed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          amount: number
          currency?: string
          payment_method: string
          fedapay_transaction_id?: string | null
          status?: 'pending' | 'success' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          fedapay_transaction_id?: string | null
          status?: 'pending' | 'success' | 'failed' | 'cancelled'
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
  }
}