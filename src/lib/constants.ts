/**
 * Application constants
 */

export const APP_NAME = "Corporate Dashboard";
export const APP_VERSION = "0.1.0";

/**
 * Sales channels
 */
export const SALES_CHANNELS = {
  IN_STORE: "in_store",
  OWN_DELIVERY: "own_delivery",
  PEDIDOS_YA: "pedidos_ya",
  MONCHIS: "monchis",
} as const;

export const SALES_CHANNELS_LABELS: Record<keyof typeof SALES_CHANNELS, string> = {
  IN_STORE: "In-Store",
  OWN_DELIVERY: "Own Delivery",
  PEDIDOS_YA: "PedidosYa",
  MONCHIS: "Monchis",
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CASH: "cash",
  BANCARD: "bancard",
  UPAY: "upay",
} as const;

export const PAYMENT_METHODS_LABELS: Record<keyof typeof PAYMENT_METHODS, string> = {
  CASH: "Cash",
  BANCARD: "Bancard",
  UPAY: "Upay",
};

/**
 * Alert types
 */
export const ALERT_TYPES = {
  CASH: "cash",
  MERCHANDISE: "merchandise",
  PAYMENTS: "payments",
  SUPERVISION: "supervision",
  SALES: "sales",
  PROFITABILITY: "profitability",
} as const;

/**
 * Alert severity
 */
export const ALERT_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

/**
 * Status colors
 */
export const STATUS_COLORS = {
  GOOD: "green",
  ATTENTION: "yellow",
  PROBLEM: "red",
  INFO: "blue",
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  CFO: "cfo",
  MANAGER: "manager",
  SUPERVISOR: "supervisor",
  VIEWER: "viewer",
} as const;

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  SHORT: "MM/dd/yyyy",
  INPUT: "yyyy-MM-dd",
  MONTH_YEAR: "MMMM yyyy",
} as const;
