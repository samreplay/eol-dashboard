/**
 * Article Group Mappings
 * Maps AFAS article group codes to their descriptive names
 */

export const ARTICLE_GROUPS: Record<string, string> = {
  'CLAIM': 'Claims',
  '25': 'Concentration Rooms',
  '21': 'Corporate Health Software',
  '17': 'CPU Holders',
  '27': 'Desk Screens',
  '28': 'Desk Screens - Accessories',
  '29': 'Desk Screens - Specials',
  'DIENST': 'Diensten',
  '07': 'Document Holders',
  '30': 'Document Holders - Specials',
  '50': 'Ergonomic Chairs',
  '11': 'Footrests',
  '31': 'Footrests - Specials',
  '32': 'Headsets',
  '33': 'Headsets - Accessories',
  '02': 'Keyboards - Compact',
  '34': 'Keyboards - Numeric',
  '36': 'Keyboards - Specials',
  '35': 'Keyboards - Split',
  '24': 'Laptop Bags',
  '38': 'Laptop Bags - Specials',
  '01': 'Laptop Stands',
  '37': 'Laptop Stands - Specials',
  '39': 'Lighting',
  '40': 'Marketing Materials',
  '06': 'Mice - Central',
  '04': 'Mice - Evoluent',
  '41': 'Mice - Evoluent VM',
  '05': 'Mice - Neutral',
  '42': 'Mice - Precision',
  '43': 'Mice - Specials',
  '03': 'Mice - Vertical',
  '44': 'Monitor Arms - Filex',
  '45': 'Monitor Arms - Filex Electrification',
  '09': 'Monitor Arms - Several',
  '10': 'Monitor Arms - Space',
  '08': 'Monitor Stands',
  '46': 'Monitor Stands - Specials',
  '16': 'Mouse Pads',
  '48': 'Mouse Pads & Wrist Rests Specials',
  '12': 'Office Chairs - Accessories',
  '49': 'Office Chairs - Several',
  '23': 'Privacy Filters',
  'PRO': 'Projects',
  '52': 'Refunds & Commissions',
  '51': 'Rental Hardware',
  '18': 'Saddle Chairs',
  '19': 'Several - do not use',
  '14': 'Sit Stand Desk Risers',
  '15': 'Sit Stand Desks',
  '20': 'Sit Stand Desks - Accessoires',
  '13': 'Tablet Holders',
  '22': 'Transport cost',
  '47': 'Wrist Rests'
};

/**
 * Get the descriptive name for an article group code
 * @param code - The article group code from AFAS
 * @returns The descriptive name, or the code itself if not found
 */
export function getArticleGroupName(code: string | null): string {
  if (!code) return 'Unknown';
  return ARTICLE_GROUPS[code] || code;
}

/**
 * Get formatted display string with code and name
 * @param code - The article group code from AFAS
 * @returns Formatted string like "01 - Laptop Stands"
 */
export function getArticleGroupDisplay(code: string | null): string {
  if (!code) return 'Unknown';
  const name = ARTICLE_GROUPS[code];
  return name ? `${code} - ${name}` : code;
}
