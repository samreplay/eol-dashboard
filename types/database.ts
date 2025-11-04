export type EOLPhase = 0 | 1 | 2 | 3 | 4;

export interface Product {
  id: string;
  product_name: string;
  product_code: string;

  // Product classification
  artikelgroep: string | null;
  product_blocked: boolean;

  // EOL management (manual)
  eol_date: string | null; // ISO date string
  eol_reason: string | null;
  replacement_product: string | null;

  // Multi-currency pricing
  rrp_eur: number | null;
  rrp_gbp: number | null;
  rrp_usd: number | null;
  msp: number | null; // Manufacturer Suggested Price
  rrp: number | null; // Legacy field, maps to rrp_eur

  // Stock tracking
  stock_regular: number;
  stock_on_order: number;
  stock_reserved: number;
  stock_economic: number;
  stock_minimum: number | null;
  stock_replenish_to: number | null;
  stock_quantity: number; // Legacy field, maps to stock_regular

  // Sales data
  monthly_sales: number;
  sales_month_1: number;
  sales_month_2: number;
  sales_month_3: number;
  sales_month_4: number;
  sales_month_5: number;
  sales_month_6: number;
  sales_month_7: number;
  sales_month_8: number;
  sales_month_9: number;
  sales_month_10: number;
  sales_month_11: number;
  sales_month_12: number;
  months_of_data: number;

  // Packaging units
  unit_stk: number | null;
  unit_doz: number | null;
  unit_pal: number | null;

  // Portal status
  website_status: 'active' | 'inactive' | 'hidden';
  reseller_portal_status: 'active' | 'inactive' | 'hidden';

  // Phase tracking
  current_phase: EOLPhase;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PhaseHistory {
  id: string;
  product_id: string;
  from_phase: EOLPhase;
  to_phase: EOLPhase;
  changed_at: string;
  reason: string | null;
  created_at: string;
}

export interface NotificationQueue {
  id: string;
  product_id: string;
  notification_type: 'marketing' | 'sales' | 'customer';
  recipient_email: string;
  phase_trigger: EOLPhase;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface ProductWithCalculations extends Product {
  months_of_stock: number;
  days_since_eol: number | null;
  calculated_phase: EOLPhase;
}

export const PHASE_CONFIG = {
  0: {
    label: 'In Stock',
    description: 'In stock and portfolio product - no action required',
    color: 'green',
    colorCode: '#10b981'
  },
  1: {
    label: 'Phasing Out',
    description: 'Phasing out - only portfolio team knows',
    color: 'purple',
    colorCode: '#8b5cf6'
  },
  2: {
    label: 'Sell Out Started',
    description: 'Sell out started - stock < 1 month or > 11 months from EOL',
    color: 'orange',
    colorCode: '#f59e0b'
  },
  3: {
    label: 'Stock Depleted',
    description: 'Stock is depleted',
    color: 'red',
    colorCode: '#ef4444'
  },
  4: {
    label: 'Action Required',
    description: 'After 12+ months, still has stock - action required',
    color: 'blue',
    colorCode: '#3b82f6'
  }
} as const;
