/**
 * AFAS to Supabase Field Mapping Configuration
 *
 * This file defines how data from 5 AFAS connectors maps to the Supabase products table
 */

// Type definitions for AFAS data
export interface AfasItem {
  Type_item: string;
  ItemCode: string;
  Omschrijving: string;
  Group: string;
  Geblokkeerd: boolean;
  LowestSalesPrice: number;
  Minimum_voorraad: number | null;
  Aanvullen_tot: number | null;
}

export interface AfasSalesPrice {
  Type_item: string;
  Itemcode: string;
  Currency: string;
  SalesPrice: number;
  CurrentPrice: boolean;
}

export interface AfasStock {
  Type_item: string;
  ItemCode: string;
  Warehouse: string;
  Stock: number;
  In_bestelling: number;
  Totaal_gereserveerd: number;
  EconomicalStock: number;
}

export interface AfasCumulativeSales {
  Jaar: number;
  Periodenummer: number;
  Code: string;
  Itemcode: string;
  Aantal: number;
}

export interface AfasUnitPerItem {
  ItemType: string;
  ItemCode: string;
  UnitId: string;
  Amount: number;
}

export interface SupabaseProduct {
  product_code: string;
  product_name: string;
  artikelgroep: string | null;
  product_blocked: boolean;
  supplier?: string | null; // Optional - from manual import, not AFAS
  rrp_eur: number | null;
  rrp_gbp: number | null;
  rrp_usd: number | null;
  msp: number | null;
  stock_regular: number;
  stock_on_order: number;
  stock_reserved: number;
  stock_economic: number;
  stock_minimum: number | null;
  stock_replenish_to: number | null;
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
  unit_per_dozen: number | null;
  unit_per_pallet: number | null;
  unit_per_outer_dozen: number | null;
}

/**
 * Aggregate stock data from multiple warehouses for a single product
 */
export function aggregateStockByProduct(
  productCode: string,
  stockRecords: AfasStock[]
): {
  stock_regular: number;
  stock_on_order: number;
  stock_reserved: number;
  stock_economic: number;
} {
  const productStocks = stockRecords.filter(
    (s) => s.ItemCode === productCode
  );

  return {
    stock_regular: productStocks.reduce((sum, s) => sum + s.Stock, 0),
    stock_on_order: productStocks.reduce((sum, s) => sum + s.In_bestelling, 0),
    stock_reserved: productStocks.reduce((sum, s) => sum + s.Totaal_gereserveerd, 0),
    stock_economic: productStocks.reduce((sum, s) => sum + s.EconomicalStock, 0)
  };
}

/**
 * Extract prices by currency for a product
 */
export function getPricesByCurrency(
  productCode: string,
  priceRecords: AfasSalesPrice[]
): {
  rrp_eur: number | null;
  rrp_gbp: number | null;
  rrp_usd: number | null;
} {
  const productPrices = priceRecords.filter(
    (p) => p.Itemcode === productCode && p.CurrentPrice === true
  );

  return {
    rrp_eur: productPrices.find((p) => p.Currency === 'EUR')?.SalesPrice || null,
    rrp_gbp: productPrices.find((p) => p.Currency === 'GBP')?.SalesPrice || null,
    rrp_usd: productPrices.find((p) => p.Currency === 'USD')?.SalesPrice || null
  };
}

/**
 * Calculate rolling 12-month sales from cumulative sales data
 * Returns array of 12 months (most recent month first)
 */
export function calculateRolling12MonthSales(
  productCode: string,
  salesRecords: AfasCumulativeSales[]
): {
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
} {
  // Filter sales for this product
  const productSales = salesRecords.filter(
    (s) => s.Itemcode === productCode
  );

  if (productSales.length === 0) {
    return {
      sales_month_1: 0,
      sales_month_2: 0,
      sales_month_3: 0,
      sales_month_4: 0,
      sales_month_5: 0,
      sales_month_6: 0,
      sales_month_7: 0,
      sales_month_8: 0,
      sales_month_9: 0,
      sales_month_10: 0,
      sales_month_11: 0,
      sales_month_12: 0,
      months_of_data: 12
    };
  }

  // Get current date to determine rolling window
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Calculate the last complete month
  const lastCompleteMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastCompleteYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Build array of last 12 complete months
  const months: Array<{ year: number; month: number }> = [];
  for (let i = 0; i < 12; i++) {
    let year = lastCompleteYear;
    let month = lastCompleteMonth - i;

    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    months.unshift({ year, month }); // Add to beginning so oldest is first
  }

  // Map sales data to the 12 months
  const salesByMonth = months.map(({ year, month }) => {
    const sale = productSales.find(
      (s) => s.Jaar === year && s.Periodenummer === month
    );
    return sale ? sale.Aantal : 0;
  });

  return {
    sales_month_1: salesByMonth[0] || 0,
    sales_month_2: salesByMonth[1] || 0,
    sales_month_3: salesByMonth[2] || 0,
    sales_month_4: salesByMonth[3] || 0,
    sales_month_5: salesByMonth[4] || 0,
    sales_month_6: salesByMonth[5] || 0,
    sales_month_7: salesByMonth[6] || 0,
    sales_month_8: salesByMonth[7] || 0,
    sales_month_9: salesByMonth[8] || 0,
    sales_month_10: salesByMonth[9] || 0,
    sales_month_11: salesByMonth[10] || 0,
    sales_month_12: salesByMonth[11] || 0,
    months_of_data: 12
  };
}

