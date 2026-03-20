/**
 * Shared TypeScript types
 */

/**
 * Database entity types (will be generated from Supabase)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Common database fields
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Location
 */
export interface Location extends BaseEntity {
  city_id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_date?: string;
  brand_id?: string;
  is_active: boolean;
  opens_at?: string;
  closes_at?: string;
  cash_tolerance: number;
}

/**
 * Brand
 */
export interface Brand extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  logo_url?: string;
  is_active: boolean;
}

/**
 * Sales Channel
 */
export interface SalesChannel {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_external: boolean;
  is_active: boolean;
  sort_order: number;
}

/**
 * Payment Method
 */
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  requires_closing: boolean;
  is_active: boolean;
  sort_order: number;
}

/**
 * Sale (Transaction)
 */
export interface Sale extends BaseEntity {
  location_id: string;
  brand_id?: string;
  channel_id: string;
  payment_method_id: string;
  date: string;
  time: string;
  order_number?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  items_count: number;
  is_external: boolean;
  external_commission: number;
  external_order_id?: string;
  status: "completed" | "cancelled" | "pending";
  cancelled_at?: string;
  cancellation_reason?: string;
  created_by?: string;
}

/**
 * Cash Closing
 */
export interface CashClosing extends BaseEntity {
  location_id: string;
  date: string;
  expected_cash: number;
  expected_bancard: number;
  expected_upay: number;
  expected_total: number;
  actual_cash: number;
  actual_bancard: number;
  actual_upay: number;
  actual_total: number;
  cash_difference: number;
  bancard_difference: number;
  upay_difference: number;
  total_difference: number;
  petty_cash_rendered: number;
  closing_status: "pending" | "closed_correctly" | "with_difference" | "under_review";
  closed_at?: string;
  closed_by?: string;
  observation?: string;
  requires_review: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
}

/**
 * Alert
 */
export interface Alert extends BaseEntity {
  location_id?: string;
  brand_id?: string;
  type: "cash" | "merchandise" | "payments" | "supervision" | "sales" | "profitability";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  related_entity_type?: string;
  related_entity_id?: string;
  related_date?: string;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  suggested_action?: string;
  action_taken?: string;
}

/**
 * User
 */
export interface User extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  role_id?: string;
  location_id?: string;
  is_active: boolean;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  password_changed: boolean;
  password_changed_at?: string;
  last_login_at?: string;
}

/**
 * User roles
 */
export type UserRole = "admin" | "cfo" | "manager" | "supervisor" | "viewer";

/**
 * Dashboard stats
 */
export interface DashboardStats {
  netSales: number;
  orders: number;
  averageTicket: number;
  foodCostPercent: number;
  estimatedProfitability: number;
  centralizedPayments: number;
  totalCashDifference: number;
  activeAlerts: number;
}

/**
 * Filter state
 */
export interface GlobalFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  countries: string[];
  cities: string[];
  locations: string[];
  brands: string[];
  channels: string[];
  paymentMethods: string[];
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    hasMore?: boolean;
  };
}
