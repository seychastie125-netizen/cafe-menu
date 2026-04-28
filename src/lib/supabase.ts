import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Серверный клиент с полными правами (только для API Routes)
export function createAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: number; name: string; icon: string; sort_order: number; created_at: string }
        Insert: { name: string; icon?: string; sort_order?: number }
        Update: { name?: string; icon?: string; sort_order?: number }
      }
      items: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category_id: number
          image_url: string | null
          available: boolean
          sort_order: number
          modifier_groups: ModifierGroup[]
          created_at: string
        }
        Insert: {
          name: string
          description?: string
          price: number
          category_id: number
          image_url?: string | null
          available?: boolean
          sort_order?: number
          modifier_groups?: ModifierGroup[]
        }
        Update: {
          name?: string
          description?: string
          price?: number
          category_id?: number
          image_url?: string | null
          available?: boolean
          sort_order?: number
          modifier_groups?: ModifierGroup[]
        }
      }
      site_settings: {
        Row: { id: number; cafe_name: string; cafe_subtitle: string; currency_symbol: string; show_unavailable_items: boolean; updated_at: string }
        Insert: { cafe_name?: string; cafe_subtitle?: string; currency_symbol?: string; show_unavailable_items?: boolean }
        Update: { cafe_name?: string; cafe_subtitle?: string; currency_symbol?: string; show_unavailable_items?: boolean; updated_at?: string }
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type SiteSettings = Database['public']['Tables']['site_settings']['Row']

export type ModifierGroup = {
  id: number
  name: string
  type: 'single' | 'multiple'
  required: boolean
  options: { id: number; name: string; price: number }[]
}
