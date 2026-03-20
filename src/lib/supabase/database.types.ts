/**
 * Supabase Database Types
 *
 * Auto-generated types from Supabase schema
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
 */

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
      countries: {
        Row: {
          id: string
          code: string
          name: string
          currency_code: string
          currency_symbol: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          currency_code: string
          currency_symbol: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          currency_code?: string
          currency_symbol?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          country_id: string
          name: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_id: string
          name: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_id?: string
          name?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          city_id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          opening_date: string | null
          brand_id: string | null
          is_active: boolean
          opens_at: string | null
          closes_at: string | null
          cash_tolerance: number
          last_cash_close: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_date?: string | null
          brand_id?: string | null
          is_active?: boolean
          opens_at?: string | null
          closes_at?: string | null
          cash_tolerance?: number
          last_cash_close?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_date?: string | null
          brand_id?: string | null
          is_active?: boolean
          opens_at?: string | null
          closes_at?: string | null
          cash_tolerance?: number
          last_cash_close?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          location_id: string
          brand_id: string | null
          channel_id: string
          payment_method_id: string
          date: string
          time: string
          order_number: string | null
          total_amount: number
          discount_amount: number
          tax_amount: number
          net_amount: number
          items_count: number
          products_summary: Json | null
          is_external: boolean
          external_commission: number
          external_order_id: string | null
          status: 'completed' | 'cancelled' | 'pending'
          cancelled_at: string | null
          cancellation_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          brand_id?: string | null
          channel_id: string
          payment_method_id: string
          date: string
          time: string
          order_number?: string | null
          total_amount: number
          discount_amount?: number
          tax_amount?: number
          net_amount: number
          items_count?: number
          products_summary?: Json | null
          is_external?: boolean
          external_commission?: number
          external_order_id?: string | null
          status?: 'completed' | 'cancelled' | 'pending'
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          brand_id?: string | null
          channel_id?: string
          payment_method_id?: string
          date?: string
          time?: string
          order_number?: string | null
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          net_amount?: number
          items_count?: number
          products_summary?: Json | null
          is_external?: boolean
          external_commission?: number
          external_order_id?: string | null
          status?: 'completed' | 'cancelled' | 'pending'
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... more tables
    }
  }
}
