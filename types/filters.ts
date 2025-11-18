/**
 * Advanced Filter Types
 * Type definitions for the advanced table filtering system
 */

import type { ProductWithCalculations } from './database';

/**
 * Field types for filtering
 */
export type FilterFieldType = 'text' | 'number' | 'date' | 'boolean' | 'enum';

/**
 * Text operators
 */
export type TextOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'not_contains';

/**
 * Number operators
 */
export type NumberOperator = 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal' | 'between';

/**
 * Date operators
 */
export type DateOperator = 'before' | 'after' | 'between' | 'equals';

/**
 * All filter operators
 */
export type FilterOperator = TextOperator | NumberOperator | DateOperator;

/**
 * Filterable field configuration
 */
export interface FilterFieldConfig {
  key: keyof ProductWithCalculations;
  label: string;
  type: FilterFieldType;
  operators: FilterOperator[];
}

/**
 * Single filter condition
 */
export interface FilterCondition {
  id: string;
  field: keyof ProductWithCalculations;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator (range end)
  type: FilterFieldType;
}

/**
 * Group of filter conditions with AND/OR logic
 */
export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

/**
 * Available filter fields (Phase 1 - MVP)
 */
export const FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: 'eol_date',
    label: 'EOL Date',
    type: 'date',
    operators: ['before', 'after', 'between', 'equals']
  },
  {
    key: 'months_of_stock',
    label: 'Months of Stock',
    type: 'number',
    operators: ['equals', 'greater_than', 'greater_than_or_equal', 'less_than', 'less_than_or_equal', 'between']
  },
  {
    key: 'monthly_sales',
    label: 'Avg Monthly Sales',
    type: 'number',
    operators: ['equals', 'greater_than', 'greater_than_or_equal', 'less_than', 'less_than_or_equal', 'between']
  },
  {
    key: 'stock_regular',
    label: 'Stock (Regular)',
    type: 'number',
    operators: ['equals', 'greater_than', 'greater_than_or_equal', 'less_than', 'less_than_or_equal', 'between']
  },
  {
    key: 'product_name',
    label: 'Product Name',
    type: 'text',
    operators: ['contains', 'equals', 'starts_with', 'ends_with']
  },
  {
    key: 'product_code',
    label: 'Product Code',
    type: 'text',
    operators: ['contains', 'equals', 'starts_with', 'ends_with']
  },
  {
    key: 'rrp_eur',
    label: 'Price (EUR)',
    type: 'number',
    operators: ['equals', 'greater_than', 'less_than', 'between']
  },
  {
    key: 'current_phase',
    label: 'Phase',
    type: 'number',
    operators: ['equals']
  }
];

/**
 * Operator labels for UI
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  // Text
  contains: 'Contains',
  equals: 'Equals',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  not_contains: 'Does not contain',

  // Number
  not_equals: 'Not equals',
  greater_than: 'Greater than',
  greater_than_or_equal: 'Greater than or equal',
  less_than: 'Less than',
  less_than_or_equal: 'Less than or equal',
  between: 'Between',

  // Date
  before: 'Before',
  after: 'After'
};
