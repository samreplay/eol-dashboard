import type { Product, EOLPhase, ProductWithCalculations } from '~/types/database';

/**
 * Calculate the number of months of stock remaining
 * @param stockQuantity Current stock quantity
 * @param monthlySales Average monthly sales
 * @returns Number of months of stock remaining, or null if monthlySales is 0
 */
export function calculateMonthsOfStock(stockQuantity: number, monthlySales: number): number | null {
  if (monthlySales <= 0) return null;
  return Math.round((stockQuantity / monthlySales) * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate days since EOL date
 * @param eolDate EOL date as ISO string or null
 * @returns Number of days since EOL, or null if no EOL date
 */
export function calculateDaysSinceEOL(eolDate: string | null): number | null {
  if (!eolDate) return null;

  const eol = new Date(eolDate);
  const today = new Date();
  const diffTime = today.getTime() - eol.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculate the appropriate phase for a product based on business rules
 *
 * Phase Rules:
 * - Phase 0 (Green): In stock and portfolio product, no EOL date
 * - Phase 1 (Purple): EOL date set, phasing out (internal knowledge)
 * - Phase 2 (Orange): Sell out started - stock < 1 month OR > 11 months from EOL
 * - Phase 3 (Red): Stock depleted (quantity <= 0)
 * - Phase 4 (Blue): After 12+ months from EOL, still has stock
 *
 * @param product Product data
 * @returns Calculated phase (0-4)
 */
export function calculateProductPhase(product: Product): EOLPhase {
  const { stock_regular, monthly_sales, eol_date, product_blocked } = product;

  // Phase 3: Stock is depleted
  if (stock_regular <= 0) {
    return 3;
  }

  // If no EOL date is set, product is in Phase 0 (active product)
  // Note: product_blocked status is tracked but doesn't change phase without eol_date
  if (!eol_date) {
    return 0;
  }

  const daysSinceEOL = calculateDaysSinceEOL(eol_date);
  const monthsOfStock = calculateMonthsOfStock(stock_regular, monthly_sales);

  // Phase 4: More than 12 months (365 days) since EOL and still has stock
  if (daysSinceEOL !== null && daysSinceEOL > 365) {
    return 4;
  }

  // Phase 2: Sell out started
  // Trigger: Stock < 1 month OR more than 11 months (335 days) since EOL
  const stockLessThanOneMonth = monthsOfStock !== null && monthsOfStock < 1;
  const moreThan11MonthsSinceEOL = daysSinceEOL !== null && daysSinceEOL > 335;

  if (stockLessThanOneMonth || moreThan11MonthsSinceEOL) {
    return 2;
  }

  // Phase 1: EOL date is set but conditions for Phase 2 not met yet
  return 1;
}

/**
 * Enhance a product with calculated fields
 * @param product Product data
 * @returns Product with additional calculated fields
 */
export function enhanceProduct(product: Product): ProductWithCalculations {
  return {
    ...product,
    months_of_stock: calculateMonthsOfStock(product.stock_regular, product.monthly_sales) ?? 0,
    days_since_eol: calculateDaysSinceEOL(product.eol_date),
    calculated_phase: calculateProductPhase(product)
  };
}

/**
 * Check if a product's phase should be updated
 * @param product Product data
 * @returns True if phase needs updating
 */
export function shouldUpdatePhase(product: Product): boolean {
  const calculatedPhase = calculateProductPhase(product);
  return calculatedPhase !== product.current_phase;
}

/**
 * Get phase label and color information
 * @param phase Phase number (0-4)
 * @returns Phase configuration object
 */
export function getPhaseInfo(phase: EOLPhase) {
  const PHASE_CONFIG = {
    0: {
      label: 'In Stock',
      description: 'In stock and portfolio product - no action required',
      color: 'green',
      colorClass: 'phase-0',
      bgClass: 'bg-green-500',
      textClass: 'text-green-600',
      borderClass: 'border-green-500'
    },
    1: {
      label: 'Phasing Out',
      description: 'Phasing out - only portfolio team knows',
      color: 'purple',
      colorClass: 'phase-1',
      bgClass: 'bg-purple-500',
      textClass: 'text-purple-600',
      borderClass: 'border-purple-500'
    },
    2: {
      label: 'Sell Out Started',
      description: 'Sell out started - stock < 1 month or > 11 months from EOL',
      color: 'orange',
      colorClass: 'phase-2',
      bgClass: 'bg-orange-500',
      textClass: 'text-orange-600',
      borderClass: 'border-orange-500'
    },
    3: {
      label: 'Stock Depleted',
      description: 'Stock is depleted',
      color: 'red',
      colorClass: 'phase-3',
      bgClass: 'bg-red-500',
      textClass: 'text-red-600',
      borderClass: 'border-red-500'
    },
    4: {
      label: 'Action Required',
      description: 'After 12+ months, still has stock - action required',
      color: 'blue',
      colorClass: 'phase-4',
      bgClass: 'bg-blue-500',
      textClass: 'text-blue-600',
      borderClass: 'border-blue-500'
    }
  };

  return PHASE_CONFIG[phase];
}

/**
 * Format date to display format
 * @param dateString ISO date string
 * @returns Formatted date (DD-MM-YYYY)
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Format currency for display
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Generate month labels for the rolling 12-month window
 * @param monthsOfData Number of complete months (typically 12)
 * @returns Array of month labels like ["Nov 2024", "Dec 2024", ..., "Oct 2025"]
 */
export function generateMonthLabels(monthsOfData: number = 12): string[] {
  const labels: string[] = [];
  const now = new Date();

  // Start from the last complete month (current month - 1)
  // Then go back (monthsOfData - 1) more months
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsOfData, 1);

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    labels.push(`${monthName} ${year}`);
  }

  return labels;
}