/**
 * Calculate average monthly sales based on active selling period
 */
export function calculateMonthlySales(salesMonths: number[]): number {
  const firstNonZero = salesMonths.findIndex((val) => val > 0);
  const lastNonZero = salesMonths.findLastIndex((val) => val > 0);

  if (firstNonZero === -1) return 0;

  const activePeriodMonths = lastNonZero - firstNonZero + 1;
  const total = salesMonths
    .slice(firstNonZero, lastNonZero + 1)
    .reduce((sum, val) => sum + val, 0);

  return Math.round(total / activePeriodMonths);
}

/**
 * Extract packaging units for a product
 */
export function getPackagingUnits(
  productCode: string,
  unitRecords: AfasUnitPerItem[]
): {
  unit_per_dozen: number | null;
  unit_per_pallet: number | null;
  unit_per_outer_dozen: number | null;
} {
  const productUnits = unitRecords.filter(
    (u) => u.ItemCode === productCode
  );

  return {
    unit_per_dozen: productUnits.find((u) => u.UnitId === 'DOZ')?.Amount || null,
    unit_per_pallet: productUnits.find((u) => u.UnitId === 'PAL')?.Amount || null,
    unit_per_outer_dozen: productUnits.find((u) => u.UnitId === 'ODZ')?.Amount || null
  };
}

/**
 * Transform AFAS data to Supabase product format
 * This is the main transformation function that combines data from all 5 connectors
 */
export function transformToSupabaseProduct(
  item: AfasItem,
  priceRecords: AfasSalesPrice[],
  stockRecords: AfasStock[],
  salesRecords: AfasCumulativeSales[],
  unitRecords: AfasUnitPerItem[]
): SupabaseProduct {
  // Get prices by currency
  const prices = getPricesByCurrency(item.ItemCode, priceRecords);

  // Aggregate stock from all warehouses
  const stock = aggregateStockByProduct(item.ItemCode, stockRecords);

  // Calculate 12-month sales
  const sales = calculateRolling12MonthSales(item.ItemCode, salesRecords);

  // Get packaging units
  const units = getPackagingUnits(item.ItemCode, unitRecords);

  // Calculate monthly sales average
  const salesArray = [
    sales.sales_month_1,
    sales.sales_month_2,
    sales.sales_month_3,
    sales.sales_month_4,
    sales.sales_month_5,
    sales.sales_month_6,
    sales.sales_month_7,
    sales.sales_month_8,
    sales.sales_month_9,
    sales.sales_month_10,
    sales.sales_month_11,
    sales.sales_month_12
  ];
  const monthly_sales = calculateMonthlySales(salesArray);

  return {
    product_code: item.ItemCode,
    product_name: item.Omschrijving,
    artikelgroep: item.Group || null,
    product_blocked: item.Geblokkeerd,
    rrp_eur: prices.rrp_eur,
    rrp_gbp: prices.rrp_gbp,
    rrp_usd: prices.rrp_usd,
    msp: item.LowestSalesPrice || null,
    stock_regular: stock.stock_regular,
    stock_on_order: stock.stock_on_order,
    stock_reserved: stock.stock_reserved,
    stock_economic: stock.stock_economic,
    stock_minimum: item.Minimum_voorraad,
    stock_replenish_to: item.Aanvullen_tot,
    monthly_sales: monthly_sales,
    sales_month_1: sales.sales_month_1,
    sales_month_2: sales.sales_month_2,
    sales_month_3: sales.sales_month_3,
    sales_month_4: sales.sales_month_4,
    sales_month_5: sales.sales_month_5,
    sales_month_6: sales.sales_month_6,
    sales_month_7: sales.sales_month_7,
    sales_month_8: sales.sales_month_8,
    sales_month_9: sales.sales_month_9,
    sales_month_10: sales.sales_month_10,
    sales_month_11: sales.sales_month_11,
    sales_month_12: sales.sales_month_12,
    months_of_data: sales.months_of_data,
    unit_per_dozen: units.unit_per_dozen,
    unit_per_pallet: units.unit_per_pallet,
    unit_per_outer_dozen: units.unit_per_outer_dozen
  };
}
